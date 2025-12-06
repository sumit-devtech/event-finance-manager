#!/bin/bash
# Comprehensive permissions fix for all build directories
# Run this script if you encounter permission errors after using sudo commands
# Usage: ./fix-permissions.sh (will prompt for sudo password)

set -e

echo "🔧 Fixing permissions for all build directories..."
echo ""

# Get the current user
CURRENT_USER=$(whoami)
CURRENT_GROUP=$(id -gn)

echo "Current user: $CURRENT_USER"
echo "Current group: $CURRENT_GROUP"
echo ""

# Function to fix permissions
fix_permissions() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo "Fixing permissions for $dir..."
        if [ "$(stat -f '%Su' "$dir" 2>/dev/null || echo '')" = "root" ]; then
            echo "  → Directory owned by root, using sudo..."
            sudo chown -R "$CURRENT_USER:$CURRENT_GROUP" "$dir"
        else
            chown -R "$CURRENT_USER:$CURRENT_GROUP" "$dir" 2>/dev/null || true
        fi
        chmod -R u+rw "$dir" 2>/dev/null || true
        echo "  ✓ Fixed: $dir"
    else
        echo "  ⊘ Skipped (doesn't exist): $dir"
    fi
}

# Fix frontend build directories
fix_permissions "apps/frontend/public/build"
fix_permissions "apps/frontend/.cache"
fix_permissions "apps/frontend/node_modules"

# Fix backend build directories
fix_permissions "apps/backend/dist"
fix_permissions "apps/backend/node_modules"

# Fix package build directories
fix_permissions "packages/database/dist"
fix_permissions "packages/database/node_modules"
fix_permissions "packages/shared/dist"
fix_permissions "packages/shared/node_modules"

# Fix root node_modules
fix_permissions "node_modules"

# Fix any upload directories
fix_permissions "apps/backend/uploads"

echo ""
echo "✅ All permissions fixed!"
echo ""
echo "📝 Important: To prevent this issue in the future:"
echo "   - Avoid using 'sudo' with build commands (pnpm, npm, turbo)"
echo "   - If you must use sudo, run this script afterwards"
echo "   - Use 'pnpm install' instead of 'sudo pnpm install'"
echo "   - Use 'turbo build' instead of 'sudo turbo build'"
echo ""
echo "🚀 You can now run 'pnpm dev' without permission errors."

