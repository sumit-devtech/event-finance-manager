# Render Deployment Guide

## Configuration for Render.com

### Build Settings

**Root Directory:** (leave empty - use project root)

**Build Command:**
```bash
pnpm install --frozen-lockfile && pnpm --filter @event-finance-manager/database build && pnpm --filter @event-finance-manager/backend build
```

**Start Command:**
```bash
cd apps/backend && node dist/main.js
```

### Important Notes

1. **Root Directory**: Make sure the Root Directory field in Render is **empty** or set to the project root (not `src` or `apps/backend`)

2. **Build Path**: The build command runs from the project root, so paths are relative to root

3. **Start Path**: The start command changes to `apps/backend` directory first, then runs `node dist/main.js`

### If you see error: `Cannot find module '/opt/render/project/src/apps/backend/dist/main'`

This error suggests Render is looking in the wrong path. Check:

1. **Root Directory** in Render settings - should be empty or `/`
2. **Start Command** should be: `cd apps/backend && node dist/main.js`
3. Verify build completed: Check build logs for `dist/main.js` creation
4. If Root Directory is set incorrectly, clear it or set to project root

### Alternative: Using Turbo

If you prefer to use Turbo (recommended):

**Build Command:**
```bash
pnpm install --frozen-lockfile && pnpm build --filter=@event-finance-manager/backend...
```

**Start Command:**
```bash
cd apps/backend && node dist/main.js
```

### Environment Variables

Make sure to set these environment variables in Render:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Port number (Render sets this automatically, but you can override)
- `NODE_ENV` - Set to `production`

### Prisma Database Setup

The database package will automatically generate Prisma client during build. Make sure:

1. `DATABASE_URL` is set correctly
2. Database migrations are run (you may need to add a migration step)

### Troubleshooting

If you see `Cannot find module '/opt/render/project/src/apps/backend/dist/main'`:

1. Check that the build command completed successfully
2. Verify the build output exists: `ls -la apps/backend/dist/main.js`
3. Ensure the start command uses the correct path: `cd apps/backend && node dist/main.js`

