#!/bin/bash

# Pre-deployment check script
# This script runs comprehensive checks before deployment

set -e  # Exit on error

echo "🚀 Running pre-deployment checks..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Function to check command
check_command() {
    local name=$1
    local command=$2
    
    echo -n "Checking $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# 1. Type checking
echo "1. TypeScript Type Checking"
echo "---------------------------"

check_command "Shared package" "pnpm --filter @event-finance-manager/shared type-check" || true
check_command "Database package" "pnpm --filter @event-finance-manager/database type-check" || true
check_command "Backend package" "pnpm --filter @event-finance-manager/backend type-check" || true
check_command "Frontend package" "pnpm --filter @event-finance-manager/frontend type-check" || true

echo ""

# 2. Production builds
echo "2. Production Builds"
echo "-------------------"

check_command "Backend build" "pnpm --filter @event-finance-manager/backend build" || true
check_command "Frontend build" "pnpm --filter @event-finance-manager/frontend build" || true

echo ""

# 3. Linting (if available)
echo "3. Linting"
echo "----------"

if pnpm --filter @event-finance-manager/backend lint > /dev/null 2>&1; then
    check_command "Backend lint" "pnpm --filter @event-finance-manager/backend lint" || true
else
    echo -e "${YELLOW}⚠ Linting not configured${NC}"
fi

if pnpm --filter @event-finance-manager/frontend lint > /dev/null 2>&1; then
    check_command "Frontend lint" "pnpm --filter @event-finance-manager/frontend lint" || true
else
    echo -e "${YELLOW}⚠ Linting not configured${NC}"
fi

echo ""

# 4. Check for common issues
echo "4. Common Issues Check"
echo "----------------------"

# Check if Prisma client is generated
if [ -d "node_modules/.pnpm/@prisma+client" ]; then
    echo -e "${GREEN}✓ Prisma client found${NC}"
else
    echo -e "${RED}✗ Prisma client not found - run 'pnpm --filter @event-finance-manager/database db:generate'${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check if build directories exist
if [ -d "apps/backend/dist" ]; then
    echo -e "${GREEN}✓ Backend dist directory exists${NC}"
else
    echo -e "${YELLOW}⚠ Backend dist directory not found${NC}"
fi

if [ -d "apps/frontend/build" ]; then
    echo -e "${GREEN}✓ Frontend build directory exists${NC}"
else
    echo -e "${YELLOW}⚠ Frontend build directory not found${NC}"
fi

echo ""

# Summary
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s). Please fix before deploying.${NC}"
    exit 1
fi

