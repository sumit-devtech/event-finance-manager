# Quick Deploy Guide

## What I've Prepared For You ✅

1. ✅ **render.yaml** - Blueprint configuration for automatic deployment
2. ✅ **DEPLOY_STEPS.md** - Complete step-by-step guide
3. ✅ **DEPLOYMENT_CHECKLIST.md** - Quick checklist
4. ✅ **RENDER_DEPLOYMENT.md** - Technical reference

## What You Need To Do (5 Steps)

### Step 1: Generate Secrets
Run these commands to generate secure secrets:
```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For SESSION_SECRET
```
Save both values - you'll need them!

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

### Step 3: Get Your Neon Database URL
1. Go to your Neon dashboard
2. Copy your **connection string** (the one you use locally)
3. This will be your `DATABASE_URL` - it should look like: `postgresql://user:password@host.neon.tech/database`

### Step 4: Deploy Using Blueprint
1. In Render Dashboard: "New +" → "Blueprint"
2. Connect your GitHub repo
3. Render will auto-detect `render.yaml` and create both services
4. **Set environment variables** in each service:
   - **Backend:** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (set after frontend deploys)
   - **Frontend:** `VITE_API_BASE_URL` (backend URL + `/api`), `SESSION_SECRET`

### Step 5: Run Migrations
1. Go to backend service → "Shell" tab
2. Run: `cd apps/backend && npx prisma migrate deploy`

## That's It! 🎉

Your app will be live at:
- Frontend: `https://event-finance-manager-frontend.onrender.com`
- Backend: `https://event-finance-manager-backend.onrender.com/api`

For detailed instructions, see **DEPLOY_STEPS.md**

