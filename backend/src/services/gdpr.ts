import pool, { executeAuditQuery } from '../database/config';
import { v4 as uuidv4 } from 'uuid';

export interface DataSubjectRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  subject_email: string;
  requested_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  reason?: string;
  created_at: Date;
  completed_at?: Date;
  data_export?: object;
}

export interface GDPRExportData {
  personal_data: any;
  documents: any[];
  recent_activity: any[];
  export_date: string;
  retention_policy: string;
  contact_dpo: string;
  legal_basis: string;
  data_controller: string;
}

export class GDPRService {
  
  /**
   * Article 15 GDPR - Right of Access
   * Provides data subject with copy of their personal data
   */
  async handleDataAccessRequest(subjectEmail: string, requestedBy: string): Promise<GDPRExportData> {
    const client = await pool.connect();
    
    try {
      // Log the request for audit trail
      await this.logGDPRRequest('access', subjectEmail, requestedBy);
      
      // Collect all personal data - users table
      const userData = await client.query(`
        SELECT 
          id, email, first_name, last_name, role, department, phone_number, 
          last_login_at, created_at, updated_at, status,
          gdpr_consent_date, data_processing_consent, marketing_consent
        FROM users 
        WHERE email = $1
      `, [subjectEmail]);
      
      // Collect document metadata (not content for privacy)
      const userDocuments = await client.query(`
        SELECT 
          filename, original_name, file_size, upload_date, 
          mime_type, processed, created_at
        FROM documents 
        WHERE uploaded_by = (SELECT id FROM users WHERE email = $1)
        ORDER BY created_at DESC
      `, [subjectEmail]);
      
      // Collect recent audit logs (last 100 entries)
      const auditLogs = await client.query(`
        SELECT 
          action, resource_type, resource_id, created_at, 
          ip_address, user_agent,
          (details->>'gdpr_compliance')::text as gdpr_compliance
        FROM audit_logs 
        WHERE user_id = (SELECT id FROM users WHERE email = $1)
        ORDER BY created_at DESC
        LIMIT 100
      `, [subjectEmail]);
      
      // Collect GDPR request history
      const gdprRequests = await client.query(`
        SELECT 
          type, status, reason, created_at, completed_at
        FROM gdpr_requests 
        WHERE subject_email = $1
        ORDER BY created_at DESC
      `, [subjectEmail]);
      
      const exportData: GDPRExportData = {
        personal_data: userData.rows[0] || null,
        documents: userDocuments.rows,
        recent_activity: auditLogs.rows,
        export_date: new Date().toISOString(),
        retention_policy: 'Data retained for 7 years as per UK audit requirements (Local Audit and Accountability Act 2014)',
        contact_dpo: process.env.DATA_PROTECTION_OFFICER_EMAIL || 'dpo@your-council.gov.uk',
        legal_basis: 'Public task (GDPR Article 6.1.e) - Local government audit function',
        data_controller: process.env.ORGANIZATION_NAME || 'UK Local Authority'
      };
      
      await this.completeGDPRRequest(subjectEmail, 'access', exportData);
      
      return exportData;
      
    } finally {
      client.release();
    }
  }
  
  /**
   * Article 16 GDPR - Right to Rectification
   * Allows correction of inaccurate personal data
   */
  async handleDataRectificationRequest(
    subjectEmail: string, 
    requestedBy: string, 
    corrections: { [key: string]: any }
  ): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verify user exists
      const user = await client.query(`
        SELECT id FROM users WHERE email = $1
      `, [subjectEmail]);
      
      if (user.rows.length === 0) {
        throw new Error('User not found');
      }
      
      // Build update query for allowed fields only
      const allowedFields = ['first_name', 'last_name', 'phone_number', 'department'];
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 2;
      
      for (const [field, value] of Object.entries(corrections)) {
        if (allowedFields.includes(field)) {
          updateFields.push(`${field} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      }
      
      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      // Add updated_at timestamp
      updateFields.push(`updated_at = NOW()`);
      
      // Execute update
      await client.query(`
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE email = $1
      `, [subjectEmail, ...updateValues]);
      
      // Log the rectification
      await this.logGDPRRequest('rectification', subjectEmail, requestedBy, 'completed', 
        `Updated fields: ${Object.keys(corrections).join(', ')}`);
      
      await client.query('COMMIT');
      return true;
      
    } catch (error) {
      await client.query('ROLLBACK');
      await this.logGDPRRequest('rectification', subjectEmail, requestedBy, 'rejected', 
        `Error: ${(error as Error).message}`);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Article 17 GDPR - Right of Erasure (Right to be Forgotten)
   * Deletes personal data when legally permitted
   */
  async handleDataErasureRequest(subjectEmail: string, requestedBy: string): Promise<{
    success: boolean;
    reason?: string;
  }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if data can be erased (not required for legal obligations)
      const user = await client.query(`
        SELECT id, role FROM users WHERE email = $1
      `, [subjectEmail]);
      
      if (user.rows.length === 0) {
        throw new Error('User not found');
      }
      
      // UK audit requirements may prevent deletion
      // Check for documents uploaded in last 7 years (legal retention period)
      const hasAuditRequirements = await client.query(`
        SELECT COUNT(*) as count FROM documents 
        WHERE uploaded_by = $1 
        AND created_at > NOW() - INTERVAL '7 years'
      `, [user.rows[0].id]);
      
      // Check for active audits or ongoing investigations
      const hasActiveAudits = await client.query(`
        SELECT COUNT(*) as count FROM audit_logs 
        WHERE user_id = $1 
        AND action LIKE '%AUDIT%'
        AND created_at > NOW() - INTERVAL '1 year'
      `, [user.rows[0].id]);
      
      if (parseInt(hasAuditRequirements.rows[0].count) > 0 || 
          parseInt(hasActiveAudits.rows[0].count) > 0) {
        
        const reason = 'Cannot delete: Required for UK audit compliance (Local Audit and Accountability Act 2014 - 7 year retention) or active audit proceedings';
        
        await this.logGDPRRequest('erasure', subjectEmail, requestedBy, 'rejected', reason);
        await client.query('ROLLBACK');
        
        return {
          success: false,
          reason
        };
      }
      
      // If no legal basis to retain, proceed with erasure
      // Delete in order to respect foreign key constraints
      await client.query(`DELETE FROM audit_logs WHERE user_id = $1`, [user.rows[0].id]);
      await client.query(`DELETE FROM gdpr_requests WHERE subject_email = $1`, [subjectEmail]);
      await client.query(`DELETE FROM documents WHERE uploaded_by = $1`, [user.rows[0].id]);
      await client.query(`DELETE FROM users WHERE id = $1`, [user.rows[0].id]);
      
      await client.query('COMMIT');
      
      // Log successful erasure (this will be in audit logs of requesting user)
      await this.logGDPRRequest('erasure', subjectEmail, requestedBy, 'completed',
        'Personal data successfully erased in compliance with GDPR Article 17');
      
      return {
        success: true
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      await this.logGDPRRequest('erasure', subjectEmail, requestedBy, 'rejected', 
        `Error: ${(error as Error).message}`);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Article 20 GDPR - Right to Data Portability
   * Provides data in machine-readable format
   */
  async handleDataPortabilityRequest(subjectEmail: string, requestedBy: string): Promise<object> {
    const accessData = await this.handleDataAccessRequest(subjectEmail, requestedBy);
    
    // Format for portability (structured, commonly used format)
    const portableData = {
      format: 'JSON',
      version: '1.0',
      standard: 'GDPR Article 20 Compliant',
      exported_by: 'AuditSuite-GDPR-System',
      exported_at: new Date().toISOString(),
      subject_email: subjectEmail,
      data_controller: accessData.data_controller,
      legal_basis: accessData.legal_basis,
      data: {
        personal_information: accessData.personal_data,
        document_metadata: accessData.documents,
        activity_history: accessData.recent_activity
      },
      instructions: 'This data export complies with GDPR Article 20 requirements for data portability. The data is provided in a structured, commonly used and machine-readable format.',
      technical_notes: {
        character_encoding: 'UTF-8',
        date_format: 'ISO 8601',
        timezone: 'UTC',
        null_values: 'Represented as null'
      }
    };
    
    await this.logGDPRRequest('portability', subjectEmail, requestedBy, 'completed', 
      'Data export provided in machine-readable JSON format');
    
    return portableData;
  }
  
  /**
   * Article 18 GDPR - Right to Restriction of Processing
   * Restricts processing while maintaining data
   */
  async handleDataRestrictionRequest(
    subjectEmail: string, 
    requestedBy: string, 
    reason: string
  ): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      // Add restriction flag to user account
      await client.query(`
        UPDATE users 
        SET 
          status = 'restricted',
          updated_at = NOW()
        WHERE email = $1
      `, [subjectEmail]);
      
      await this.logGDPRRequest('restriction', subjectEmail, requestedBy, 'completed', 
        `Processing restricted. Reason: ${reason}`);
      
      return true;
      
    } catch (error) {
      await this.logGDPRRequest('restriction', subjectEmail, requestedBy, 'rejected', 
        `Error: ${(error as Error).message}`);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get all GDPR requests for an email
   */
  async getGDPRRequestHistory(subjectEmail: string): Promise<DataSubjectRequest[]> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          id, type, subject_email, status, reason, 
          created_at, completed_at
        FROM gdpr_requests 
        WHERE subject_email = $1
        ORDER BY created_at DESC
      `, [subjectEmail]);
      
      return result.rows;
      
    } finally {
      client.release();
    }
  }
  
  /**
   * Data retention compliance check
   */
  async checkDataRetentionCompliance(): Promise<{
    tables_checked: number;
    records_exceeding_retention: any[];
    compliance_status: 'compliant' | 'action_required';
  }> {
    const client = await pool.connect();
    
    try {
      const policies = await client.query(`
        SELECT table_name, retention_period_days, legal_basis
        FROM data_retention_policies
      `);
      
      const results = [];
      
      for (const policy of policies.rows) {
        let count = 0;
        
        if (policy.table_name === 'users') {
          const result = await client.query(`
            SELECT COUNT(*) as count FROM users 
            WHERE created_at < NOW() - INTERVAL '${policy.retention_period_days} days'
            AND status != 'active'
          `);
          count = parseInt(result.rows[0].count);
        } else if (policy.table_name === 'documents') {
          const result = await client.query(`
            SELECT COUNT(*) as count FROM documents 
            WHERE created_at < NOW() - INTERVAL '${policy.retention_period_days} days'
          `);
          count = parseInt(result.rows[0].count);
        } else if (policy.table_name === 'audit_logs') {
          const result = await client.query(`
            SELECT COUNT(*) as count FROM audit_logs 
            WHERE created_at < NOW() - INTERVAL '${policy.retention_period_days} days'
          `);
          count = parseInt(result.rows[0].count);
        }
        
        results.push({
          table: policy.table_name,
          retention_period_days: policy.retention_period_days,
          legal_basis: policy.legal_basis,
          records_exceeding_retention: count
        });
      }
      
      const totalExceeding = results.reduce((sum, r) => sum + r.records_exceeding_retention, 0);
      
      return {
        tables_checked: policies.rows.length,
        records_exceeding_retention: results.filter(r => r.records_exceeding_retention > 0),
        compliance_status: totalExceeding === 0 ? 'compliant' : 'action_required'
      };
      
    } finally {
      client.release();
    }
  }
  
  /**
   * Log GDPR request for audit trail
   */
  private async logGDPRRequest(
    type: string, 
    subjectEmail: string, 
    requestedBy: string, 
    status: string = 'completed',
    reason?: string
  ): Promise<void> {
    await executeAuditQuery(`
      INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, details, created_at, ip_address
      ) VALUES (
        (SELECT id FROM users WHERE email = $2),
        $1,
        'gdpr_request',
        $3,
        $4,
        NOW(),
        '127.0.0.1'
      )
    `, [
      `GDPR_${type.toUpperCase()}_REQUEST`,
      requestedBy,
      uuidv4(),
      JSON.stringify({
        subject_email: subjectEmail,
        request_type: type,
        status: status,
        reason: reason || null,
        compliance_framework: 'GDPR + UK DPA 2018',
        timestamp: new Date().toISOString(),
        legal_basis: 'Public task (Article 6.1.e)',
        data_controller: process.env.ORGANIZATION_NAME || 'UK Local Authority'
      })
    ], requestedBy, `GDPR_${type.toUpperCase()}_REQUEST`);
  }
  
  /**
   * Complete GDPR request and store result
   */
  private async completeGDPRRequest(
    subjectEmail: string, 
    type: string, 
    exportData?: object
  ): Promise<void> {
    await executeAuditQuery(`
      INSERT INTO gdpr_requests (
        id, type, subject_email, status, data_export, completed_at, created_at
      ) VALUES (
        $1, $2, $3, 'completed', $4, NOW(), NOW()
      ) ON CONFLICT (subject_email, type) 
      DO UPDATE SET 
        status = 'completed',
        data_export = $4,
        completed_at = NOW()
    `, [uuidv4(), type, subjectEmail, JSON.stringify(exportData || {})]);
  }
}

export default new GDPRService(); 