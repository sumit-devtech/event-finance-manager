#!/bin/bash
# Fix permissions for build directory
# This fixes the issue where files were created as root after running sudo commands

echo "Fixing permissions for build directory..."

# Get the current user
CURRENT_USER=$(whoami)

# Fix permissions for public/build directory
if [ -d "public/build" ]; then
    echo "Fixing permissions for public/build..."
    sudo chown -R "$CURRENT_USER:staff" public/build
    echo "✓ Permissions fixed for public/build"
else
    echo "public/build directory doesn't exist yet"
fi

# Fix permissions for .cache directory if it exists
if [ -d ".cache" ]; then
    echo "Fixing permissions for .cache..."
    sudo chown -R "$CURRENT_USER:staff" .cache
    echo "✓ Permissions fixed for .cache"
fi

# Fix permissions for node_modules if needed
if [ -d "node_modules" ]; then
    echo "Checking node_modules permissions..."
    if [ "$(stat -f '%Su' node_modules)" != "$CURRENT_USER" ]; then
        echo "Fixing permissions for node_modules..."
        sudo chown -R "$CURRENT_USER:staff" node_modules
        echo "✓ Permissions fixed for node_modules"
    fi
fi

echo ""
echo "Done! You can now run 'pnpm dev' without permission errors."
echo ""
echo "Note: The CSS warnings you see are harmless - they're just esbuild not fully"
echo "understanding Tailwind v4's modern CSS syntax. Your app will work fine."






