# Pre-Deployment Check Scripts

These scripts help you catch errors locally before deploying to production.

## Quick Start

```bash
# Run TypeScript checks (recommended before every commit/deploy)
pnpm check

# Run full checks (includes builds, linting, etc.)
pnpm check:full
```

## Available Scripts

### `pnpm check`
Runs TypeScript type-checking on all packages:
- ✅ Shared package
- ✅ Database package  
- ✅ Backend package
- ✅ Frontend package

**Ignores file permission errors** - only reports actual TypeScript code errors.

### `pnpm check:full`
Comprehensive pre-deployment check:
- TypeScript type-checking
- Production builds
- Linting (if configured)
- Common issues check

### `pnpm pre-deploy`
Runs `pnpm check` and shows a success message if ready for deployment.

## Manual Checks

You can also run checks individually:

```bash
# Check specific package
pnpm --filter @event-finance-manager/backend type-check
pnpm --filter @event-finance-manager/frontend type-check

# Build specific package
pnpm --filter @event-finance-manager/backend build
pnpm --filter @event-finance-manager/frontend build
```

## What Gets Checked

### TypeScript Errors
- Type mismatches
- Missing imports
- Undefined variables
- Incorrect type usage

### Build Errors
- Compilation failures
- Missing dependencies
- Configuration issues

## Troubleshooting

### Permission Errors
If you see `EACCES: permission denied` errors:
- These are file system permission issues, not code errors
- The check script automatically ignores these
- To fix: `sudo chmod -R u+w .` (use with caution)

### Prisma Client Not Found
If Prisma client is missing:
```bash
pnpm --filter @event-finance-manager/database db:generate
```

## Best Practices

1. **Before committing**: Run `pnpm check`
2. **Before deploying**: Run `pnpm check:full`
3. **In CI/CD**: Add `pnpm check` to your pipeline
4. **Fix errors immediately**: Don't deploy with TypeScript errors

## Integration with CI/CD

Add to your CI pipeline:
```yaml
# Example GitHub Actions
- name: Check types
  run: pnpm check

- name: Build
  run: pnpm build
```

