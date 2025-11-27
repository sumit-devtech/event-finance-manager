# Event DB Package

Simplified combined database schema for Event Budget Planning System.

## Features

- **Multi-tenancy**: Organization-based data isolation
- **Simple Budget Structure**: BudgetItem directly on Event (no versioning)
- **User Assignments**: EventAssignment model for assigning users to events
- **Expense Tracking**: Expense with approval workflow
- **Analytics**: ROI metrics and CRM sync
- **Subscriptions**: Subscription management with history
- **AI Features**: AI budget suggestions
- **Flexible Files**: Files can link to Event, BudgetItem, or Report

## Setup

1. **Install dependencies** (from root):
   ```bash
   pnpm install
   ```

2. **Set environment variable**:
   ```bash
   export DATABASE_URL_EVENT_DB="your-postgresql-connection-string"
   ```

3. **Generate Prisma Client**:
   ```bash
   cd packages/database
   pnpm db:generate
   ```

4. **Push schema to database**:
   ```bash
   pnpm db:push
   ```

   Or create migration:
   ```bash
   pnpm db:migrate
   ```

5. **Seed database** (optional):
   ```bash
   pnpm db:seed
   ```

## Usage

### Import Prisma Client

```typescript
import { prismaEventDb } from "@event-finance-manager/database";

// Use the client
const events = await prismaEventDb.event.findMany({
  where: { organizationId: orgId }
});
```

### Import Types

```typescript
import type { Event, User, BudgetItem, Expense } from "@event-finance-manager/database";
import { UserRole, EventStatus, BudgetItemCategory } from "@event-finance-manager/database";
```

## Schema Overview

### Core Models

- **Organization**: Multi-tenancy root
- **User**: System users with organizationId
- **Event**: Events with organizationId
- **EventAssignment**: User to Event assignments
- **BudgetItem**: Budget items directly on Event
- **Expense**: Actual expenses with approval workflow
- **ROIMetrics**: ROI calculations per event
- **CRMSync**: CRM integration tracking
- **Subscription**: Subscription management
- **Report**: Generated reports
- **File**: Flexible file storage
- **Notification**: User notifications
- **ActivityLog**: Audit trail
- **AiBudgetSuggestion**: AI-generated budget suggestions

## Database URL

Set `DATABASE_URL_EVENT_DB` environment variable with your PostgreSQL connection string.

## Documentation

### Client Documentation
- **[ER Diagram](docs/ER_DIAGRAM.md)** - High-level entity relationship diagram
- **[Client Documentation](docs/CLIENT_DOCUMENTATION.md)** - Comprehensive workflow documentation for clients
- **[Workflow Diagrams](docs/WORKFLOW_DIAGRAMS.md)** - Visual workflow diagrams for key processes

### Generating ER Diagram PNG
To generate a PNG image from the Mermaid ER diagram:

```bash
cd packages/database/docs
./generate-diagram.sh
```

Or use one of these alternatives:
- **Online**: Copy Mermaid code from `ER_DIAGRAM.md` to [Mermaid Live Editor](https://mermaid.live) and export as PNG
- **VS Code**: Install "Markdown Preview Mermaid Support" extension and export from preview
- **npm**: Install `@mermaid-js/mermaid-cli` globally and run `mmdc -i ER_DIAGRAM.md -o ER_DIAGRAM.png`

## Scripts

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:migrate` - Create and run migration
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with sample data
- `pnpm build` - Build package
- `pnpm type-check` - Type check without building

