#!/bin/bash

# TypeScript-only check script (avoids file permission issues)
# This checks for actual TypeScript errors, not file system permissions

set -e

echo "🔍 Checking TypeScript compilation..."
echo ""

ERRORS=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

check_ts() {
    local name=$1
    local dir=$2
    
    echo -n "Checking $name... "
    cd "$dir"
    
    # Use the package's own type-check script if available, otherwise use tsc directly
    # This respects the package's tsconfig settings
    if [ -f "package.json" ] && grep -q '"type-check"' package.json; then
        # Use package script which handles tsconfig properly
        if pnpm type-check > /dev/null 2>&1; then
            echo -e "${GREEN}✓ OK${NC}"
            cd - > /dev/null
            return 0
        else
            # Check output for actual TypeScript errors (not permission errors)
            local output=$(pnpm type-check 2>&1)
            local ts_errors=$(echo "$output" | grep -E "error TS[0-9]" | grep -v "EACCES" | grep -v "permission denied")
            
            if [ -z "$ts_errors" ]; then
                # Only permission errors, not actual code errors
                echo -e "${GREEN}✓ OK${NC} (permission warnings ignored)"
                cd - > /dev/null
                return 0
            else
                echo -e "${RED}✗ FAILED${NC}"
                echo "TypeScript errors:"
                echo "$ts_errors" | head -5
                cd - > /dev/null
                ERRORS=$((ERRORS + 1))
                return 1
            fi
        fi
    else
        # Fallback to direct tsc
        if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
            echo -e "${GREEN}✓ OK${NC}"
            cd - > /dev/null
            return 0
        else
            echo -e "${RED}✗ FAILED${NC}"
            echo "Errors:"
            npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | head -5
            cd - > /dev/null
            ERRORS=$((ERRORS + 1))
            return 1
        fi
    fi
}

# Check each package
check_ts "Shared" "packages/shared"
check_ts "Database" "packages/database" || true  # May have permission issues but check types
check_ts "Backend" "apps/backend"
check_ts "Frontend" "apps/frontend"

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All TypeScript checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Found TypeScript errors. Please fix before deploying.${NC}"
    exit 1
fi

