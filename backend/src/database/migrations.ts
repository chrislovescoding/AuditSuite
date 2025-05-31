import { db } from './config';

export interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migration 001: Create users table
const migration001: Migration = {
  version: '001',
  description: 'Create users table and initial schema',
  up: async () => {
    console.log('🚀 Running migration 001: Create users table');
    
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN (
          'system_admin',
          'lead_auditor', 
          'senior_auditor',
          'auditor',
          'analyst',
          'external_reviewer',
          'councillor'
        )),
        status VARCHAR(30) NOT NULL DEFAULT 'pending_approval' CHECK (status IN (
          'active',
          'inactive', 
          'suspended',
          'pending_approval'
        )),
        department VARCHAR(100),
        phone_number VARCHAR(20),
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES users(id)
      )
    `);

    // Create index on email for faster lookups
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    // Create index on role for reporting
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `);

    // Create index on status for active user queries
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)
    `);

    console.log('✅ Migration 001 completed: Users table created');
  },
  down: async () => {
    console.log('🔄 Rolling back migration 001');
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✅ Migration 001 rolled back');
  }
};

// Migration 002: Create documents table (for future use)
const migration002: Migration = {
  version: '002',
  description: 'Create documents table',
  up: async () => {
    console.log('🚀 Running migration 002: Create documents table');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by UUID NOT NULL REFERENCES users(id),
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        processed BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_processed ON documents(processed)
    `);

    console.log('✅ Migration 002 completed: Documents table created');
  },
  down: async () => {
    console.log('🔄 Rolling back migration 002');
    await db.query('DROP TABLE IF EXISTS documents CASCADE');
    console.log('✅ Migration 002 rolled back');
  }
};

// Migration 003: Create audit_logs table
const migration003: Migration = {
  version: '003',
  description: 'Create audit logs table',
  up: async () => {
    console.log('🚀 Running migration 003: Create audit logs table');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id UUID,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for audit log queries
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)
    `);

    console.log('✅ Migration 003 completed: Audit logs table created');
  },
  down: async () => {
    console.log('🔄 Rolling back migration 003');
    await db.query('DROP TABLE IF EXISTS audit_logs CASCADE');
    console.log('✅ Migration 003 rolled back');
  }
};

// List of all migrations in order
const migrations: Migration[] = [
  migration001,
  migration002,
  migration003
];

export class MigrationRunner {
  private static async createMigrationsTable(): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        version VARCHAR(10) PRIMARY KEY,
        description TEXT NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
  }

  private static async getAppliedMigrations(): Promise<string[]> {
    const result = await db.query('SELECT version FROM migrations ORDER BY version');
    return result.rows.map((row: any) => row.version);
  }

  private static async markMigrationAsApplied(migration: Migration): Promise<void> {
    await db.query(
      'INSERT INTO migrations (version, description) VALUES ($1, $2)',
      [migration.version, migration.description]
    );
  }

  private static async markMigrationAsRolledBack(version: string): Promise<void> {
    await db.query('DELETE FROM migrations WHERE version = $1', [version]);
  }

  public static async runMigrations(): Promise<void> {
    console.log('🗄️ Starting database migrations...');
    
    try {
      // Ensure migrations table exists
      await this.createMigrationsTable();
      
      // Get already applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      
      // Run pending migrations
      for (const migration of migrations) {
        if (!appliedMigrations.includes(migration.version)) {
          console.log(`📦 Applying migration ${migration.version}: ${migration.description}`);
          await migration.up();
          await this.markMigrationAsApplied(migration);
        } else {
          console.log(`⏭️ Migration ${migration.version} already applied`);
        }
      }
      
      console.log('✅ All migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  public static async rollbackMigration(version: string): Promise<void> {
    console.log(`🔄 Rolling back migration ${version}...`);
    
    const migration = migrations.find(m => m.version === version);
    if (!migration) {
      throw new Error(`Migration ${version} not found`);
    }

    await migration.down();
    await this.markMigrationAsRolledBack(version);
    
    console.log(`✅ Migration ${version} rolled back successfully`);
  }

  public static async resetDatabase(): Promise<void> {
    console.log('🗑️ Resetting database...');
    
    // Get applied migrations in reverse order
    const appliedMigrations = await this.getAppliedMigrations();
    
    for (const version of appliedMigrations.reverse()) {
      await this.rollbackMigration(version);
    }
    
    // Drop migrations table
    await db.query('DROP TABLE IF EXISTS migrations');
    
    console.log('✅ Database reset complete');
  }
}

export { migrations }; 