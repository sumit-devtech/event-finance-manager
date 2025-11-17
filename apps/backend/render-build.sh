#!/bin/bash
# Build script for Render deployment
# This ensures all dependencies are built before building the backend

set -e

echo "Building database package..."
cd ../../packages/database
pnpm build

echo "Building backend..."
cd ../../apps/backend
pnpm build

echo "Build complete!"

