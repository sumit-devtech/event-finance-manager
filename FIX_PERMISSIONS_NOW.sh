#!/bin/bash
# IMMEDIATE FIX for permission issues
# Run this script to fix all permission problems RIGHT NOW

echo "🔧 Fixing all permission issues..."
echo ""
echo "This will require your password to fix root-owned files."
echo ""

# Get current user
CURRENT_USER=$(whoami)

# Fix frontend build directory
echo "1. Fixing frontend build directory..."
sudo chown -R "$CURRENT_USER:staff" "/Volumes/Work/My Work/event-finance-manager/apps/frontend/public/build" 2>/dev/null || true
sudo chmod -R u+rw "/Volumes/Work/My Work/event-finance-manager/apps/frontend/public/build" 2>/dev/null || true

# Fix cache directory
echo "2. Fixing cache directory..."
sudo chown -R "$CURRENT_USER:staff" "/Volumes/Work/My Work/event-finance-manager/apps/frontend/.cache" 2>/dev/null || true
sudo chmod -R u+rw "/Volumes/Work/My Work/event-finance-manager/apps/frontend/.cache" 2>/dev/null || true

# Remove root-owned build files if they exist
echo "3. Cleaning root-owned files..."
sudo rm -rf "/Volumes/Work/My Work/event-finance-manager/apps/frontend/public/build" 2>/dev/null || true
sudo rm -rf "/Volumes/Work/My Work/event-finance-manager/apps/frontend/.cache" 2>/dev/null || true

echo ""
echo "✅ Permissions fixed!"
echo ""
echo "Now you can run:"
echo "  pnpm --filter @event-finance-manager/frontend dev"
echo ""
echo "⚠️  IMPORTANT: Never use 'sudo' with pnpm/npm commands!"
echo "   Always run: pnpm build (NOT: sudo pnpm build)"

