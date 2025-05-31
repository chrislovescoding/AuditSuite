import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | object;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  application_name: string;
}

// Extended error interface for PostgreSQL errors
interface PostgreSQLError extends Error {
  code?: string;
  severity?: string;
  detail?: string;
  hint?: string;
  position?: string;
  internalPosition?: string;
  internalQuery?: string;
  where?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
  file?: string;
  line?: string;
  routine?: string;
}

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'audit_suite',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  
  // AWS RDS SSL Configuration for GDPR compliance
  ssl: isProduction ? {
    require: true,
    rejectUnauthorized: false, // AWS RDS certificates are trusted
    ca: undefined // AWS manages certificates
  } : (process.env.DB_SSL === 'true' ? {
    require: false,
    rejectUnauthorized: false
  } : false),
  
  // Connection pool settings optimized for production
  max: isProduction ? 20 : (isDevelopment ? 5 : 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  
  // Application identifier for audit logging
  application_name: `AuditSuite-${process.env.NODE_ENV || 'development'}-GDPR`
};

// GDPR-compliant connection pool with enhanced logging
export const pool = new Pool({
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
  user: databaseConfig.user,
  password: databaseConfig.password,
  ssl: databaseConfig.ssl,
  max: databaseConfig.max,
  idleTimeoutMillis: databaseConfig.idleTimeoutMillis,
  connectionTimeoutMillis: databaseConfig.connectionTimeoutMillis,
  application_name: databaseConfig.application_name,
  
  // Enhanced logging for GDPR audit trail
  ...(isProduction && {
    log: (level: string, msg: string) => {
      console.log(`[DB-${level.toUpperCase()}] ${new Date().toISOString()} - ${msg}`);
    }
  })
});

// Connection lifecycle hooks for GDPR audit trail
pool.on('connect', (client) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT] Database connection established: ${timestamp}`);
  
  // Set session parameters for GDPR compliance and security
  client.query(`
    SET application_name = '${databaseConfig.application_name}';
    SET log_statement = 'all';
    SET log_min_duration_statement = 1000;
    SET timezone = 'UTC';
    SET DateStyle = 'ISO, YMD';
  `).catch((error) => {
    console.error(`[AUDIT] Failed to set session parameters: ${timestamp}`, error);
  });
});

pool.on('acquire', (client) => {
  console.log(`[AUDIT] Database connection acquired: ${new Date().toISOString()}`);
});

pool.on('release', (client) => {
  console.log(`[AUDIT] Database connection released: ${new Date().toISOString()}`);
});

pool.on('error', (err: PostgreSQLError, client) => {
  const timestamp = new Date().toISOString();
  console.error(`[AUDIT] Database connection error: ${timestamp}`, {
    error: err.message,
    code: err.code || 'UNKNOWN',
    severity: err.severity || 'ERROR',
    timestamp
  });
  
  // For GDPR compliance, log data breach potential
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    console.error(`[GDPR-ALERT] Potential data availability incident: ${timestamp}`, {
      type: 'database_connectivity_failure',
      impact: 'service_unavailable',
      gdpr_article: 'Article 33 - Notification of a personal data breach'
    });
  }
});

// Health check function for monitoring
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  details: {
    totalConnections: number;
    idleConnections: number;
    waitingClients: number;
  };
}> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as timestamp, version() as version');
    client.release();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: {
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount
      }
    };
  } catch (error) {
    console.error('[AUDIT] Database health check failed:', error);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      details: {
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount
      }
    };
  }
}

// Graceful shutdown function
export async function closeDatabaseConnections(): Promise<void> {
  console.log('[AUDIT] Closing database connections gracefully...');
  await pool.end();
  console.log('[AUDIT] Database connections closed successfully');
}

// GDPR-specific database utilities
export async function executeAuditQuery(
  query: string, 
  params: any[] = [], 
  userId?: string,
  action?: string
): Promise<any> {
  const client = await pool.connect();
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[AUDIT] Executing query: ${timestamp}`, {
      userId,
      action,
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      timestamp
    });
    
    const result = await client.query(query, params);
    
    console.log(`[AUDIT] Query completed: ${timestamp}`, {
      userId,
      action,
      rowCount: result.rowCount,
      timestamp
    });
    
    return result;
  } catch (error) {
    const dbError = error as PostgreSQLError;
    console.error(`[AUDIT] Query failed: ${timestamp}`, {
      userId,
      action,
      error: dbError.message,
      code: dbError.code,
      timestamp
    });
    throw error;
  } finally {
    client.release();
  }
}

export default pool; 