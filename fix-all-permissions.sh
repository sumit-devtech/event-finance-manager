#!/bin/bash
# Comprehensive permission fix script
# This fixes permission issues caused by running commands with sudo

set -e

echo "🔧 Fixing all permissions in the project..."
echo ""

# Get current user
CURRENT_USER=$(whoami)
CURRENT_GROUP="staff"

echo "Current user: $CURRENT_USER"
echo "Current group: $CURRENT_GROUP"
echo ""

# Function to fix permissions for a directory
fix_permissions() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo "Fixing permissions for: $dir"
        sudo chown -R "$CURRENT_USER:$CURRENT_GROUP" "$dir"
        chmod -R u+rw "$dir"
        echo "✓ Fixed: $dir"
    fi
}

# Fix root directory
echo "1. Fixing root directory permissions..."
sudo chown -R "$CURRENT_USER:$CURRENT_GROUP" "/Volumes/Work/My Work/event-finance-manager"
chmod -R u+rw "/Volumes/Work/My Work/event-finance-manager"
echo "✓ Root directory fixed"
echo ""

# Fix build directories
echo "2. Fixing build directories..."
fix_permissions "apps/frontend/public/build"
fix_permissions "apps/backend/dist"
fix_permissions "packages/database/dist"
fix_permissions "packages/shared/dist"
echo ""

# Fix node_modules directories
echo "3. Fixing node_modules directories..."
fix_permissions "node_modules"
fix_permissions "apps/frontend/node_modules"
fix_permissions "apps/backend/node_modules"
fix_permissions "packages/database/node_modules"
fix_permissions "packages/shared/node_modules"
echo ""

# Fix cache directories
echo "4. Fixing cache directories..."
fix_permissions "apps/frontend/.cache"
fix_permissions ".turbo"
echo ""

# Remove extended attributes that might cause issues
echo "5. Removing extended attributes..."
find "/Volumes/Work/My Work/event-finance-manager" -type f -name "._*" -delete 2>/dev/null || true
echo "✓ Extended attributes cleaned"
echo ""

echo "✅ All permissions fixed!"
echo ""
echo "⚠️  IMPORTANT: Do NOT use 'sudo' with build commands!"
echo "   Use these commands instead:"
echo ""
echo "   pnpm install              (NOT: sudo pnpm install)"
echo "   pnpm turbo build          (NOT: sudo turbo build)"
echo "   pnpm --filter @event-finance-manager/frontend dev"
echo ""
echo "   If you see permission errors, run this script again:"
echo "   ./fix-all-permissions.sh"
echo ""

