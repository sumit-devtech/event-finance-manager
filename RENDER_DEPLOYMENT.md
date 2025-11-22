# Render Deployment Guide

This guide covers deploying both the backend API and frontend web application to Render.com.

## Quick Start: Using render.yaml (Recommended)

The easiest way to deploy is using the `render.yaml` file included in the repository:

1. **Connect your GitHub repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create both services

2. **Set Environment Variables**
   After the services are created, you'll need to set these environment variables in the Render dashboard:

   **Backend Service:**
   - `DATABASE_URL` - PostgreSQL connection string (create a PostgreSQL database in Render first)
   - `JWT_SECRET` - Generate a secure random string (e.g., `openssl rand -base64 32`)

   **Frontend Service:**
   - `SESSION_SECRET` - Generate a secure random string (e.g., `openssl rand -base64 32`)

   **Note:** `FRONTEND_URL` and `VITE_API_BASE_URL` are automatically set via service references in `render.yaml`.

3. **Run Database Migrations**
   After the backend is deployed, you'll need to run Prisma migrations:
   ```bash
   # SSH into the backend service or use Render Shell
   cd apps/backend
   npx prisma migrate deploy
   ```

## Manual Deployment

If you prefer to set up services manually:

### Backend API Service

**Service Type:** Web Service

**Build Settings:**
- **Root Directory:** (leave empty - use project root)
- **Build Command:**
  ```bash
  pnpm install --frozen-lockfile && pnpm --filter @event-finance-manager/database build && pnpm --filter @event-finance-manager/backend build
  ```
- **Start Command:**
  ```bash
  cd apps/backend && node dist/apps/backend/src/main.js
  ```

**Environment Variables:**
- `NODE_ENV` = `production`
- `PORT` = `10000` (or leave empty, Render will set automatically)
- `DATABASE_URL` = Your PostgreSQL connection string
- `JWT_SECRET` = A secure random string
- `FRONTEND_URL` = Your frontend service URL (e.g., `https://event-finance-manager-frontend.onrender.com`)

### Frontend Web Service

**Service Type:** Web Service

**Build Settings:**
- **Root Directory:** (leave empty - use project root)
- **Build Command:**
  ```bash
  pnpm install --frozen-lockfile && pnpm --filter @event-finance-manager/database build && pnpm --filter @event-finance-manager/frontend build
  ```
- **Start Command:**
  ```bash
  cd apps/frontend && pnpm start
  ```

**Environment Variables:**
- `NODE_ENV` = `production`
- `PORT` = `10000` (or leave empty, Render will set automatically)
- `VITE_API_BASE_URL` = Your backend API URL with `/api` suffix (e.g., `https://event-finance-manager-backend.onrender.com/api`)
- `SESSION_SECRET` = A secure random string

## Important Notes

1. **Root Directory**: Always leave empty or set to project root (not `src` or `apps/backend`)

2. **Build Path**: The build command runs from the project root, so paths are relative to root

3. **Start Path**: The start command changes to the appropriate app directory first

4. **Service Dependencies**: Deploy the backend first, then the frontend, so the frontend can reference the backend URL

5. **Database Setup**: 
   - Create a PostgreSQL database in Render first
   - Use the connection string as `DATABASE_URL`
   - Run migrations after first deployment: `npx prisma migrate deploy`

## Environment Variable Reference

### Backend Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `FRONTEND_URL` - Frontend URL for CORS (auto-set if using render.yaml)
- `PORT` - Server port (auto-set by Render)
- `NODE_ENV` - Set to `production`

### Frontend Required Variables
- `VITE_API_BASE_URL` - Backend API URL (auto-set if using render.yaml)
- `SESSION_SECRET` - Secret for session management
- `PORT` - Server port (auto-set by Render)
- `NODE_ENV` - Set to `production`

## Troubleshooting

### Backend: `Cannot find module '/opt/render/project/src/apps/backend/dist/main'`

This error suggests Render is looking in the wrong path. Check:

1. **Root Directory** in Render settings - should be empty or `/`
2. **Start Command** should be: `cd apps/backend && node dist/apps/backend/src/main.js`
3. Verify build completed: Check build logs for `dist/apps/backend/src/main.js` creation
4. If Root Directory is set incorrectly, clear it or set to project root

### Frontend: Build fails or API calls fail

1. Ensure `VITE_API_BASE_URL` is set correctly (must include `/api` suffix)
2. Check that backend service is running and accessible
3. Verify CORS is configured correctly in backend (check `FRONTEND_URL`)

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Ensure database is accessible from Render (check firewall settings)
3. Run migrations: `npx prisma migrate deploy`

### Service Communication

1. Backend URL should be accessible from frontend
2. Frontend URL should be in backend's CORS allowed origins
3. Check Render service logs for connection errors

