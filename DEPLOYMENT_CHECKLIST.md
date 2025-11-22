# Render Deployment Checklist

Follow these steps to deploy your application to Render:

## Prerequisites

- [ ] GitHub repository is connected to Render
- [ ] Render account is set up

## Step 1: Get Your Neon Database Connection String

Since you already have a Neon database:

1. Go to your [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Go to **"Connection Details"** or find your connection string
4. Copy your **connection string** - this is your `DATABASE_URL`
   - Format: `postgresql://user:password@host.neon.tech/database?sslmode=require`
   - **Important:** Neon requires SSL, so make sure your connection string includes SSL parameters
5. Verify your Neon database allows external connections (should be enabled by default)

## Step 2: Deploy Backend Service

### Option A: Using render.yaml (Recommended)

1. In Render Dashboard, click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Render will detect `render.yaml` and create both services
4. **Wait for backend to deploy first** before configuring frontend

### Option B: Manual Setup

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name:** `event-finance-manager-backend`
   - **Root Directory:** (leave empty)
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     pnpm install --frozen-lockfile && pnpm --filter @event-finance-manager/database build && pnpm --filter @event-finance-manager/backend build
     ```
   - **Start Command:**
     ```bash
     cd apps/backend && node dist/apps/backend/src/main.js
     ```

4. **Set Environment Variables:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (from Step 1)
   - `JWT_SECRET` = (generate with: `openssl rand -base64 32`)
   - `PORT` = `10000` (or leave empty for auto)
   - `FRONTEND_URL` = (set this after frontend deploys)

5. Click "Create Web Service"

## Step 3: Run Database Migrations

After backend is deployed:

1. Go to your backend service in Render
2. Click "Shell" tab
3. Run:
   ```bash
   cd apps/backend
   npx prisma migrate deploy
   ```

## Step 4: Deploy Frontend Service

### Option A: Using render.yaml

If you used render.yaml, the frontend service should already be created. Just configure environment variables.

### Option B: Manual Setup

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name:** `event-finance-manager-frontend`
   - **Root Directory:** (leave empty)
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     pnpm install --frozen-lockfile && pnpm --filter @event-finance-manager/database build && pnpm --filter @event-finance-manager/frontend build
     ```
   - **Start Command:**
     ```bash
     cd apps/frontend && pnpm start
     ```

4. **Set Environment Variables:**
   - `NODE_ENV` = `production`
   - `VITE_API_BASE_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
     (Replace `YOUR-BACKEND-URL` with your actual backend service URL)
   - `SESSION_SECRET` = (generate with: `openssl rand -base64 32`)
   - `PORT` = `10000` (or leave empty for auto)

5. Click "Create Web Service"

## Step 5: Update Backend CORS

1. Go to your backend service in Render
2. Update the `FRONTEND_URL` environment variable:
   - `FRONTEND_URL` = `https://YOUR-FRONTEND-URL.onrender.com`
   (Replace `YOUR-FRONTEND-URL` with your actual frontend service URL)
3. The backend will automatically restart

## Step 6: Verify Deployment

1. **Backend Health Check:**
   - Visit: `https://YOUR-BACKEND-URL.onrender.com/api/health`
   - Should return a success response

2. **Frontend:**
   - Visit: `https://YOUR-FRONTEND-URL.onrender.com`
   - Should load the application

3. **Test API Connection:**
   - Try logging in or accessing protected routes
   - Check browser console for any API errors

## Troubleshooting

### Backend won't start
- Check build logs for errors
- Verify `DATABASE_URL` is correct
- Ensure migrations have run
- Check that `dist/apps/backend/src/main.js` exists after build

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` includes `/api` suffix
- Check backend CORS settings (`FRONTEND_URL`)
- Ensure backend service is running
- Check browser console for CORS errors

### Database connection errors
- Verify `DATABASE_URL` is correct (your Neon connection string)
- Check that your Neon connection string includes SSL parameters (`?sslmode=require`)
- Verify Neon database is running and accessible (check Neon dashboard)
- Ensure migrations have run successfully
- If using Neon, check connection limits in Neon dashboard

### Build fails
- Check that all dependencies are in `package.json`
- Verify `pnpm-lock.yaml` is committed
- Check build logs for specific errors

## Environment Variables Summary

### Backend
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<generate-secure-random-string>
FRONTEND_URL=https://your-frontend.onrender.com
PORT=10000
```

### Frontend
```
NODE_ENV=production
VITE_API_BASE_URL=https://your-backend.onrender.com/api
SESSION_SECRET=<generate-secure-random-string>
PORT=10000
```

## Notes

- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid tier for production use
- Neon database works great with Render - no special configuration needed
- Make sure your Neon connection string includes SSL parameters
- Database backups are recommended for production data (Neon provides automatic backups)

