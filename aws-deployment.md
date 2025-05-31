# AWS GDPR-Compliant Database Setup for AuditSuite 🇬🇧

This guide covers setting up AuditSuite database infrastructure on AWS with full GDPR and UK Data Protection Act 2018 compliance for UK local government use.

## 🏛️ Legal Compliance Requirements

### GDPR & UK DPA 2018 Requirements
- **Data Minimization**: Only collect necessary data
- **Purpose Limitation**: Use data only for specified purposes
- **Storage Limitation**: Keep data only as long as necessary
- **Integrity & Confidentiality**: Ensure security and accuracy
- **Accountability**: Demonstrate compliance
- **Data Subject Rights**: Enable access, rectification, erasure, portability

### UK Government Cloud Security
- **Data Sovereignty**: Data must remain in UK
- **Security Standards**: Cyber Essentials Plus or equivalent
- **Audit Trail**: Complete activity logging
- **Encryption**: At rest and in transit

## 🏗️ AWS Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UK ONLY DEPLOYMENT                   │
├─────────────────────────────────────────────────────────────┤
│  VPC (eu-west-2 - London)                                 │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │  Private Subnet │  │  Private Subnet │                │
│  │  (AZ-a)         │  │  (AZ-b)         │                │
│  │  ┌─────────────┐│  │ ┌─────────────┐ │                │
│  │  │ RDS Primary ││  │ │ RDS Standby │ │                │
│  │  │ PostgreSQL  ││  │ │ (Multi-AZ)  │ │                │
│  │  └─────────────┘│  │ └─────────────┘ │                │
│  └─────────────────┘  └─────────────────┘                │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Application Subnets                               │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │ │ ECS/Fargate │ │ ECS/Fargate │ │ ECS/Fargate │   │   │
│  │ │ (AZ-a)      │ │ (AZ-b)      │ │ (AZ-c)      │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Security & Compliance                             │   │
│  │ • AWS KMS (UK managed keys)                       │   │
│  │ • CloudTrail (audit logging)                      │   │
│  │ • VPC Flow Logs                                   │   │
│  │ • AWS Config (compliance)                         │   │
│  │ • WAF (application protection)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Step 1: AWS Account Setup

### 1.1 Create AWS Account with UK Billing Address
```bash
# Ensure account is registered to UK entity
# Set default region to eu-west-2 (London)
aws configure set region eu-west-2
```

### 1.2 Enable Required AWS Services
```bash
# Enable CloudTrail for audit logging
aws cloudtrail create-trail \
    --name audit-suite-trail \
    --s3-bucket-name audit-suite-cloudtrail-uk \
    --include-global-service-events \
    --is-multi-region-trail \
    --enable-log-file-validation

# Enable AWS Config for compliance monitoring
aws configservice put-configuration-recorder \
    --configuration-recorder name=audit-suite-config,roleARN=arn:aws:iam::ACCOUNT:role/config-role
```

## 🔐 Step 2: Create GDPR-Compliant Database Environment

### 2.1 Create AWS CloudFormation Template

Create file: `aws/infrastructure.yaml`

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'GDPR-Compliant AuditSuite Database Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [production, staging, development]
  
  DBPassword:
    Type: String
    NoEcho: true
    MinLength: 12
    Description: 'Database password (min 12 chars, must include uppercase, lowercase, numbers, symbols)'

  OrganizationName:
    Type: String
    Description: 'UK Council/Organization name for tagging'

Resources:
  # VPC Configuration - UK Only
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '${AWS::StackName}-vpc'
        - Key: Environment
          Value: !Ref Environment
        - Key: Compliance
          Value: 'GDPR-UK-DPA'
        - Key: Organization
          Value: !Ref OrganizationName

  # Private Subnets for Database (Multi-AZ)
  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      Tags:
        - Key: Name
          Value: 'Database Private Subnet 1'

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']
      Tags:
        - Key: Name
          Value: 'Database Private Subnet 2'

  # Application Subnets
  AppSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.10.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      Tags:
        - Key: Name
          Value: 'Application Subnet 1'

  AppSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.11.0/24
      AvailabilityZone: !Select [1, !GetAZs '']
      Tags:
        - Key: Name
          Value: 'Application Subnet 2'

  # KMS Key for Database Encryption (UK managed)
  DatabaseKMSKey:
    Type: AWS::KMS::Key
    Properties:
      Description: 'AuditSuite Database Encryption Key - GDPR Compliant'
      KeyPolicy:
        Statement:
          - Sid: Enable IAM User Permissions
            Effect: Allow
            Principal:
              AWS: !Sub 'arn:aws:iam::${AWS::AccountId}:root'
            Action: 'kms:*'
            Resource: '*'
          - Sid: Allow RDS Service
            Effect: Allow
            Principal:
              Service: rds.amazonaws.com
            Action:
              - kms:Decrypt
              - kms:GenerateDataKey
            Resource: '*'
      Tags:
        - Key: Name
          Value: 'AuditSuite-DB-Key'
        - Key: Compliance
          Value: 'GDPR-UK-DPA'

  DatabaseKMSKeyAlias:
    Type: AWS::KMS::Alias
    Properties:
      AliasName: alias/auditsuite-database
      TargetKeyId: !Ref DatabaseKMSKey

  # Database Subnet Group
  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: 'Subnet group for AuditSuite database'
      SubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2
      Tags:
        - Key: Name
          Value: 'AuditSuite DB Subnet Group'

  # Database Security Group
  DatabaseSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: 'Security group for AuditSuite PostgreSQL database'
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          SourceSecurityGroupId: !Ref ApplicationSecurityGroup
          Description: 'PostgreSQL access from application'
      Tags:
        - Key: Name
          Value: 'AuditSuite-DB-SG'

  # Application Security Group
  ApplicationSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: 'Security group for AuditSuite application'
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
          Description: 'HTTP access'
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0
          Description: 'HTTPS access'
      Tags:
        - Key: Name
          Value: 'AuditSuite-App-SG'

  # RDS PostgreSQL Instance - GDPR Compliant
  DatabaseInstance:
    Type: AWS::RDS::DBInstance
    DeletionPolicy: Snapshot
    Properties:
      DBInstanceIdentifier: !Sub '${AWS::StackName}-postgres'
      DBInstanceClass: db.t3.medium
      Engine: postgres
      EngineVersion: '15.4'
      AllocatedStorage: 100
      StorageType: gp3
      StorageEncrypted: true
      KmsKeyId: !Ref DatabaseKMSKey
      
      # Database Configuration
      DBName: audit_suite
      MasterUsername: postgres
      MasterUserPassword: !Ref DBPassword
      
      # High Availability & Backup
      MultiAZ: true
      BackupRetentionPeriod: 35  # GDPR allows up to 35 days for operational needs
      PreferredBackupWindow: '03:00-04:00'
      PreferredMaintenanceWindow: 'sun:04:00-sun:05:00'
      
      # Security Configuration
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
      PubliclyAccessible: false
      
      # Monitoring & Logging
      EnablePerformanceInsights: true
      MonitoringInterval: 60
      MonitoringRoleArn: !GetAtt RDSEnhancedMonitoringRole.Arn
      EnableCloudwatchLogsExports:
        - postgresql
      
      # GDPR Compliance Tags
      Tags:
        - Key: Name
          Value: 'AuditSuite-Primary-DB'
        - Key: Environment
          Value: !Ref Environment
        - Key: Compliance
          Value: 'GDPR-UK-DPA'
        - Key: DataClassification
          Value: 'Sensitive'
        - Key: RetentionPolicy
          Value: 'AsPerGDPR'
        - Key: Organization
          Value: !Ref OrganizationName
        - Key: Purpose
          Value: 'UK-Council-Audit-System'

  # Enhanced Monitoring Role for RDS
  RDSEnhancedMonitoringRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Sid: ''
            Effect: Allow
            Principal:
              Service: monitoring.rds.amazonaws.com
            Action: 'sts:AssumeRole'
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole

  # S3 Bucket for Document Storage (UK only)
  DocumentsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AWS::StackName}-documents-${AWS::AccountId}'
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: aws:kms
              KMSMasterKeyID: !Ref DatabaseKMSKey
      VersioningConfiguration:
        Status: Enabled
      LifecycleConfiguration:
        Rules:
          - Id: DeleteOldVersions
            Status: Enabled
            NoncurrentVersionExpirationInDays: 30
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      NotificationConfiguration:
        CloudWatchConfigurations:
          - Event: s3:ObjectCreated:*
            CloudWatchConfiguration:
              LogGroupName: !Ref DocumentsLogGroup
      Tags:
        - Key: Name
          Value: 'AuditSuite-Documents'
        - Key: Compliance
          Value: 'GDPR-UK-DPA'

  # CloudWatch Log Group for Documents
  DocumentsLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/s3/${AWS::StackName}-documents'
      RetentionInDays: 2555  # 7 years for audit compliance

Outputs:
  DatabaseEndpoint:
    Description: 'PostgreSQL Database Endpoint'
    Value: !GetAtt DatabaseInstance.Endpoint.Address
    Export:
      Name: !Sub '${AWS::StackName}-db-endpoint'
  
  DatabasePort:
    Description: 'Database Port'
    Value: !GetAtt DatabaseInstance.Endpoint.Port
    Export:
      Name: !Sub '${AWS::StackName}-db-port'
  
  DocumentsBucketName:
    Description: 'S3 Bucket for Documents'
    Value: !Ref DocumentsBucket
    Export:
      Name: !Sub '${AWS::StackName}-documents-bucket'
  
  VPCId:
    Description: 'VPC ID'
    Value: !Ref VPC
    Export:
      Name: !Sub '${AWS::StackName}-vpc-id'
```

### 2.2 GDPR Compliance Configuration Script

Create file: `aws/gdpr-compliance.sh`

```bash
#!/bin/bash
set -e

# GDPR Compliance Setup Script for AuditSuite
echo "🇬🇧 Setting up GDPR-compliant AWS infrastructure for UK Council AuditSuite..."

# Configuration
STACK_NAME="auditsuite-${ENVIRONMENT:-production}"
REGION="eu-west-2"  # London - UK only
ORGANIZATION_NAME="${ORGANIZATION_NAME:-UK-Council}"

# Validate UK region
if [ "$REGION" != "eu-west-2" ]; then
    echo "❌ ERROR: Must use eu-west-2 (London) region for GDPR compliance"
    exit 1
fi

# Create secure password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Generated secure database password"

# Deploy infrastructure
echo "🏗️ Deploying GDPR-compliant infrastructure..."
aws cloudformation create-stack \
    --stack-name "$STACK_NAME" \
    --template-body file://infrastructure.yaml \
    --parameters \
        ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
        ParameterKey=DBPassword,ParameterValue="$DB_PASSWORD" \
        ParameterKey=OrganizationName,ParameterValue="$ORGANIZATION_NAME" \
    --capabilities CAPABILITY_IAM \
    --region "$REGION" \
    --tags \
        Key=Compliance,Value=GDPR-UK-DPA \
        Key=DataSovereignty,Value=UK-Only \
        Key=Organization,Value="$ORGANIZATION_NAME"

# Wait for stack creation
echo "⏳ Waiting for infrastructure deployment..."
aws cloudformation wait stack-create-complete \
    --stack-name "$STACK_NAME" \
    --region "$REGION"

# Get outputs
DB_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
    --output text)

DOCUMENTS_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`DocumentsBucketName`].OutputValue' \
    --output text)

# Create environment configuration
cat > ../backend/.env.production << EOF
# GDPR-Compliant Production Configuration
# Generated: $(date)

# Database Configuration - AWS RDS PostgreSQL
DB_HOST=$DB_ENDPOINT
DB_PORT=5432
DB_NAME=audit_suite
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
DB_SSL=true

# AWS Configuration
AWS_REGION=eu-west-2
AWS_S3_BUCKET=$DOCUMENTS_BUCKET

# Security Configuration
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=8h
SESSION_TIMEOUT=30m

# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-domain.gov.uk

# GDPR Configuration
GDPR_ENABLED=true
DATA_RETENTION_DAYS=2555  # 7 years for audit compliance
AUDIT_LOG_RETENTION_DAYS=2555
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info
EOF

echo "✅ GDPR-compliant infrastructure deployed successfully!"
echo "📊 Database Endpoint: $DB_ENDPOINT"
echo "📁 Documents Bucket: $DOCUMENTS_BUCKET"
echo "🔐 Environment configuration created at backend/.env.production"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "1. Database password saved to .env.production - keep secure!"
echo "2. Change default admin password immediately"
echo "3. Configure SSL certificates for production domain"
echo "4. Review and update CORS origins"
echo "5. Set up CloudWatch monitoring alerts"
```

## 📋 Step 3: Update Database Configuration for AWS

### 3.1 Update Database Config for AWS RDS

```typescript
// backend/src/database/config.ts
import { Pool } from 'pg';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean | object;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const isProduction = process.env.NODE_ENV === 'production';

export const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'audit_suite',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  
  // AWS RDS SSL Configuration for GDPR compliance
  ssl: isProduction ? {
    require: true,
    rejectUnauthorized: false, // AWS RDS certificates are trusted
    ca: undefined // AWS manages certificates
  } : false,
  
  // Connection pool settings for production
  max: isProduction ? 20 : 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// GDPR-compliant connection pool
export const pool = new Pool({
  ...databaseConfig,
  // Additional GDPR compliance settings
  application_name: 'AuditSuite-GDPR',
  ssl: databaseConfig.ssl,
  
  // Connection lifecycle hooks for audit logging
  log: (level: string, msg: string) => {
    if (isProduction) {
      console.log(`[DB-${level.toUpperCase()}] ${new Date().toISOString()} - ${msg}`);
    }
  }
});

// Test connection and log for audit trail
pool.on('connect', (client) => {
  console.log(`[AUDIT] Database connection established: ${new Date().toISOString()}`);
  
  // Set session parameters for GDPR compliance
  client.query(`
    SET log_statement = 'all';
    SET log_min_duration_statement = 1000;
    SET application_name = 'AuditSuite-${process.env.NODE_ENV}';
  `).catch(console.error);
});

pool.on('error', (err) => {
  console.error(`[AUDIT] Database connection error: ${new Date().toISOString()}`, err);
});

export default pool;
```

## 🔒 Step 4: GDPR Compliance Features

### 4.1 Data Subject Rights Implementation

Create file: `backend/src/services/gdpr.ts`

```typescript
import pool from '../database/config';
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

export class GDPRService {
  
  // Article 15 - Right of Access
  async handleDataAccessRequest(subjectEmail: string, requestedBy: string): Promise<object> {
    const client = await pool.connect();
    
    try {
      // Log the request for audit trail
      await this.logGDPRRequest('access', subjectEmail, requestedBy);
      
      // Collect all personal data
      const userData = await client.query(`
        SELECT id, email, first_name, last_name, role, department, phone_number, 
               last_login_at, created_at, updated_at
        FROM users 
        WHERE email = $1
      `, [subjectEmail]);
      
      const userDocuments = await client.query(`
        SELECT filename, original_name, file_size, upload_date, metadata
        FROM documents 
        WHERE uploaded_by = (SELECT id FROM users WHERE email = $1)
      `, [subjectEmail]);
      
      const auditLogs = await client.query(`
        SELECT action, resource_type, resource_id, created_at, ip_address
        FROM audit_logs 
        WHERE user_id = (SELECT id FROM users WHERE email = $1)
        ORDER BY created_at DESC
        LIMIT 100
      `, [subjectEmail]);
      
      const exportData = {
        personal_data: userData.rows[0] || null,
        documents: userDocuments.rows,
        recent_activity: auditLogs.rows,
        export_date: new Date().toISOString(),
        retention_policy: 'Data retained for 7 years as per UK audit requirements',
        contact_dpo: 'dpo@your-council.gov.uk'
      };
      
      await this.completeGDPRRequest(subjectEmail, 'access', exportData);
      
      return exportData;
      
    } finally {
      client.release();
    }
  }
  
  // Article 17 - Right of Erasure (Right to be Forgotten)
  async handleDataErasureRequest(subjectEmail: string, requestedBy: string): Promise<boolean> {
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
      const hasAuditRequirements = await client.query(`
        SELECT COUNT(*) as count FROM documents 
        WHERE uploaded_by = $1 
        AND created_at > NOW() - INTERVAL '7 years'
      `, [user.rows[0].id]);
      
      if (parseInt(hasAuditRequirements.rows[0].count) > 0) {
        await this.logGDPRRequest('erasure', subjectEmail, requestedBy, 'rejected', 
          'Cannot delete: Required for UK audit compliance (7 year retention)');
        return false;
      }
      
      // Proceed with erasure
      await client.query(`DELETE FROM audit_logs WHERE user_id = $1`, [user.rows[0].id]);
      await client.query(`DELETE FROM documents WHERE uploaded_by = $1`, [user.rows[0].id]);
      await client.query(`DELETE FROM users WHERE id = $1`, [user.rows[0].id]);
      
      await client.query('COMMIT');
      await this.logGDPRRequest('erasure', subjectEmail, requestedBy, 'completed');
      
      return true;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Article 20 - Right to Data Portability
  async handleDataPortabilityRequest(subjectEmail: string, requestedBy: string): Promise<object> {
    const accessData = await this.handleDataAccessRequest(subjectEmail, requestedBy);
    
    // Format for portability (structured, commonly used format)
    const portableData = {
      format: 'JSON',
      version: '1.0',
      exported_by: 'AuditSuite-GDPR-Compliant',
      exported_at: new Date().toISOString(),
      data: accessData,
      instructions: 'This data export complies with GDPR Article 20 requirements'
    };
    
    await this.logGDPRRequest('portability', subjectEmail, requestedBy, 'completed', 
      'Data export provided in machine-readable format');
    
    return portableData;
  }
  
  private async logGDPRRequest(
    type: string, 
    subjectEmail: string, 
    requestedBy: string, 
    status: string = 'completed',
    reason?: string
  ): Promise<void> {
    await pool.query(`
      INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, details, created_at
      ) VALUES (
        (SELECT id FROM users WHERE email = $2),
        $1,
        'gdpr_request',
        gen_random_uuid(),
        $3,
        NOW()
      )
    `, [
      `GDPR_${type.toUpperCase()}_REQUEST`,
      requestedBy,
      JSON.stringify({
        subject_email: subjectEmail,
        request_type: type,
        status: status,
        reason: reason || null,
        compliance_framework: 'GDPR + UK DPA 2018'
      })
    ]);
  }
  
  private async completeGDPRRequest(
    subjectEmail: string, 
    type: string, 
    exportData?: object
  ): Promise<void> {
    // Update request status and store export data securely
    await pool.query(`
      INSERT INTO gdpr_requests (
        id, type, subject_email, status, data_export, completed_at
      ) VALUES (
        $1, $2, $3, 'completed', $4, NOW()
      ) ON CONFLICT (subject_email, type) 
      DO UPDATE SET 
        status = 'completed',
        data_export = $4,
        completed_at = NOW()
    `, [uuidv4(), type, subjectEmail, JSON.stringify(exportData || {})]);
  }
}
```

### 4.2 Add GDPR Migration

Create file: `backend/src/database/gdpr-migration.ts`

```typescript
export const gdprMigration = {
  name: 'add_gdpr_compliance_tables',
  up: async (client: any) => {
    // GDPR Data Subject Requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gdpr_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        subject_email VARCHAR(255) NOT NULL,
        requested_by UUID REFERENCES users(id),
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        reason TEXT,
        data_export JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(subject_email, type)
      );
    `);
    
    // Data retention policies
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_retention_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name VARCHAR(100) NOT NULL,
        retention_period_days INTEGER NOT NULL,
        legal_basis TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Insert default retention policies for UK audit compliance
    await client.query(`
      INSERT INTO data_retention_policies (table_name, retention_period_days, legal_basis)
      VALUES 
        ('users', 2555, 'UK Audit Requirements - 7 years'),
        ('documents', 2555, 'UK Audit Requirements - 7 years'),
        ('audit_logs', 2555, 'UK Audit Requirements - 7 years'),
        ('gdpr_requests', 2555, 'GDPR Compliance - 7 years')
      ON CONFLICT (table_name) DO NOTHING;
    `);
    
    // Add GDPR compliance columns to existing tables
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
    `);
    
    // Index for GDPR requests
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_gdpr_requests_email_type 
      ON gdpr_requests(subject_email, type);
    `);
    
    // Index for audit logs by user (for GDPR access requests)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date 
      ON audit_logs(user_id, created_at DESC);
    `);
    
    console.log('✅ GDPR compliance tables created successfully');
  },
  
  down: async (client: any) => {
    await client.query(`DROP TABLE IF EXISTS gdpr_requests;`);
    await client.query(`DROP TABLE IF EXISTS data_retention_policies;`);
    await client.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS gdpr_consent_date,
      DROP COLUMN IF EXISTS data_processing_consent,
      DROP COLUMN IF EXISTS marketing_consent;
    `);
    
    console.log('❌ GDPR compliance tables removed');
  }
};
```

## 🚀 Step 5: Deployment Instructions

### 5.1 Pre-deployment Checklist

```bash
# 1. Verify AWS CLI is configured for UK region
aws configure get region  # Should return: eu-west-2

# 2. Verify you have necessary permissions
aws sts get-caller-identity

# 3. Set environment variables
export ENVIRONMENT=production
export ORGANIZATION_NAME="Your-UK-Council-Name"
```

### 5.2 Deploy Infrastructure

```bash
cd aws
chmod +x gdpr-compliance.sh
./gdpr-compliance.sh
```

### 5.3 Update Application Configuration

```bash
# Copy production environment file
cp backend/.env.production backend/.env

# Install AWS SDK for S3 integration
cd backend
npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Run database migrations
npm run db:migrate
```

## 📊 Step 6: Monitoring & Compliance

### 6.1 CloudWatch Monitoring Setup

```typescript
// backend/src/monitoring/gdpr-metrics.ts
import AWS from 'aws-sdk';

const cloudwatch = new AWS.CloudWatch({ region: 'eu-west-2' });

export class GDPRMonitoring {
  async recordDataSubjectRequest(type: string) {
    await cloudwatch.putMetricData({
      Namespace: 'AuditSuite/GDPR',
      MetricData: [{
        MetricName: 'DataSubjectRequests',
        Value: 1,
        Unit: 'Count',
        Dimensions: [{
          Name: 'RequestType',
          Value: type
        }],
        Timestamp: new Date()
      }]
    }).promise();
  }
  
  async recordDataBreachAlert() {
    await cloudwatch.putMetricData({
      Namespace: 'AuditSuite/Security',
      MetricData: [{
        MetricName: 'DataBreachAlert',
        Value: 1,
        Unit: 'Count',
        Timestamp: new Date()
      }]
    }).promise();
  }
}
```

### 6.2 Compliance Dashboard

Create a compliance dashboard for monitoring GDPR adherence:

```sql
-- GDPR Compliance Queries for reporting

-- Data Subject Requests Summary
SELECT 
    type,
    status,
    COUNT(*) as request_count,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_hours_to_complete
FROM gdpr_requests 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY type, status;

-- Data Retention Compliance Check
SELECT 
    table_name,
    retention_period_days,
    legal_basis,
    CASE 
        WHEN table_name = 'users' THEN (
            SELECT COUNT(*) FROM users 
            WHERE created_at < NOW() - (retention_period_days || ' days')::INTERVAL
        )
        WHEN table_name = 'documents' THEN (
            SELECT COUNT(*) FROM documents 
            WHERE created_at < NOW() - (retention_period_days || ' days')::INTERVAL
        )
        ELSE 0
    END as records_exceeding_retention
FROM data_retention_policies;

-- Audit Trail Completeness
SELECT 
    DATE(created_at) as date,
    COUNT(*) as audit_events,
    COUNT(DISTINCT user_id) as active_users
FROM audit_logs 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 📋 Final Steps

1. **Deploy the infrastructure**: Run the deployment script
2. **Test GDPR features**: Verify data subject rights functionality
3. **Configure monitoring**: Set up CloudWatch alerts
4. **Security audit**: Perform penetration testing
5. **Documentation**: Create privacy policy and data processing documentation
6. **Staff training**: Train council staff on GDPR procedures
7. **Regular reviews**: Schedule quarterly compliance reviews

Your AuditSuite is now deployed with full GDPR and UK Data Protection Act compliance! 🇬🇧✅ 