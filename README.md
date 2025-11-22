# Event Finance Manager

Event Finance Manager application with NestJS backend and Remix frontend.

## Architecture

- **Backend**: NestJS API running on `http://localhost:3333/api`
- **Frontend**: Remix app running on `http://localhost:5173`
- **Database**: PostgreSQL (Neon)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

```bash
cd packages/database
pnpm db:generate  # Generate Prisma Client
pnpm db:push      # Push schema to database
pnpm db:seed      # Create test users
```

### 3. Start Backend

```bash
cd apps/backend
pnpm dev
```

Backend will run on: `http://localhost:3333/api`

### 4. Start Frontend

```bash
cd apps/frontend
pnpm dev
```

Frontend will run on: `http://localhost:5173`

## Test Users

After running `pnpm db:seed`, you can login with:

- **Admin**: `admin@test.com` / `password123`
- **Event Manager**: `manager@test.com` / `password123`
- **Finance**: `finance@test.com` / `password123`
- **Viewer**: `viewer@test.com` / `password123`

## Environment Variables

### Backend (`apps/backend/.env`)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Backend port (default: 3333)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

### Frontend (`apps/frontend/.env`)
- `API_BASE_URL` - Backend API URL (default: http://localhost:3333/api)
- `SESSION_SECRET` - Session encryption secret

## Port Configuration

- **Backend**: Port `3333` (NestJS API)
- **Frontend**: Port `5173` (Remix/Vite dev server)

Make sure both services are running on different ports!

## Deployment

This application can be deployed to Render.com. See the deployment guides:

- **[DEPLOY_STEPS.md](./DEPLOY_STEPS.md)** ⭐ **START HERE** - Complete step-by-step guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Quick checklist reference
- **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Detailed technical guide

### Quick Deploy to Render

1. **Create PostgreSQL database** on Render
2. **Deploy backend** using `render.yaml` blueprint (or manual setup)
3. **Run database migrations** via Render Shell
4. **Deploy frontend** and configure `VITE_API_BASE_URL`
5. **Update backend CORS** with frontend URL

👉 **For complete instructions, see [DEPLOY_STEPS.md](./DEPLOY_STEPS.md)**
