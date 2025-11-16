# Deployment Guide for Render

## Frontend Deployment Issues & Solutions

### Issue: Build file not found
**Error:** `ENOENT: no such file or directory, stat '/opt/render/project/src/apps/frontend/build/index.js'`

**Root Cause:** The build command may not be running correctly, or the working directory is incorrect.

### Render Configuration

#### Backend Service Settings:
- **Root Directory:** `apps/backend`
- **Build Command:** `cd ../.. && pnpm install --frozen-lockfile && cd packages/database && pnpm db:generate && pnpm db:push && cd ../../apps/backend && pnpm build`
- **Start Command:** `pnpm start:prod`
- **Why this works:** Runs from backend directory, goes to root for install, then builds only backend (no frontend)

#### Frontend Service Settings:
- **Root Directory:** `apps/frontend`
- **Build Command:** `cd ../.. && pnpm install --frozen-lockfile && cd apps/frontend && pnpm build`
- **Start Command:** `node build/index.js`

**OR** (if Root Directory is project root):
- **Root Directory:** `/` (project root)
- **Build Command:** `pnpm install --frozen-lockfile && pnpm --filter @event-finance-manager/frontend build`
- **Start Command:** `cd apps/frontend && node build/index.js`

### Why Backend Doesn't Build Frontend

The backend build command uses direct `pnpm build` commands instead of Turbo, which ensures:
1. ✅ Only builds backend and its dependencies (database, shared)
2. ✅ Doesn't trigger frontend build
3. ✅ Faster build times
4. ✅ Independent deployments

**Backend dependencies:**
- `@event-finance-manager/database` ✅ (will build)
- `@event-finance-manager/shared` ✅ (will build)
- `@event-finance-manager/frontend` ❌ (NOT a dependency, won't build)

### Alternative: Use Node directly

If `remix-serve` has issues, you can use Node directly:

**Update `apps/frontend/package.json`:**
```json
{
  "scripts": {
    "start": "node build/index.js"
  }
}
```

### Verify Build Output

After build, verify the file exists:
```bash
ls -la apps/frontend/build/index.js
```

If it doesn't exist, check:
1. Build command completed successfully
2. Working directory is correct
3. No build errors in logs

### Environment Variables

Make sure these are set in Render:

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string (Internal Database URL)
- `JWT_SECRET` - Random secret string
- `PORT` - `3333`
- `NODE_ENV` - `production`
- `FRONTEND_URL` - Your frontend URL (e.g., `https://your-frontend.onrender.com`)

**Frontend:**
- `API_BASE_URL` - Backend API URL (e.g., `https://your-backend.onrender.com/api`)
- `VITE_API_BASE_URL` - Same as above (for client-side)
- `SESSION_SECRET` - Random secret string
- `NODE_ENV` - `production`
- `PORT` - `3000` (or let Render assign)

### Troubleshooting

1. **Check build logs** - Ensure build completes without errors
2. **Verify file exists** - `ls -la apps/frontend/build/` should show `index.js`
3. **Check working directory** - Start command should run from correct directory
4. **Check Node version** - Ensure Node >= 18.0.0
5. **Backend building frontend?** - Use direct `pnpm build` instead of Turbo to avoid building all packages
