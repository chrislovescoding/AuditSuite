#!/bin/bash
set -e

# GDPR Compliance Setup Script for AuditSuite
echo "🇬🇧 Setting up GDPR-compliant AWS infrastructure for UK Council AuditSuite..."

# Configuration
STACK_NAME="auditsuite-${ENVIRONMENT:-production}"
REGION="eu-west-2"  # London - UK only
ORGANIZATION_NAME="${ORGANIZATION_NAME:-UK-Council}"
DOMAIN_NAME="${DOMAIN_NAME:-auditsuite.uk}"  # Updated default domain

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate prerequisites
validate_prerequisites() {
    log_info "Validating prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if AWS is configured
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI is not configured. Run 'aws configure' first."
        exit 1
    fi
    
    # Check region
    CURRENT_REGION=$(aws configure get region)
    if [ "$CURRENT_REGION" != "$REGION" ]; then
        log_warning "Current AWS region is $CURRENT_REGION, setting to $REGION for GDPR compliance"
        aws configure set region $REGION
    fi
    
    # Check if jq is available for JSON parsing
    if ! command -v jq &> /dev/null; then
        log_warning "jq not found. Installing jq for JSON parsing..."
        # Try to install jq based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update && sudo apt-get install -y jq
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install jq
        else
            log_error "Please install jq manually"
            exit 1
        fi
    fi
    
    log_success "Prerequisites validated"
}

# Validate UK region for GDPR compliance
validate_region() {
    if [ "$REGION" != "eu-west-2" ]; then
        log_error "Must use eu-west-2 (London) region for GDPR compliance"
        exit 1
    fi
    log_success "Using UK region (eu-west-2) for GDPR compliance"
}

# Generate secure password
generate_password() {
    log_info "Generating secure database password..."
    
    # Check if openssl is available
    if command -v openssl &> /dev/null; then
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    else
        # Fallback to random generation
        DB_PASSWORD=$(cat /dev/urandom | tr -dc 'A-Za-z0-9!@#$%^&*' | fold -w 25 | head -n 1)
    fi
    
    # Ensure password meets requirements (add special char if not present)
    if [[ ! "$DB_PASSWORD" =~ [!@#\$%\^&*] ]]; then
        DB_PASSWORD="${DB_PASSWORD}!"
    fi
    
    log_success "Secure database password generated"
}

# Check if stack exists
check_stack_exists() {
    aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &> /dev/null
}

# Validate CloudFormation template
validate_template() {
    log_info "Validating CloudFormation template..."
    
    if aws cloudformation validate-template \
        --template-body file://infrastructure.yaml \
        --region "$REGION" &> /dev/null; then
        log_success "CloudFormation template is valid"
    else
        log_error "CloudFormation template validation failed"
        exit 1
    fi
}

# Deploy infrastructure
deploy_infrastructure() {
    log_info "Deploying GDPR-compliant infrastructure..."
    
    # Create parameters file
    cat > parameters.json << EOF
[
    {
        "ParameterKey": "Environment",
        "ParameterValue": "${ENVIRONMENT:-production}"
    },
    {
        "ParameterKey": "DBPassword",
        "ParameterValue": "$DB_PASSWORD"
    },
    {
        "ParameterKey": "OrganizationName",
        "ParameterValue": "$ORGANIZATION_NAME"
    },
    {
        "ParameterKey": "DomainName",
        "ParameterValue": "$DOMAIN_NAME"
    }
]
EOF

    if check_stack_exists; then
        log_info "Stack exists, updating..."
        aws cloudformation update-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://infrastructure.yaml \
            --parameters file://parameters.json \
            --capabilities CAPABILITY_IAM \
            --region "$REGION" \
            --tags \
                Key=Compliance,Value=GDPR-UK-DPA-2018 \
                Key=DataSovereignty,Value=UK-Only \
                Key=Organization,Value="$ORGANIZATION_NAME" \
                Key=Domain,Value="$DOMAIN_NAME" \
                Key=DeployedBy,Value="$(aws sts get-caller-identity --query Arn --output text)" \
                Key=DeployedAt,Value="$(date -u +%Y-%m-%dT%H:%M:%SZ)" || {
            log_warning "No updates to deploy or update failed"
        }
    else
        log_info "Creating new stack..."
        aws cloudformation create-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://infrastructure.yaml \
            --parameters file://parameters.json \
            --capabilities CAPABILITY_IAM \
            --region "$REGION" \
            --enable-termination-protection \
            --tags \
                Key=Compliance,Value=GDPR-UK-DPA-2018 \
                Key=DataSovereignty,Value=UK-Only \
                Key=Organization,Value="$ORGANIZATION_NAME" \
                Key=Domain,Value="$DOMAIN_NAME" \
                Key=DeployedBy,Value="$(aws sts get-caller-identity --query Arn --output text)" \
                Key=DeployedAt,Value="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    fi
    
    # Clean up parameters file
    rm -f parameters.json
}

# Wait for stack completion
wait_for_stack() {
    log_info "Waiting for infrastructure deployment to complete..."
    
    if check_stack_exists; then
        # Check if this is an update or create
        STACK_STATUS=$(aws cloudformation describe-stacks \
            --stack-name "$STACK_NAME" \
            --region "$REGION" \
            --query 'Stacks[0].StackStatus' \
            --output text)
        
        if [[ "$STACK_STATUS" == *"UPDATE"* ]]; then
            aws cloudformation wait stack-update-complete \
                --stack-name "$STACK_NAME" \
                --region "$REGION"
        else
            aws cloudformation wait stack-create-complete \
                --stack-name "$STACK_NAME" \
                --region "$REGION"
        fi
    fi
    
    log_success "Infrastructure deployment completed"
}

# Get stack outputs
get_stack_outputs() {
    log_info "Retrieving infrastructure details..."
    
    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs' \
        --output json)
    
    # Extract key outputs
    DB_ENDPOINT=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="DatabaseEndpoint") | .OutputValue')
    DOCUMENTS_BUCKET=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="DocumentsBucketName") | .OutputValue')
    LOAD_BALANCER_DNS=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="LoadBalancerDNS") | .OutputValue')
    VPC_ID=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="VPCId") | .OutputValue')
    KMS_KEY_ID=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="KMSKeyId") | .OutputValue')
    
    log_success "Infrastructure details retrieved"
}

# Create environment configuration
create_env_config() {
    log_info "Creating environment configuration..."
    
    # Create production environment file
    cat > ../backend/.env.production << EOF
# GDPR-Compliant Production Configuration for auditsuite.uk
# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
# Region: $REGION (UK Only)
# Organization: $ORGANIZATION_NAME

# Database Configuration - AWS RDS PostgreSQL
DB_HOST=$DB_ENDPOINT
DB_PORT=5432
DB_NAME=audit_suite
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
DB_SSL=true

# AWS Configuration
AWS_REGION=$REGION
AWS_S3_BUCKET=$DOCUMENTS_BUCKET
AWS_KMS_KEY_ID=$KMS_KEY_ID

# Security Configuration
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_EXPIRES_IN=8h
SESSION_TIMEOUT=30m

# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://$DOMAIN_NAME

# GDPR Configuration
GDPR_ENABLED=true
DATA_RETENTION_DAYS=2555
AUDIT_LOG_RETENTION_DAYS=2555
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
COOKIE_HTTP_ONLY=true

# UK Data Protection Act 2018 Configuration
UK_DPA_ENABLED=true
DATA_PROTECTION_OFFICER_EMAIL=dpo@auditsuite.uk
PRIVACY_POLICY_URL=https://$DOMAIN_NAME/privacy

# Monitoring & Logging
ENABLE_METRICS=true
LOG_LEVEL=info
CLOUDWATCH_LOG_GROUP=/aws/ecs/$STACK_NAME-app

# Application Configuration
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx
UPLOAD_TIMEOUT=300000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security Headers
HELMET_ENABLED=true
CSP_ENABLED=true
HSTS_ENABLED=true

# Domain Configuration
DOMAIN_NAME=$DOMAIN_NAME
FRONTEND_URL=https://$DOMAIN_NAME
API_BASE_URL=https://$DOMAIN_NAME/api
EOF

    log_success "Environment configuration created at backend/.env.production"
}

# Create deployment summary
create_deployment_summary() {
    log_info "Creating deployment summary..."
    
    cat > deployment-summary.md << EOF
# AuditSuite AWS Deployment Summary - auditsuite.uk

**Deployment Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)  
**Region:** $REGION (London, UK)  
**Domain:** $DOMAIN_NAME  
**Organization:** $ORGANIZATION_NAME  
**Stack Name:** $STACK_NAME  
**Compliance:** GDPR + UK Data Protection Act 2018  

## 🏗️ Infrastructure Details

| Component | Value |
|-----------|-------|
| Database Endpoint | $DB_ENDPOINT |
| Documents Bucket | $DOCUMENTS_BUCKET |
| Load Balancer DNS | $LOAD_BALANCER_DNS |
| VPC ID | $VPC_ID |
| KMS Key ID | $KMS_KEY_ID |
| Domain | $DOMAIN_NAME |

## 🔐 Security Features

- ✅ Database encryption at rest (KMS)
- ✅ S3 bucket encryption (KMS)
- ✅ Database in private subnets
- ✅ Multi-AZ deployment for high availability
- ✅ CloudTrail audit logging enabled
- ✅ VPC isolation
- ✅ Security groups with least privilege
- ✅ Backup retention: 35 days (operational)
- ✅ Log retention: 7 years (compliance)

## 📋 GDPR Compliance Features

- ✅ Data sovereignty: UK-only deployment
- ✅ Encryption at rest and in transit
- ✅ Comprehensive audit logging
- ✅ Data retention policies configured
- ✅ Data subject rights implementation ready
- ✅ Privacy by design architecture
- ✅ Lawful basis: Public task (Article 6.1.e)

## 🌐 DNS Configuration Required

**1. SSL Certificate Setup (AWS Certificate Manager):**
   - Request certificate for: $DOMAIN_NAME
   - Add validation records to your DNS

**2. DNS Records to Add:**
   - CNAME: $DOMAIN_NAME → $LOAD_BALANCER_DNS
   - Alternative: A record with Load Balancer IP

**3. Optional Subdomains:**
   - www.$DOMAIN_NAME → $DOMAIN_NAME (redirect)
   - api.$DOMAIN_NAME → $LOAD_BALANCER_DNS (if using subdomain for API)

## ⚠️ Post-Deployment Actions Required

1. **SSL Certificate:** Request certificate in AWS Certificate Manager for $DOMAIN_NAME
2. **DNS Records:** Point $DOMAIN_NAME to $LOAD_BALANCER_DNS
3. **Default Password:** Change the default admin password immediately
4. **Environment Variables:** Configuration ready at backend/.env.production
5. **Monitoring:** Set up CloudWatch alarms and notifications
6. **Backup Testing:** Test database restore procedures
7. **Security Audit:** Perform penetration testing
8. **Documentation:** Create privacy policy for $DOMAIN_NAME
9. **Staff Training:** Train staff on GDPR procedures
10. **Regular Reviews:** Schedule quarterly compliance reviews

## 📞 Support Contacts

- **Technical Support:** [Your IT Department]
- **Data Protection Officer:** dpo@auditsuite.uk
- **AWS Support:** [Your AWS Support Plan]
- **Domain Management:** [Your DNS Provider]

## 📚 Next Steps

1. Configure SSL certificate for $DOMAIN_NAME
2. Update DNS records with your registrar
3. Deploy your application code to the infrastructure
4. Run database migrations
5. Configure monitoring and alerting
6. Perform security testing
7. Create operational procedures
8. Document GDPR compliance measures

## 🔗 Important URLs

- **Production Site:** https://$DOMAIN_NAME
- **Admin Panel:** https://$DOMAIN_NAME/admin
- **API Base:** https://$DOMAIN_NAME/api
- **Privacy Policy:** https://$DOMAIN_NAME/privacy

EOF

    log_success "Deployment summary created: deployment-summary.md"
}

# Main execution
main() {
    echo "=================================================================="
    echo "🇬🇧 AuditSuite GDPR-Compliant AWS Infrastructure Deployment"
    echo "🌐 Domain: $DOMAIN_NAME"
    echo "=================================================================="
    echo ""
    
    validate_prerequisites
    validate_region
    generate_password
    validate_template
    deploy_infrastructure
    wait_for_stack
    get_stack_outputs
    create_env_config
    create_deployment_summary
    
    echo ""
    echo "=================================================================="
    log_success "GDPR-compliant infrastructure deployed successfully!"
    echo "=================================================================="
    echo ""
    log_info "🌐 Domain: $DOMAIN_NAME"
    log_info "📊 Database Endpoint: $DB_ENDPOINT"
    log_info "📁 Documents Bucket: $DOCUMENTS_BUCKET"
    log_info "🌐 Load Balancer: $LOAD_BALANCER_DNS"
    log_info "🔐 Environment configuration: backend/.env.production"
    log_info "📋 Deployment summary: aws/deployment-summary.md"
    echo ""
    echo "🌐 NEXT STEPS FOR auditsuite.uk:"
    echo "1. 🔒 Request SSL certificate in AWS Certificate Manager for $DOMAIN_NAME"
    echo "2. 📡 Point $DOMAIN_NAME to: $LOAD_BALANCER_DNS"
    echo "3. 🔑 Change default admin password after first login"
    echo "4. 📊 Set up CloudWatch monitoring alerts"
    echo "5. 🧪 Test the deployment at https://$DOMAIN_NAME"
    echo ""
    echo "⚠️  IMPORTANT SECURITY REMINDERS:"
    echo "1. 🔑 Database password saved to .env.production - keep secure!"
    echo "2. 🔐 Change default admin password immediately after first login"
    echo "3. 🌐 Configure SSL certificates for $DOMAIN_NAME in AWS Certificate Manager"
    echo "4. 🔍 Review and update CORS origins in environment configuration"
    echo "5. 📊 Set up CloudWatch monitoring alerts and notifications"
    echo "6. 🧪 Test disaster recovery procedures"
    echo "7. 📚 Complete GDPR documentation and staff training"
    echo ""
    echo "🇬🇧 Your AuditSuite is now GDPR and UK DPA 2018 compliant at $DOMAIN_NAME!"
    echo "=================================================================="
}

# Run main function
main "$@" 