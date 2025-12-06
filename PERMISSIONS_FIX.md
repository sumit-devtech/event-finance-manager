# Permission Fix Guide

## Problem
After running commands with `sudo`, build directories and files may be owned by `root`, causing permission errors like:
```
EACCES: permission denied, open '/path/to/build/file'
```

## Quick Fix

Run the fix-permissions script from the project root:

```bash
./fix-permissions.sh
```

This will prompt for your sudo password and fix all build directories.

## Manual Fix

If the script doesn't work, run these commands manually:

```bash
# Fix frontend build directories
sudo chown -R $(whoami):staff apps/frontend/public/build
sudo chown -R $(whoami):staff apps/frontend/.cache

# Fix backend build directories  
sudo chown -R $(whoami):staff apps/backend/dist

# Fix package build directories
sudo chown -R $(whoami):staff packages/database/dist
sudo chown -R $(whoami):staff packages/shared/dist

# Fix node_modules if needed
sudo chown -R $(whoami):staff node_modules
sudo chown -R $(whoami):staff apps/*/node_modules
sudo chown -R $(whoami):staff packages/*/node_modules
```

## Prevention

**❌ DON'T use sudo with build commands:**
```bash
sudo pnpm install      # ❌ Wrong
sudo turbo build       # ❌ Wrong
sudo pnpm dev          # ❌ Wrong
```

**✅ DO use normal commands:**
```bash
pnpm install           # ✅ Correct
turbo build            # ✅ Correct
pnpm dev               # ✅ Correct
```

## Why This Happens

When you run `sudo pnpm install` or `sudo turbo build`, files are created as `root` user. Later, when you try to run `pnpm dev` without sudo, your user doesn't have permission to write to those files.

## Solution

Always run build and dev commands without `sudo`. Only use `sudo` for system-level operations, not for project-specific commands.






