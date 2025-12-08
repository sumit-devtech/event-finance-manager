# Deploy to Render.com - Step by Step Guide

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Render Account**: Sign up at https://render.com
3. **Resend Account**: Get API key from https://resend.com/api-keys

## Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Name: `event-finance-manager-db`
3. Region: `Oregon` (same as services)
4. Plan: `Starter` (free tier)
5. Click **Create Database**
6. **Copy the Internal Database URL** (you'll need this)

## Step 2: Connect GitHub Repository

1. Go to Render Dashboard → **New** → **Blueprint**
2. Connect your GitHub account if not already connected
3. Select repository: `event-finance-manager`
4. Render will detect `render.yaml` automatically

## Step 3: Configure Backend Service

After blueprint is created, configure the backend:

### Environment Variables (Backend)

Go to **Backend Service** → **Environment** tab and add:

```env
# Database
DATABASE_URL=<paste-internal-database-url-from-step-1>

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=<generate-secure-random-string>
JWT_REFRESH_SECRET=<generate-secure-random-string>

# Frontend URL (update after frontend deploys)
FRONTEND_URL=https://event-finance-manager-frontend.onrender.com

# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key_here
SMTP_FROM=onboarding@resend.dev  # Use test email for now

# Optional: JWT Expiration (defaults work fine)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### Generate Secrets

Run these commands to generate secure secrets:

```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
openssl rand -base64 32  # For SESSION_SECRET (frontend)
```

## Step 4: Run Database Migrations

1. Go to Backend Service → **Shell** tab
2. Run:
```bash
cd apps/backend
pnpm --filter @event-finance-manager/database exec prisma migrate deploy
```

Or use Render's **PostgreSQL** → **Connect** → **psql** and run migrations manually.

## Step 5: Configure Frontend Service

After backend is deployed, configure frontend:

### Environment Variables (Frontend)

Go to **Frontend Service** → **Environment** tab and add:

```env
# Backend API URL (use your backend URL)
VITE_API_BASE_URL=https://event-finance-manager-backend.onrender.com/api

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=<generate-secure-random-string>
```

## Step 6: Update Backend CORS

After frontend URL is known, update backend's `FRONTEND_URL` environment variable:

```env
FRONTEND_URL=https://event-finance-manager-frontend.onrender.com
```

Then **Manual Deploy** the backend to apply changes.

## Step 7: Verify Deployment

1. **Backend Health Check**: 
   - Visit: `https://event-finance-manager-backend.onrender.com/api/health` (if exists)
   - Should return 200 OK

2. **Frontend**:
   - Visit: `https://event-finance-manager-frontend.onrender.com`
   - Should load the login page

3. **Test Registration**:
   - Try registering a new user
   - Check email is sent (check Resend dashboard)

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `pnpm-lock.yaml` is committed
- Verify Node.js version (should be 18+)

### Database Connection Issues
- Verify `DATABASE_URL` uses **Internal Database URL** (not public)
- Check database is in same region as services

### Email Not Sending
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for API usage/errors
- Use `onboarding@resend.dev` for testing (no domain verification needed)

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches frontend URL exactly
- Include protocol (`https://`) and no trailing slash

## Quick Reference

### Service URLs
- Backend: `https://event-finance-manager-backend.onrender.com`
- Frontend: `https://event-finance-manager-frontend.onrender.com`
- Database: Internal connection only

### Required Environment Variables

**Backend:**
- `DATABASE_URL` ✅
- `JWT_SECRET` ✅
- `RESEND_API_KEY` ✅
- `SMTP_FROM` ✅
- `FRONTEND_URL` ✅

**Frontend:**
- `VITE_API_BASE_URL` ✅
- `SESSION_SECRET` ✅

## Next Steps After Deployment

1. **Verify Domain** in Resend (for production emails)
2. **Update SMTP_FROM** to use verified domain
3. **Set up custom domain** (optional)
4. **Enable auto-deploy** from main branch
5. **Set up monitoring** (optional)

