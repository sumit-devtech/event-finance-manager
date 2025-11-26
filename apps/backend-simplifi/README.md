# Backend Simplifi - NestJS API

This is the NestJS backend application for the Event Finance Manager Simplifi system, using the new `schemasimplifi.prisma` database schema.

## Features

- Uses the Simplifi Prisma schema with enhanced features:
  - Organizations and multi-tenancy
  - Subscription management
  - Vendor management
  - Budget versions
  - Approval workflows
  - ROI metrics and CRM sync
  - Enhanced reporting

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database (configured via `DATABASE_URL_SIMPLIFI`)

## Setup

1. **Install dependencies** (from root):
   ```bash
   pnpm install
   ```

2. **Set environment variables**:
   Create a `.env` file in `packages/database/` or set:
   ```bash
   export DATABASE_URL_SIMPLIFI="your-postgresql-connection-string"
   ```

3. **Generate Prisma Client**:
   ```bash
   cd packages/database
   pnpm simplifi:generate
   ```

4. **Build database package**:
   ```bash
   cd packages/database
   pnpm build
   ```

5. **Build backend**:
   ```bash
   cd apps/backend-simplifi
   pnpm build
   ```

## Running

### Development Mode

```bash
cd apps/backend-simplifi
pnpm dev
```

The API will be available at: `http://localhost:3334/api`

### Production Mode

```bash
cd apps/backend-simplifi
pnpm start
```

## API Endpoints

- `GET /api` - Welcome message
- `GET /api/health` - Health check with database connection status

## Configuration

- **Port**: Default `3334` (configurable via `PORT` env variable)
- **API Prefix**: `/api`
- **CORS**: Configured for frontend on `http://localhost:5173`

## Database

This backend uses the Simplifi schema (`schemasimplifi.prisma`) which is completely separate from the original schema. The database connection is configured via `DATABASE_URL_SIMPLIFI` environment variable.

## Project Structure

```
apps/backend-simplifi/
├── src/
│   ├── prisma/          # Prisma service and module
│   ├── config/          # Configuration module
│   ├── health/          # Health check controller
│   ├── app.module.ts    # Root module
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts          # Application entry point
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Differences from Original Backend

- Uses `DATABASE_URL_SIMPLIFI` instead of `DATABASE_URL`
- Uses `PrismaClientSimplifi` from `@event-finance-manager/database`
- Runs on port `3334` by default (vs `3333`)
- Completely independent database and schema

## Troubleshooting

### Permission Errors

If you encounter permission errors when building:
1. Try running from the root directory: `pnpm --filter @event-finance-manager/backend-simplifi build`
2. Check file permissions on external drives
3. Run `pnpm install` from root to ensure all dependencies are linked

### Database Connection Issues

- Verify `DATABASE_URL_SIMPLIFI` is set correctly
- Check database is accessible
- Run `pnpm simplifi:studio` to verify schema is pushed

### Build Errors

- Ensure database package is built first: `cd packages/database && pnpm build`
- Check TypeScript paths in `tsconfig.json`
- Verify all workspace dependencies are installed

## Next Steps

To add new modules:
1. Create module files in `src/` directory
2. Import in `app.module.ts`
3. Use `PrismaService` from `src/prisma/prisma.service` to access the database

Example:
```typescript
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MyService {
  constructor(private prisma: PrismaService) {}
  
  async findAll() {
    return this.prisma.client.organization.findMany();
  }
}
```

