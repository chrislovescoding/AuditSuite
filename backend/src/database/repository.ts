import { db } from './config';
import { User, UserRole, UserStatus } from '../models/User';

export interface DatabaseUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  phone_number?: string;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export class UserRepository {
  /**
   * Convert database row to User model
   */
  private static mapRowToUser(row: DatabaseUser): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      status: row.status,
      department: row.department,
      phoneNumber: row.phone_number,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
    };
  }

  /**
   * Create a new user
   */
  static async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const query = `
      INSERT INTO users (
        email, password, first_name, last_name, role, status, 
        department, phone_number, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.role,
      user.status,
      user.department || null,
      user.phoneNumber || null,
      user.createdBy || null,
    ];

    const result = await db.query(query, values);
    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Update user
   */
  static async update(id: string, updates: Partial<User>): Promise<User> {
    const allowedFields = [
      'firstName', 'lastName', 'role', 'status', 'department', 
      'phoneNumber', 'lastLoginAt'
    ];
    
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = this.camelToSnake(key);
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`);
    values.push(id); // For WHERE clause

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Update user password
   */
  static async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const query = `
      UPDATE users 
      SET password = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    const result = await db.query(query, [hashedPassword, id]);
    
    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
  }

  /**
   * Update last login time
   */
  static async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `;
    
    await db.query(query, [id]);
  }

  /**
   * Get all users
   */
  static async findAll(): Promise<User[]> {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const result = await db.query(query);
    
    return result.rows.map((row: any) => this.mapRowToUser(row));
  }

  /**
   * Get users by role
   */
  static async findByRole(role: UserRole): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [role]);
    
    return result.rows.map((row: any) => this.mapRowToUser(row));
  }

  /**
   * Get users by status
   */
  static async findByStatus(status: UserStatus): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE status = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [status]);
    
    return result.rows.map((row: any) => this.mapRowToUser(row));
  }

  /**
   * Delete user (soft delete by setting status to inactive)
   */
  static async delete(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET status = 'inactive', updated_at = NOW()
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
  }

  /**
   * Hard delete user (permanent removal)
   */
  static async hardDelete(id: string): Promise<void> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string, excludeId?: string): Promise<boolean> {
    let query = 'SELECT 1 FROM users WHERE email = $1';
    const values = [email.toLowerCase()];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    const result = await db.query(query, values);
    return result.rows.length > 0;
  }

  /**
   * Get user statistics
   */
  static async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    pendingApproval: number;
    byRole: Record<UserRole, number>;
  }> {
    // Get total counts by status
    const statusQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended,
        COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_approval
      FROM users
    `;

    // Get counts by role
    const roleQuery = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;

    const [statusResult, roleResult] = await Promise.all([
      db.query(statusQuery),
      db.query(roleQuery)
    ]);

    const statusStats = statusResult.rows[0];
    const roleStats = roleResult.rows;

    // Initialize role counts
    const byRole: Record<UserRole, number> = {
      [UserRole.SYSTEM_ADMIN]: 0,
      [UserRole.LEAD_AUDITOR]: 0,
      [UserRole.SENIOR_AUDITOR]: 0,
      [UserRole.AUDITOR]: 0,
      [UserRole.ANALYST]: 0,
      [UserRole.EXTERNAL_REVIEWER]: 0,
      [UserRole.COUNCILLOR]: 0,
    };

    // Fill in actual counts
    roleStats.forEach((row: any) => {
      byRole[row.role as UserRole] = parseInt(row.count);
    });

    return {
      total: parseInt(statusStats.total),
      active: parseInt(statusStats.active),
      inactive: parseInt(statusStats.inactive),
      suspended: parseInt(statusStats.suspended),
      pendingApproval: parseInt(statusStats.pending_approval),
      byRole,
    };
  }

  /**
   * Convert camelCase to snake_case for database columns
   */
  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

// Export for audit logging
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export class AuditLogRepository {
  /**
   * Create audit log entry
   */
  static async create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const query = `
      INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, 
        details, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *, created_at
    `;

    const values = [
      log.userId || null,
      log.action,
      log.resourceType,
      log.resourceId || null,
      log.details ? JSON.stringify(log.details) : null,
      log.ipAddress || null,
      log.userAgent || null,
    ];

    const result = await db.query(query, values);
    const row = result.rows[0];

    return {
      id: row.id,
      userId: row.user_id,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      details: row.details,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    };
  }

  /**
   * Get audit logs with pagination
   */
  static async findWithPagination(
    page: number = 1, 
    limit: number = 50,
    filters?: {
      userId?: string;
      action?: string;
      resourceType?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const values: any[] = [];
    let paramIndex = 1;

    if (filters) {
      const conditions: string[] = [];
      
      if (filters.userId) {
        conditions.push(`user_id = $${paramIndex}`);
        values.push(filters.userId);
        paramIndex++;
      }
      
      if (filters.action) {
        conditions.push(`action = $${paramIndex}`);
        values.push(filters.action);
        paramIndex++;
      }
      
      if (filters.resourceType) {
        conditions.push(`resource_type = $${paramIndex}`);
        values.push(filters.resourceType);
        paramIndex++;
      }
      
      if (filters.fromDate) {
        conditions.push(`created_at >= $${paramIndex}`);
        values.push(filters.fromDate);
        paramIndex++;
      }
      
      if (filters.toDate) {
        conditions.push(`created_at <= $${paramIndex}`);
        values.push(filters.toDate);
        paramIndex++;
      }
      
      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get logs
    const logsQuery = `
      SELECT * FROM audit_logs 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values.push(limit, offset);

    const logsResult = await db.query(logsQuery, values);
    
    const logs: AuditLog[] = logsResult.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      details: row.details,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    }));

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
} 