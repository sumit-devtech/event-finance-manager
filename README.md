# Event Finance Manager

A monorepo for managing event finances, built with Turborepo, Remix, and NestJS.

## Structure

This monorepo contains:

- `apps/frontend` - Remix frontend application
- `apps/backend` - NestJS backend API
- `packages/shared` - Shared TypeScript types and utilities
- `packages/database` - Prisma schema and database client

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Getting Started

1. Fix permissions (if you previously ran commands with sudo):
   ```bash
   sudo chown -R $(whoami) node_modules .turbo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   - Create `.env` files in `apps/backend` and `packages/database` with your `DATABASE_URL`

3. Generate Prisma client:
   ```bash
   pnpm --filter @event-finance-manager/database db:generate
   ```

4. Run database migrations:
   ```bash
   pnpm --filter @event-finance-manager/database db:migrate
   ```

5. Start development servers:
   ```bash
   pnpm dev
   ```

## Available Scripts

- `pnpm build` - Build all packages and apps
- `pnpm dev` - Start all apps in development mode
- `pnpm lint` - Lint all packages and apps
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Type check all packages and apps
- `pnpm clean` - Clean all build artifacts

## Workspace Scripts

You can run scripts for specific packages using pnpm filters:

```bash
# Build a specific package
pnpm --filter @event-finance-manager/frontend build

# Run dev for a specific app
pnpm --filter @event-finance-manager/backend dev

# Run database commands
pnpm --filter @event-finance-manager/database db:studio
```

## Tech Stack

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Frontend**: Remix
- **Backend**: NestJS
- **Database**: Prisma + PostgreSQL
- **Language**: TypeScript
