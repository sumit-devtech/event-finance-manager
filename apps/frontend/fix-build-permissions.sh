#!/bin/bash
# Permanent solution for build permission issues
# This script fixes permissions before and after builds

set +e  # Don't fail if directories don't exist

CURRENT_USER=$(whoami)
CURRENT_GROUP="staff"

# Fix permissions for build directories (if they exist)
if [ -d "public/build" ]; then
    # Try without sudo first (faster)
    chown -R "$CURRENT_USER:$CURRENT_GROUP" public/build 2>/dev/null || \
    sudo chown -R "$CURRENT_USER:$CURRENT_GROUP" public/build 2>/dev/null || true
    chmod -R u+rw public/build 2>/dev/null || true
fi

if [ -d ".cache" ]; then
    chown -R "$CURRENT_USER:$CURRENT_GROUP" .cache 2>/dev/null || \
    sudo chown -R "$CURRENT_USER:$CURRENT_GROUP" .cache 2>/dev/null || true
    chmod -R u+rw .cache 2>/dev/null || true
fi

if [ -d "build" ]; then
    chown -R "$CURRENT_USER:$CURRENT_GROUP" build 2>/dev/null || \
    sudo chown -R "$CURRENT_USER:$CURRENT_GROUP" build 2>/dev/null || true
    chmod -R u+rw build 2>/dev/null || true
fi

exit 0
