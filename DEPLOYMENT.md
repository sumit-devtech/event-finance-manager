# Deployment Guide for Render

## Frontend Deployment Issues & Solutions

### Issue: Build file not found
**Error:** `ENOENT: no such file or directory, stat '/opt/render/project/src/apps/frontend/build/index.js'`

**Root Cause:** The build command may not be running correctly, or the working directory is incorrect.

### Render Configuration

#### Frontend Service Settings:
- **Root Directory:** `apps/frontend`
- **Build Command:** `cd ../.. && pnpm install && pnpm --filter @event-finance-manager/frontend build`
- **Start Command:** `cd ../.. && pnpm --filter @event-finance-manager/frontend start`

**OR** (if Root Directory is project root):
- **Root Directory:** `/` (project root)
- **Build Command:** `pnpm install && pnpm --filter @event-finance-manager/frontend build`
- **Start Command:** `cd apps/frontend && pnpm start`

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
- `API_BASE_URL` - Backend API URL
- `VITE_API_BASE_URL` - Same as above (for client-side)
- `SESSION_SECRET` - Random secret string
- `NODE_ENV=production`

### Troubleshooting

1. **Check build logs** - Ensure build completes without errors
2. **Verify file exists** - `ls -la apps/frontend/build/` should show `index.js`
3. **Check working directory** - Start command should run from `apps/frontend` directory
4. **Check Node version** - Ensure Node >= 18.0.0

