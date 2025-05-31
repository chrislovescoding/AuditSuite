const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  console.log('🗄️ Setting up PostgreSQL database for AuditSuite...');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };
  
  const databaseName = process.env.DB_NAME || 'audit_suite';
  
  // Connect to PostgreSQL server (without database)
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');
    
    // Check if database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const result = await client.query(checkDbQuery, [databaseName]);
    
    if (result.rows.length === 0) {
      // Create database
      console.log(`📝 Creating database: ${databaseName}`);
      await client.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`✅ Database "${databaseName}" created successfully`);
    } else {
      console.log(`ℹ️ Database "${databaseName}" already exists`);
    }
    
    await client.end();
    
    // Test connection to the new database
    const testClient = new Client({
      ...dbConfig,
      database: databaseName
    });
    
    await testClient.connect();
    console.log(`✅ Successfully connected to database: ${databaseName}`);
    
    // Enable UUID extension for PostgreSQL
    await testClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');
    
    await testClient.end();
    
    console.log('🎉 Database setup complete!');
    console.log(`
📋 Database Configuration:
   Host: ${dbConfig.host}
   Port: ${dbConfig.port}
   Database: ${databaseName}
   User: ${dbConfig.user}
   
🚀 You can now run: npm run dev
`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`
🔧 PostgreSQL Connection Failed!

Please ensure PostgreSQL is installed and running:

📥 Install PostgreSQL:
   • Windows: Download from https://www.postgresql.org/download/windows/
   • macOS: brew install postgresql
   • Ubuntu: sudo apt-get install postgresql

🚀 Start PostgreSQL:
   • Windows: Start PostgreSQL service from Services
   • macOS: brew services start postgresql
   • Ubuntu: sudo systemctl start postgresql

⚙️ Configure PostgreSQL:
   1. Create a user (if needed):
      sudo -u postgres createuser --interactive
   
   2. Set password for postgres user:
      sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
   
   3. Update your .env file with correct credentials:
      DB_HOST=localhost
      DB_PORT=5432
      DB_NAME=audit_suite
      DB_USER=postgres
      DB_PASSWORD=postgres
`);
    } else if (error.code === '28P01') {
      console.log(`
🔐 Authentication Failed!

Please check your database credentials in the .env file:
   DB_USER=${dbConfig.user}
   DB_PASSWORD=${dbConfig.password}

To reset PostgreSQL password:
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
`);
    }
    
    process.exit(1);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 