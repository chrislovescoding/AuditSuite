import { MigrationRunner } from '../src/database/migrations';
import { db } from '../src/database/config';
import { UserService } from '../src/services/userService';

async function resetDatabase() {
  console.log('🗑️ Resetting database...');
  
  try {
    // Test connection first
    const isConnected = await db.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Reset database (rollback all migrations)
    await MigrationRunner.resetDatabase();
    
    // Re-run all migrations
    await MigrationRunner.runMigrations();
    
    // Re-create default admin user
    await UserService.initializeDefaultAdmin();
    
    console.log('✅ Database reset complete!');
    console.log('🔑 Default admin user recreated: admin@audit-suite.gov.uk / AuditAdmin123!');
    
    // Close connection
    await db.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase(); 