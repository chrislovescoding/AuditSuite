# 🇬🇧 AWS GDPR-Compliant Deployment Guide for AuditSuite

This guide will help you deploy AuditSuite on AWS with full GDPR and UK Data Protection Act 2018 compliance for UK local government use.

**Domain:** auditsuite.uk  
**Target Audience:** UK Local Councils and Government Organizations

## 📋 Prerequisites

### 1. AWS Account Setup
- AWS account registered to UK organization
- Billing address in the UK
- AWS CLI installed and configured
- Sufficient permissions to create:
  - VPC, Subnets, Security Groups
  - RDS instances
  - S3 buckets
  - KMS keys
  - CloudTrail
  - IAM roles

### 2. Local Requirements
- Node.js 18+ installed
- AWS CLI v2
- Git
- Text editor

### 3. Domain Requirements
- Access to manage DNS for `auditsuite.uk`
- Ability to add CNAME/A records
- SSL certificate management capability

### 4. Environment Variables
Set these before deployment:
```bash
export ENVIRONMENT=production
export ORGANIZATION_NAME="Your-Council-Name"
export DOMAIN_NAME="auditsuite.uk"  # Domain is pre-configured
```

## 🚀 Quick Deployment

### Step 1: Validate Prerequisites
```bash
# Check AWS CLI is installed
aws --version

# Verify AWS configuration (should show your account)
aws sts get-caller-identity

# Ensure you're in UK region
aws configure set region eu-west-2
```

### Step 2: Deploy Infrastructure
```bash
# Navigate to AWS directory
cd aws

# Run the deployment script (configured for auditsuite.uk)
./gdpr-compliance.sh
```

The script will:
- ✅ Validate prerequisites
- ✅ Create VPC with private subnets in eu-west-2 (London)
- ✅ Deploy PostgreSQL RDS with KMS encryption
- ✅ Set up S3 buckets with lifecycle policies
- ✅ Configure CloudTrail for complete audit logging
- ✅ Create security groups with least privilege access
- ✅ Generate production environment configuration for auditsuite.uk

### Step 3: SSL Certificate Setup (AWS Console)
1. **Go to AWS Certificate Manager** (in eu-west-2 region)
2. **Request public certificate** for `auditsuite.uk`
3. **Choose DNS validation** method
4. **Add CNAME records** to your DNS provider (provided by AWS)
5. **Wait for validation** (usually 5-30 minutes)

### Step 4: DNS Configuration
Update your DNS records with your domain registrar:

```dns
# Required DNS Records
CNAME: auditsuite.uk → [Load Balancer DNS from deployment output]

# Optional but recommended
CNAME: www.auditsuite.uk → auditsuite.uk
```

### Step 5: Application Deployment
```bash
# Copy production environment (pre-configured for auditsuite.uk)
cp backend/.env.production backend/.env

# Install AWS dependencies
cd backend
npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Run database migrations (includes GDPR compliance tables)
npm run db:migrate

# Start the application
npm run start
```

## 🔐 GDPR Compliance Features

Your auditsuite.uk deployment includes:

### Data Protection
- **UK Data Sovereignty**: All data stored in eu-west-2 (London)
- **Domain Security**: Configured for auditsuite.uk with HTTPS
- **Encryption**: KMS encryption at rest and SSL in transit
- **Access Control**: Role-based access with comprehensive audit logging
- **Data Minimization**: Only necessary data collected

### Data Subject Rights (GDPR Articles 15-20)
- ✅ Right of Access (Article 15) - Data export at auditsuite.uk/gdpr/access
- ✅ Right to Rectification (Article 16) - Data correction functionality
- ✅ Right of Erasure (Article 17) - Right to be forgotten (with audit compliance)
- ✅ Right to Data Portability (Article 20) - Machine-readable data export
- ✅ Right to Restriction (Article 18) - Processing limitation

### Audit & Compliance
- **Complete Audit Trail**: All actions logged with CloudTrail
- **Data Retention**: 7-year retention for UK audit requirements
- **Automated Cleanup**: Expired data removal functions
- **Compliance Reporting**: Built-in GDPR compliance dashboard at auditsuite.uk/admin
- **Privacy Policy**: Located at auditsuite.uk/privacy

## 📊 Infrastructure Overview

```
auditsuite.uk Infrastructure (UK-Only, eu-west-2)
├── DNS: auditsuite.uk
├── SSL: AWS Certificate Manager
├── Load Balancer: Application Load Balancer
├── VPC (10.0.0.0/16)
│   ├── Public Subnets (Load Balancer)
│   ├── Private Subnets (Application)
│   └── Database Subnets (RDS PostgreSQL)
├── Storage: S3 Buckets (KMS Encrypted)
│   ├── Documents Storage
│   ├── Access Logs
│   └── CloudTrail Audit Logs
└── Security
    ├── KMS Keys (UK managed)
    ├── Security Groups (least privilege)
    └── CloudTrail (complete audit logging)
```

## 🔧 Configuration Files

### Environment Configuration
Located at `backend/.env.production`:
```env
# Pre-configured for auditsuite.uk
DOMAIN_NAME=auditsuite.uk
CORS_ORIGIN=https://auditsuite.uk
FRONTEND_URL=https://auditsuite.uk
API_BASE_URL=https://auditsuite.uk/api
DATA_PROTECTION_OFFICER_EMAIL=dpo@auditsuite.uk
PRIVACY_POLICY_URL=https://auditsuite.uk/privacy
```

### Infrastructure Template
Located at `aws/infrastructure.yaml`:
- CloudFormation template optimized for auditsuite.uk
- GDPR-compliant resource definitions
- UK-specific security configurations

## 🌐 Important URLs

Once deployed, these URLs will be available:

- **Main Application**: https://auditsuite.uk
- **Admin Dashboard**: https://auditsuite.uk/admin
- **API Endpoints**: https://auditsuite.uk/api
- **Privacy Policy**: https://auditsuite.uk/privacy
- **GDPR Portal**: https://auditsuite.uk/gdpr
- **Health Check**: https://auditsuite.uk/health

## 📈 Monitoring & Alerts

### CloudWatch Metrics (Pre-configured)
- Database performance for auditsuite.uk
- Application health and response times
- Security events and failed login attempts
- GDPR request tracking and compliance metrics

### Recommended CloudWatch Alarms
```bash
# Database Monitoring
- RDS CPU Utilization > 80%
- RDS Connection Count > 15
- RDS Free Storage < 2GB

# Application Monitoring  
- ALB HTTP 5xx errors > 10/minute
- ALB Response time > 5 seconds
- ECS Service unhealthy tasks > 0

# Security Monitoring
- CloudTrail API errors
- Failed authentication attempts > 10/hour
- Unusual data access patterns
```

## 🛡️ Security Best Practices for auditsuite.uk

### Network Security
- Database isolated in private subnets
- Application traffic through AWS Load Balancer only
- Security groups configured for auditsuite.uk traffic patterns
- VPC Flow Logs monitoring all network activity

### Domain Security
- HTTPS enforced for all auditsuite.uk traffic
- HSTS headers configured
- Content Security Policy (CSP) enabled
- Cookie security flags set for auditsuite.uk domain

### GDPR Compliance
- Privacy by Design architecture
- Data Processing Impact Assessment (DPIA) ready
- Regular compliance audits (quarterly recommended)
- Staff training materials for UK Data Protection Act 2018

## 🆘 Troubleshooting

### Common Issues

#### 1. SSL Certificate Validation Fails
```bash
# Check certificate status
aws acm list-certificates --region eu-west-2 \
  --query 'CertificateSummaryList[?DomainName==`auditsuite.uk`]'

# Verify DNS validation records are added
dig auditsuite.uk
```

#### 2. Domain Not Resolving
```bash
# Check DNS propagation
nslookup auditsuite.uk
dig auditsuite.uk CNAME

# Verify Load Balancer is healthy
aws elbv2 describe-target-health --region eu-west-2
```

#### 3. Application Not Loading
```bash
# Check application logs
aws logs tail /aws/ecs/auditsuite-production-app --region eu-west-2

# Verify environment configuration
cat backend/.env.production | grep DOMAIN_NAME
```

### Support Resources
- **Technical Support**: Your IT Department
- **DNS Support**: Your domain registrar support
- **AWS Support**: Your AWS Support plan
- **GDPR Support**: dpo@auditsuite.uk

## 🔄 Maintenance for auditsuite.uk

### Regular Tasks
- [ ] Monthly security updates and patches
- [ ] Quarterly SSL certificate renewal check
- [ ] Quarterly GDPR compliance reviews
- [ ] Annual penetration testing
- [ ] Database backup testing (monthly)

### Domain-Specific Tasks
- [ ] DNS record monitoring
- [ ] SSL certificate auto-renewal verification
- [ ] CDN configuration (if implemented)
- [ ] Domain reputation monitoring

### GDPR Compliance Tasks
- [ ] Process data subject requests via auditsuite.uk/gdpr
- [ ] Update privacy policy at auditsuite.uk/privacy
- [ ] Review data retention policies
- [ ] Staff training on UK Data Protection Act 2018
- [ ] Compliance documentation updates

## 📞 Support Contacts

- **Technical Support**: [Your IT Department]
- **Data Protection Officer**: dpo@auditsuite.uk
- **AWS Account Manager**: [Your AWS contact]
- **Domain Support**: [Your DNS provider]
- **Security Team**: [Your security contact]

## 📚 Additional Resources

- [AWS GDPR Center](https://aws.amazon.com/compliance/gdpr-center/)
- [UK ICO Guidance](https://ico.org.uk/for-organisations/guide-to-data-protection/)
- [Local Audit and Accountability Act 2014](https://www.legislation.gov.uk/ukpga/2014/2)
- [AWS Certificate Manager User Guide](https://docs.aws.amazon.com/acm/)
- [CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)

---

**🇬🇧 Your auditsuite.uk deployment is now GDPR and UK Data Protection Act 2018 compliant!**

The infrastructure is optimized for UK local government use with complete audit trails, data sovereignty, and comprehensive GDPR compliance features.

For support, contact your designated Data Protection Officer at dpo@auditsuite.uk or your IT support team. 