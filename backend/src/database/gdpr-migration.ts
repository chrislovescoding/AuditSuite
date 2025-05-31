export const gdprMigration = {
  name: 'add_gdpr_compliance_tables',
  up: async (client: any) => {
    console.log('🔐 Adding GDPR compliance tables and columns...');
    
    // GDPR Data Subject Requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gdpr_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL CHECK (type IN ('access', 'rectification', 'erasure', 'portability', 'restriction')),
        subject_email VARCHAR(255) NOT NULL,
        requested_by UUID REFERENCES users(id),
        status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
        reason TEXT,
        data_export JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(subject_email, type, created_at)
      );
    `);
    
    // Add comments for documentation
    await client.query(`
      COMMENT ON TABLE gdpr_requests IS 'GDPR Data Subject Requests - Article 15-20 compliance';
      COMMENT ON COLUMN gdpr_requests.type IS 'Type of GDPR request: access, rectification, erasure, portability, restriction';
      COMMENT ON COLUMN gdpr_requests.subject_email IS 'Email of the data subject making the request';
      COMMENT ON COLUMN gdpr_requests.requested_by IS 'User ID of the person processing the request';
      COMMENT ON COLUMN gdpr_requests.data_export IS 'JSON export of data for access/portability requests';
      COMMENT ON COLUMN gdpr_requests.legal_basis IS 'Legal basis for processing under GDPR Article 6';
    `);
    
    // Data retention policies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_retention_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name VARCHAR(100) NOT NULL UNIQUE,
        retention_period_days INTEGER NOT NULL CHECK (retention_period_days > 0),
        legal_basis TEXT NOT NULL,
        description TEXT,
        last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    await client.query(`
      COMMENT ON TABLE data_retention_policies IS 'Data retention policies for GDPR compliance';
      COMMENT ON COLUMN data_retention_policies.retention_period_days IS 'Number of days to retain data (2555 = 7 years for UK audit)';
      COMMENT ON COLUMN data_retention_policies.legal_basis IS 'Legal justification for data retention';
    `);
    
    // Insert default retention policies for UK audit compliance
    await client.query(`
      INSERT INTO data_retention_policies (
        table_name, 
        retention_period_days, 
        legal_basis, 
        description
      ) VALUES 
        (
          'users', 
          2555, 
          'Local Audit and Accountability Act 2014 - Section 3', 
          'User accounts for audit trail and accountability'
        ),
        (
          'documents', 
          2555, 
          'Local Audit and Accountability Act 2014 - Section 3', 
          'Audit documents and supporting evidence'
        ),
        (
          'audit_logs', 
          2555, 
          'Local Audit and Accountability Act 2014 - Section 3', 
          'System audit trail for security and compliance'
        ),
        (
          'gdpr_requests', 
          2555, 
          'GDPR Article 30 - Records of processing activities', 
          'GDPR compliance documentation and request history'
        )
      ON CONFLICT (table_name) DO UPDATE SET
        retention_period_days = EXCLUDED.retention_period_days,
        legal_basis = EXCLUDED.legal_basis,
        description = EXCLUDED.description,
        last_reviewed_at = NOW(),
        updated_at = NOW();
    `);
    
    // Add GDPR compliance columns to existing users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS consent_version VARCHAR(10) DEFAULT '1.0',
      ADD COLUMN IF NOT EXISTS last_privacy_policy_acceptance TIMESTAMP WITH TIME ZONE;
    `);
    
    await client.query(`
      COMMENT ON COLUMN users.gdpr_consent_date IS 'Date when user provided GDPR consent';
      COMMENT ON COLUMN users.data_processing_consent IS 'Consent for data processing under GDPR Article 6';
      COMMENT ON COLUMN users.marketing_consent IS 'Consent for marketing communications (separate from audit function)';
      COMMENT ON COLUMN users.consent_version IS 'Version of privacy policy user consented to';
    `);
    
    // Update existing users with consent date (for existing users, set to account creation)
    await client.query(`
      UPDATE users 
      SET gdpr_consent_date = created_at,
          consent_version = '1.0'
      WHERE gdpr_consent_date IS NULL;
    `);
    
    // Add GDPR compliance columns to documents table
    await client.query(`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS data_classification VARCHAR(50) DEFAULT 'standard',
      ADD COLUMN IF NOT EXISTS retention_period_days INTEGER DEFAULT 2555,
      ADD COLUMN IF NOT EXISTS legal_basis TEXT DEFAULT 'Public task (GDPR Article 6.1.e)',
      ADD COLUMN IF NOT EXISTS data_subjects JSONB DEFAULT '[]'::jsonb;
    `);
    
    await client.query(`
      COMMENT ON COLUMN documents.data_classification IS 'Data sensitivity: public, internal, confidential, sensitive';
      COMMENT ON COLUMN documents.retention_period_days IS 'Specific retention period for this document';
      COMMENT ON COLUMN documents.legal_basis IS 'GDPR legal basis for processing this document';
      COMMENT ON COLUMN documents.data_subjects IS 'Array of email addresses of data subjects in document';
    `);
    
    // Index for GDPR requests (performance optimization)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_gdpr_requests_email_type 
      ON gdpr_requests(subject_email, type);
      
      CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status_created 
      ON gdpr_requests(status, created_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_gdpr_requests_requested_by 
      ON gdpr_requests(requested_by, created_at DESC);
    `);
    
    // Index for audit logs by user (for GDPR access requests)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date 
      ON audit_logs(user_id, created_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action_date 
      ON audit_logs(action, created_at DESC);
    `);
    
    // Index for documents by uploader and date
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_uploader_date 
      ON documents(uploaded_by, created_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_documents_data_subjects 
      ON documents USING GIN(data_subjects);
    `);
    
    // Create view for GDPR compliance reporting
    await client.query(`
      CREATE OR REPLACE VIEW gdpr_compliance_summary AS
      SELECT 
        'Data Subject Requests' as metric,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
      FROM gdpr_requests
      
      UNION ALL
      
      SELECT 
        'Active Users' as metric,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE status = 'active') as completed_count,
        COUNT(*) FILTER (WHERE status = 'pending_approval') as pending_count,
        COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '30 days') as last_30_days
      FROM users
      
      UNION ALL
      
      SELECT 
        'Documents' as metric,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE processed = true) as completed_count,
        COUNT(*) FILTER (WHERE processed = false) as pending_count,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
      FROM documents;
    `);
    
    // Create function to automatically delete expired data (for retention compliance)
    await client.query(`
      CREATE OR REPLACE FUNCTION cleanup_expired_data()
      RETURNS TABLE(
        table_name TEXT,
        records_deleted BIGINT,
        retention_days INTEGER
      ) 
      LANGUAGE plpgsql
      AS $$
      DECLARE
        policy RECORD;
        deleted_count BIGINT;
      BEGIN
        -- Loop through each retention policy
        FOR policy IN 
          SELECT drp.table_name, drp.retention_period_days 
          FROM data_retention_policies drp
        LOOP
          deleted_count := 0;
          
          -- Only delete non-active records that exceed retention
          IF policy.table_name = 'users' THEN
            DELETE FROM users 
            WHERE created_at < NOW() - (policy.retention_period_days || ' days')::INTERVAL
              AND status IN ('inactive', 'suspended');
            GET DIAGNOSTICS deleted_count = ROW_COUNT;
            
          ELSIF policy.table_name = 'audit_logs' THEN
            -- Keep audit logs for full retention period regardless of user status
            DELETE FROM audit_logs 
            WHERE created_at < NOW() - (policy.retention_period_days || ' days')::INTERVAL;
            GET DIAGNOSTICS deleted_count = ROW_COUNT;
            
          ELSIF policy.table_name = 'gdpr_requests' THEN
            -- Keep GDPR requests for full retention period
            DELETE FROM gdpr_requests 
            WHERE created_at < NOW() - (policy.retention_period_days || ' days')::INTERVAL;
            GET DIAGNOSTICS deleted_count = ROW_COUNT;
          END IF;
          
          -- Return results
          table_name := policy.table_name;
          records_deleted := deleted_count;
          retention_days := policy.retention_period_days;
          RETURN NEXT;
        END LOOP;
      END;
      $$;
    `);
    
    await client.query(`
      COMMENT ON FUNCTION cleanup_expired_data() IS 'Automatically removes data that exceeds retention policies for GDPR compliance';
    `);
    
    // Create trigger function to log GDPR-related activities
    await client.query(`
      CREATE OR REPLACE FUNCTION log_gdpr_activity()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Log GDPR request changes
        IF TG_TABLE_NAME = 'gdpr_requests' THEN
          INSERT INTO audit_logs (
            user_id, action, resource_type, resource_id, details, created_at
          ) VALUES (
            NEW.requested_by,
            CASE 
              WHEN TG_OP = 'INSERT' THEN 'GDPR_REQUEST_CREATED'
              WHEN TG_OP = 'UPDATE' THEN 'GDPR_REQUEST_UPDATED'
              ELSE 'GDPR_REQUEST_DELETED'
            END,
            'gdpr_request',
            NEW.id,
            jsonb_build_object(
              'request_type', NEW.type,
              'subject_email', NEW.subject_email,
              'status', NEW.status,
              'compliance_framework', 'GDPR + UK DPA 2018'
            ),
            NOW()
          );
        END IF;
        
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create triggers for GDPR audit logging
    await client.query(`
      DROP TRIGGER IF EXISTS gdpr_requests_audit_trigger ON gdpr_requests;
      CREATE TRIGGER gdpr_requests_audit_trigger
        AFTER INSERT OR UPDATE OR DELETE ON gdpr_requests
        FOR EACH ROW EXECUTE FUNCTION log_gdpr_activity();
    `);
    
    console.log('✅ GDPR compliance tables and indexes created successfully');
    console.log('📋 Default retention policies set for UK audit compliance (7 years)');
    console.log('🔍 Audit triggers and functions enabled');
  },
  
  down: async (client: any) => {
    console.log('❌ Removing GDPR compliance features...');
    
    // Drop triggers
    await client.query(`DROP TRIGGER IF EXISTS gdpr_requests_audit_trigger ON gdpr_requests;`);
    
    // Drop functions
    await client.query(`DROP FUNCTION IF EXISTS log_gdpr_activity();`);
    await client.query(`DROP FUNCTION IF EXISTS cleanup_expired_data();`);
    
    // Drop view
    await client.query(`DROP VIEW IF EXISTS gdpr_compliance_summary;`);
    
    // Drop indexes
    await client.query(`DROP INDEX IF EXISTS idx_gdpr_requests_email_type;`);
    await client.query(`DROP INDEX IF EXISTS idx_gdpr_requests_status_created;`);
    await client.query(`DROP INDEX IF EXISTS idx_gdpr_requests_requested_by;`);
    await client.query(`DROP INDEX IF EXISTS idx_audit_logs_user_date;`);
    await client.query(`DROP INDEX IF EXISTS idx_audit_logs_action_date;`);
    await client.query(`DROP INDEX IF EXISTS idx_documents_uploader_date;`);
    await client.query(`DROP INDEX IF EXISTS idx_documents_data_subjects;`);
    
    // Remove GDPR columns from existing tables
    await client.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS gdpr_consent_date,
      DROP COLUMN IF EXISTS data_processing_consent,
      DROP COLUMN IF EXISTS marketing_consent,
      DROP COLUMN IF EXISTS consent_version,
      DROP COLUMN IF EXISTS last_privacy_policy_acceptance;
    `);
    
    await client.query(`
      ALTER TABLE documents 
      DROP COLUMN IF EXISTS data_classification,
      DROP COLUMN IF EXISTS retention_period_days,
      DROP COLUMN IF EXISTS legal_basis,
      DROP COLUMN IF EXISTS data_subjects;
    `);
    
    // Drop tables
    await client.query(`DROP TABLE IF EXISTS gdpr_requests;`);
    await client.query(`DROP TABLE IF EXISTS data_retention_policies;`);
    
    console.log('❌ GDPR compliance features removed');
  }
}; 