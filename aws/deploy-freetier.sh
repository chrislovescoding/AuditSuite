#!/bin/bash
set -e

echo "🚀 Deploying AuditSuite Free-Tier Database for Vercel..."

# Configuration
STACK_NAME="auditsuite-freetier"
REGION="eu-west-2"  # London

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI not installed. Please install it first."
    exit 1
fi

# Verify AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# Set region
aws configure set region $REGION

# Generate secure password
log_info "Generating database password..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Deploy infrastructure
log_info "Deploying free-tier infrastructure..."

aws cloudformation create-stack \
    --stack-name "$STACK_NAME" \
    --template-body file://infrastructure-freetier.yaml \
    --parameters ParameterKey=DBPassword,ParameterValue="$DB_PASSWORD" \
    --region "$REGION" \
    --tags \
        Key=Purpose,Value=AuditSuite-FreeTier \
        Key=Frontend,Value=Vercel

log_info "Waiting for deployment to complete..."
aws cloudformation wait stack-create-complete \
    --stack-name "$STACK_NAME" \
    --region "$REGION"

# Get outputs
log_info "Getting database connection details..."
OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs' \
    --output json)

DB_ENDPOINT=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="DatabaseEndpoint") | .OutputValue')
CONNECTION_STRING=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="DatabaseConnectionString") | .OutputValue')

# Create Vercel environment file
log_info "Creating Vercel environment configuration..."
cat > ../vercel-env.txt << EOF
# Add these environment variables to your Vercel project:

DATABASE_URL=$CONNECTION_STRING
DB_HOST=$DB_ENDPOINT
DB_PORT=5432
DB_NAME=audit_suite
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
DB_SSL=true

# AWS Configuration (for S3 if needed)
AWS_REGION=$REGION
AWS_ACCESS_KEY_ID=[Your AWS Access Key]
AWS_SECRET_ACCESS_KEY=[Your AWS Secret Key]

# Application Configuration
NODE_ENV=production
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://auditsuite.uk
EOF

log_success "Deployment completed!"
echo ""
echo "🌐 Database Endpoint: $DB_ENDPOINT"
echo "🔗 Connection String: $CONNECTION_STRING"
echo "📁 Environment variables saved to: vercel-env.txt"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Copy environment variables from vercel-env.txt to Vercel"
echo "2. Deploy your backend API to Vercel"
echo "3. Run database migrations"
echo "4. Deploy your frontend to Vercel" 