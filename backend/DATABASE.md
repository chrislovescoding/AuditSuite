# AuditSuite Database Setup

This document describes how to set up and manage the PostgreSQL database for AuditSuite.

## Prerequisites

### Install PostgreSQL

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Ensure PostgreSQL service is running

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create a database user (optional)
createuser --interactive
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

## Database Configuration

Update the `.env` file in the backend directory with your PostgreSQL settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=audit_suite
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

## Database Setup Commands

### 1. Initial Database Setup
Create the database and enable extensions:
```bash
npm run db:setup
```

This script will:
- Connect to PostgreSQL server
- Create the `audit_suite` database if it doesn't exist
- Enable UUID extensions
- Verify the connection

### 2. Run Migrations
Create all database tables and indexes:
```bash
npm run db:migrate
```

Or simply start the server (migrations run automatically):
```bash
npm run dev
```

### 3. Seed Test Data
Populate the database with test users:
```bash
npm run db:seed
```

This creates test users for each role with password `TestPass123!`:
- lead.auditor@audit-suite.gov.uk (Lead Auditor)
- senior.auditor@audit-suite.gov.uk (Senior Auditor)  
- auditor@audit-suite.gov.uk (Auditor)
- analyst@audit-suite.gov.uk (Analyst)
- reviewer@external.gov.uk (External Reviewer)
- councillor@council.gov.uk (Councillor)

### 4. Reset Database
Drop all tables and recreate from scratch:
```bash
npm run db:reset
```

⚠️ **Warning:** This will delete all data!

## Database Schema

### Users Table
Stores user account information and authentication data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending_approval',
  department VARCHAR(100),
  phone_number VARCHAR(20),
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);
```

**User Roles:**
- `system_admin` - Full system access
- `lead_auditor` - Manage audits and approve reports
- `senior_auditor` - Review work and sign off
- `auditor` - Upload documents and create work
- `analyst` - View and analyze data
- `external_reviewer` - Limited read access
- `councillor` - Read final reports only

**User Status:**
- `active` - Can log in and use the system
- `inactive` - Account disabled
- `suspended` - Temporarily suspended
- `pending_approval` - New account waiting for admin approval

### Documents Table
Stores uploaded document metadata.

```sql
CREATE TABLE documents (
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
);
```

### Audit Logs Table
Tracks all user actions for compliance and security.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Default Admin Account

The system automatically creates a default admin account:

- **Email:** `admin@audit-suite.gov.uk`
- **Password:** `AuditAdmin123!`
- **Role:** System Admin

⚠️ **Security:** Change this password immediately in production!

## Migration System

The application uses a custom migration system to manage database schema changes:

### Migration Files
Located in `src/database/migrations.ts`

### Migration Commands
```bash
# Run pending migrations
npm run db:migrate

# Reset database (rollback all migrations)
npm run db:reset
```

### Adding New Migrations
1. Add a new migration object to the `migrations` array
2. Implement `up()` and `down()` methods
3. Migrations run automatically on server start

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Ensure PostgreSQL is running:
   ```bash
   # Check status
   brew services list | grep postgresql  # macOS
   sudo systemctl status postgresql      # Linux
   
   # Start service
   brew services start postgresql        # macOS
   sudo systemctl start postgresql       # Linux
   ```

2. Check if PostgreSQL is listening on the correct port:
   ```bash
   sudo netstat -tlnp | grep 5432
   ```

### Authentication Failed
```
Error: password authentication failed for user "postgres"
```

**Solutions:**
1. Reset postgres user password:
   ```bash
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
   ```

2. Update your `.env` file with correct credentials

3. Check PostgreSQL authentication configuration in `pg_hba.conf`

### Database Does Not Exist
```
Error: database "audit_suite" does not exist
```

**Solution:**
Run the database setup script:
```bash
npm run db:setup
```

### Permission Denied
```
Error: permission denied for schema public
```

**Solution:**
Grant permissions to your database user:
```sql
GRANT ALL PRIVILEGES ON DATABASE audit_suite TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
```

## Production Considerations

### Environment Variables
Update these settings for production:

```env
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=audit_suite_prod
DB_USER=audit_suite_user
DB_PASSWORD=secure-random-password
DB_SSL=true
JWT_SECRET=secure-random-jwt-secret
NODE_ENV=production
```

### SSL Configuration
For AWS RDS and other cloud databases:
```env
DB_SSL=true
```

### Backup Strategy
Implement regular backups:
```bash
# Create backup
pg_dump -h localhost -U postgres audit_suite > backup.sql

# Restore backup
psql -h localhost -U postgres audit_suite < backup.sql
```

### Monitoring
Monitor these metrics:
- Connection pool usage
- Query performance
- Database size
- Active connections
- Lock waits

## Database Maintenance

### Regular Tasks
1. **Vacuum and Analyze:**
   ```sql
   VACUUM ANALYZE;
   ```

2. **Update Statistics:**
   ```sql
   ANALYZE;
   ```

3. **Check Index Usage:**
   ```sql
   SELECT schemaname, tablename, attname, n_distinct, correlation
   FROM pg_stats
   WHERE tablename = 'users';
   ```

4. **Monitor Slow Queries:**
   ```sql
   SELECT query, mean_time, calls
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ``` 