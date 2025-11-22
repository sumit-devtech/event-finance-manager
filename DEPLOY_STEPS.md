# Step-by-Step Render Deployment Guide

Follow these steps in order to deploy your application to Render.

## Step 1: Prepare Your Repository

✅ **Ensure your code is pushed to GitHub**
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

## Step 2: Get Your Neon Database Connection String

Since you already have a Neon database, you'll use that connection string:

1. Go to your [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Go to **"Connection Details"** or **"Connection String"**
4. Copy your **connection string** - this is your `DATABASE_URL`
   - Format: `postgresql://user:password@host.neon.tech/database?sslmode=require`
   - **Important:** Use the connection string that includes SSL parameters (Neon requires SSL)
5. **Note:** Make sure your Neon database allows connections from Render's IP addresses (Neon databases are publicly accessible by default, but check your firewall settings if needed)

## Step 3: Deploy Backend Service

### Option A: Using Blueprint (Easiest - Recommended)

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub account if not already connected
3. Select your repository: `event-finance-manager`
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**
6. Render will create both services (backend and frontend)
7. **Wait for backend to finish deploying first** before proceeding

### Option B: Manual Backend Setup

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`event-finance-manager`)
3. Configure the service:
   - **Name:** `event-finance-manager-backend`
   - **Region:** Same as database (e.g., `Oregon`)
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** (leave **empty** - very important!)
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     pnpm install --frozen-lockfile && pnpm --filter @event-finance-manager/database build && pnpm --filter @event-finance-manager/backend build
     ```
   - **Start Command:**
     ```bash
     cd apps/backend && node dist/apps/backend/src/main.js
     ```
   - **Plan:** Free tier for testing, or Starter for production
4. Click **"Advanced"** → **"Add Environment Variable"** and add:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (paste from Step 2)
   - `JWT_SECRET` = (generate one: run `openssl rand -base64 32` in terminal)
   - `PORT` = `10000` (or leave empty - Render sets automatically)
   - `FRONTEND_URL` = (leave empty for now, set after frontend deploys)
5. Click **"Create Web Service"**
6. **Wait for deployment to complete** (5-10 minutes)

## Step 4: Run Database Migrations

After backend deployment completes:

1. Go to your backend service in Render Dashboard
2. Click on the **"Shell"** tab (or "Logs" tab)
3. Click **"Open Shell"** or use the terminal interface
4. Run these commands:
   ```bash
   cd apps/backend
   npx prisma migrate deploy
   ```
5. Wait for migrations to complete
6. You should see: `All migrations have been successfully applied`

## Step 5: Get Backend URL

1. Go to your backend service in Render Dashboard
2. Find the **"URL"** section (usually at the top)
3. Copy the URL (e.g., `https://event-finance-manager-backend.onrender.com`)
4. **Save this URL** - you'll need it for the frontend

## Step 6: Update Backend CORS (Temporary)

1. Go to your backend service → **"Environment"** tab
2. Add/Update: `FRONTEND_URL` = `https://event-finance-manager-frontend.onrender.com`
   - (Use the frontend URL you'll get in Step 7, or update after)
3. Backend will automatically restart

## Step 7: Deploy Frontend Service

### If you used Blueprint (Option A):

The frontend service should already be created. Just configure environment variables:

1. Go to your frontend service (`event-finance-manager-frontend`)
2. Click **"Environment"** tab
3. Add/Update these variables:
   - `VITE_API_BASE_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
     - Replace `YOUR-BACKEND-URL` with your actual backend URL from Step 5
     - **Important:** Include `/api` at the end!
   - `SESSION_SECRET` = (generate one: run `openssl rand -base64 32`)
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave empty)
4. Service will automatically redeploy

### If Manual Setup (Option B):

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`event-finance-manager`)
3. Configure the service:
   - **Name:** `event-finance-manager-frontend`
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** (leave **empty**)
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     pnpm install --frozen-lockfile && pnpm --filter @event-finance-manager/database build && pnpm --filter @event-finance-manager/frontend build
     ```
   - **Start Command:**
     ```bash
     cd apps/frontend && pnpm start
     ```
   - **Plan:** Free tier for testing, or Starter for production
4. Click **"Advanced"** → **"Add Environment Variable"** and add:
   - `NODE_ENV` = `production`
   - `VITE_API_BASE_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
     - Replace `YOUR-BACKEND-URL` with your actual backend URL
     - **Important:** Include `/api` at the end!
   - `SESSION_SECRET` = (generate one: run `openssl rand -base64 32`)
   - `PORT` = `10000` (or leave empty)
5. Click **"Create Web Service"**
6. **Wait for deployment to complete** (5-10 minutes)

## Step 8: Update Backend CORS (Final)

1. Go to your backend service → **"Environment"** tab
2. Update `FRONTEND_URL` = `https://YOUR-FRONTEND-URL.onrender.com`
   - Replace with your actual frontend URL
3. Backend will automatically restart

## Step 9: Verify Deployment

### Test Backend:
1. Visit: `https://YOUR-BACKEND-URL.onrender.com/api/health`
2. Should return: `{"status":"ok"}` or similar

### Test Frontend:
1. Visit: `https://YOUR-FRONTEND-URL.onrender.com`
2. Should load your application
3. Try logging in with test credentials:
   - Email: `admin@test.com`
   - Password: `password123`

### Check for Errors:
1. Open browser Developer Tools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab for failed API requests
4. If you see CORS errors, verify `FRONTEND_URL` in backend is correct

## Step 10: Troubleshooting

### Backend won't start:
- ✅ Check **Logs** tab for error messages
- ✅ Verify `DATABASE_URL` is correct
- ✅ Ensure migrations ran successfully (Step 4)
- ✅ Check that build completed (look for `dist/apps/backend/src/main.js` in logs)

### Frontend can't connect to backend:
- ✅ Verify `VITE_API_BASE_URL` includes `/api` suffix
- ✅ Check backend is running (visit `/api/health`)
- ✅ Verify `FRONTEND_URL` in backend matches frontend URL
- ✅ Check browser console for CORS errors

### Database connection errors:
- ✅ Verify `DATABASE_URL` uses "Internal Database URL" (not external)
- ✅ Check database is not paused (free tier pauses after inactivity)
- ✅ Ensure migrations ran successfully

### Build fails:
- ✅ Check build logs for specific errors
- ✅ Verify `pnpm-lock.yaml` is committed to repository
- ✅ Ensure all dependencies are in `package.json`

## Quick Reference: Environment Variables

### Backend Service:
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=<32-character-random-string>
FRONTEND_URL=https://your-frontend.onrender.com
PORT=10000
```

### Frontend Service:
```
NODE_ENV=production
VITE_API_BASE_URL=https://your-backend.onrender.com/api
SESSION_SECRET=<32-character-random-string>
PORT=10000
```

## Important Notes

⚠️ **Free Tier Limitations:**
- Render services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Consider upgrading for production use

✅ **Best Practices:**
- Use strong, unique secrets (`JWT_SECRET`, `SESSION_SECRET`)
- Keep environment variables secure (never commit to git)
- Monitor logs regularly
- Neon database connection strings include SSL - make sure your connection string has `?sslmode=require` or similar SSL parameters
- Use custom domains for production (available on paid plans)

💡 **Neon Database Notes:**
- Neon databases are cloud-hosted and work great with Render
- Your Neon connection string should work directly - no special configuration needed
- Make sure your Neon database allows external connections (enabled by default)
- If you have connection issues, check Neon dashboard for connection limits or firewall settings

## Success Checklist

- [ ] Neon database connection string ready
- [ ] Backend deployed and accessible at `/api/health`
- [ ] Database migrations completed successfully
- [ ] Frontend deployed and accessible
- [ ] Frontend can connect to backend API
- [ ] Login functionality works
- [ ] No CORS errors in browser console
- [ ] Both services are running (not paused)

---

**Need Help?** Check the detailed guides:
- [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) - Detailed technical guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Quick checklist

