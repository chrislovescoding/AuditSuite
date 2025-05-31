# 🚀 AuditSuite Deployment Guide

## Overview
This guide will help you deploy AuditSuite with:
- **Frontend**: Vercel (auditsuite.uk)
- **Backend API**: Vercel (auditsuite-api.vercel.app)
- **Database**: AWS RDS PostgreSQL (already deployed)
- **Storage**: AWS S3 (already deployed)

## 📋 Prerequisites

✅ You already have:
- AWS RDS PostgreSQL database running
- AWS S3 buckets configured
- Vercel account

## 🎯 Step 1: Deploy Backend API to Vercel

### 1.1 Initialize Vercel for Backend
```bash
cd backend
npx vercel
```

When prompted:
- **Project name**: `auditsuite-api`
- **Directory**: `./` (current directory)
- **Settings**: Accept defaults

### 1.2 Add Environment Variables to Vercel Backend
Go to your Vercel dashboard → `auditsuite-api` → Settings → Environment Variables

Add these variables from `backend/.env.production`:

```env
DATABASE_URL=postgresql://postgres:aASX11f3oEFBIovvaHK8Yn2uS@auditsuite-freetier-v2-postgres.clyksio88r13.eu-west-2.rds.amazonaws.com:5432/audit_suite?sslmode=require
DB_HOST=auditsuite-freetier-v2-postgres.clyksio88r13.eu-west-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=audit_suite
DB_USER=postgres
DB_PASSWORD=aASX11f3oEFBIovvaHK8Yn2uS
DB_SSL=true
AWS_REGION=eu-west-2
AWS_S3_BUCKET=auditsuite-freetier-v2-documents-653853167508
NODE_ENV=production
JWT_SECRET=9K7mP2nX8vR4tY6wE1qA5sD3fG8hJ0kL9zX2cV5bN7mQ4rT6yU1iO3pA8sD2fG5h
JWT_EXPIRES_IN=8h
GEMINI_API_KEY=AIzaSyCdzLkLbc4AYO8RN9rxzyII--h9Mjxr7fI
PORT=5000
CORS_ORIGIN=https://auditsuite.uk
FRONTEND_URL=https://auditsuite.uk
GDPR_COMPLIANCE=true
AUDIT_RETENTION_YEARS=7
DATA_LOCATION=UK
COUNCIL_MODE=true
```

### 1.3 Deploy Backend
```bash
npx vercel --prod
```

Your API will be available at: `https://auditsuite-api.vercel.app`

## 🎯 Step 2: Deploy Frontend to Vercel

### 2.1 Initialize Vercel for Frontend
```bash
cd ../frontend
npx vercel
```

When prompted:
- **Project name**: `auditsuite`
- **Directory**: `./` (current directory)
- **Framework**: Next.js
- **Settings**: Accept defaults

### 2.2 Add Environment Variables to Vercel Frontend
Go to your Vercel dashboard → `auditsuite` → Settings → Environment Variables

Add these:
```env
NEXT_PUBLIC_API_URL=https://auditsuite-api.vercel.app
NODE_ENV=production
```

### 2.3 Deploy Frontend
```bash
npx vercel --prod
```

## 🎯 Step 3: Set Up Custom Domain (auditsuite.uk)

### 3.1 Configure Domain in Vercel
1. Go to Vercel Dashboard → `auditsuite` → Settings → Domains
2. Add domain: `auditsuite.uk`
3. Add domain: `www.auditsuite.uk` (redirects to main)

### 3.2 Update DNS Records
Add these records to your domain registrar:

```
Type    Name    Value
A       @       76.76.19.61
CNAME   www     cname.vercel-dns.com
```

### 3.3 Update Backend CORS
Once domain is working, update backend environment variable:
```env
CORS_ORIGIN=https://auditsuite.uk
FRONTEND_URL=https://auditsuite.uk
```

## 🎯 Step 4: Initialize Database

### 4.1 Run Database Migrations
After backend is deployed, your database tables will be created automatically when the app starts.

### 4.2 Create Admin User
Use the API to create your first admin user:
```bash
curl -X POST https://auditsuite-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@auditsuite.uk",
    "password": "SecurePassword123!",
    "name": "System Administrator",
    "role": "admin"
  }'
```

## ✅ Verification

Test these URLs:
- **Frontend**: https://auditsuite.uk
- **API Health**: https://auditsuite-api.vercel.app/api/health
- **Database**: Should connect automatically via environment variables

## 🔧 Troubleshooting

### Backend Not Connecting to Database
- Check environment variables in Vercel dashboard
- Verify database is running in AWS RDS console
- Check CloudWatch logs for connection errors

### Frontend Can't Reach Backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser network tab for API calls
- Ensure CORS_ORIGIN matches your domain

### Authentication Issues
- Verify JWT_SECRET is the same value everywhere
- Check that cookies are being set (HTTPS required for production)

## 📊 Monitoring

- **AWS RDS**: Monitor in AWS CloudWatch
- **Vercel Functions**: Monitor in Vercel dashboard
- **Application Logs**: Available in Vercel function logs

## 🚨 Next Steps

1. Set up monitoring alerts in AWS CloudWatch
2. Configure backup strategy for RDS
3. Set up SSL certificates (automatic with Vercel)
4. Review and test GDPR compliance features
5. Configure email notifications (optional)

---

**🎉 Your AuditSuite is now fully deployed with AWS backend and GDPR compliance!** 