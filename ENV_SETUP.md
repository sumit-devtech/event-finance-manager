# Environment Variables Setup Guide

This document lists all required and optional environment variables for the Simplifi applications.

## Backend (`apps/backend-simplifi/.env`)

Create a `.env` file in `apps/backend-simplifi/` with the following variables:

### Required Variables

```bash
# Database Connection - REQUIRED
DATABASE_URL_SIMPLIFI=postgresql://user:password@localhost:5432/simplifi_db?schema=public

# JWT Secret - REQUIRED (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

### Optional Variables

```bash
# JWT Token Expiration (default: "7d")
JWT_EXPIRES_IN=7d

# Server Port (default: 3334)
PORT=3334

# Frontend URL for CORS (default: "http://localhost:5173")
FRONTEND_URL=http://localhost:5173

# Node Environment (default: "development")
NODE_ENV=development
```

## Frontend (`apps/simplifi-frontend/.env`)

Create a `.env` file in `apps/simplifi-frontend/` with the following variables:

### Required Variables

```bash
# Session Secret - REQUIRED (change in production!)
SESSION_SECRET=your-super-secret-session-key-change-in-production-min-32-chars
```

### Optional Variables

```bash
# API Base URL (default: constructed from BACKEND_HOST and BACKEND_PORT)
# If not set, will be constructed as: http://${BACKEND_HOST}:${BACKEND_PORT}/api/v1
API_BASE_URL=http://localhost:3334/api/v1

# Backend Configuration (used if API_BASE_URL is not set)
BACKEND_HOST=localhost
BACKEND_PORT=3334

# Node Environment (default: "development")
NODE_ENV=development

# Frontend Server Port (default: 5173)
PORT=5173
```

## Quick Setup

1. **Backend Setup:**
   ```bash
   cd apps/backend-simplifi
   cat > .env << EOF
   DATABASE_URL_SIMPLIFI=postgresql://user:password@localhost:5432/simplifi_db?schema=public
   JWT_SECRET=$(openssl rand -base64 32)
   PORT=3334
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   EOF
   ```

2. **Frontend Setup:**
   ```bash
   cd apps/simplifi-frontend
   cat > .env << EOF
   # Option 1: Set full API URL
   API_BASE_URL=http://localhost:3334/api/v1
   
   # Option 2: Or set backend host/port separately (will construct API_BASE_URL)
   # BACKEND_HOST=localhost
   # BACKEND_PORT=3334
   
   SESSION_SECRET=$(openssl rand -base64 32)
   NODE_ENV=development
   PORT=5173
   EOF
   ```

## Important Notes

1. **DATABASE_URL_SIMPLIFI**: Replace with your actual PostgreSQL connection string
2. **JWT_SECRET**: Must be at least 32 characters long. Generate a secure random string for production.
3. **SESSION_SECRET**: Must be at least 32 characters long. Generate a secure random string for production.
4. **API_BASE_URL**: Can be set directly, or constructed from `BACKEND_HOST` and `BACKEND_PORT` env vars. Must match the backend PORT (default: 3334)
5. All `.env` files are gitignored - they won't be committed to the repository

## Verification

After setting up your `.env` files:

1. **Backend**: Start the backend and check it connects to the database:
   ```bash
   cd apps/backend-simplifi
   pnpm dev
   ```
   You should see: `🚀 Simplifi Backend is running on: http://localhost:3334/api`

2. **Frontend**: Start the frontend:
   ```bash
   cd apps/simplifi-frontend
   pnpm dev
   ```
   You should see: `[remix-serve] http://localhost:5173`

3. **Test Signup**: Try creating an account - it should now work!

## Troubleshooting

- **"Cannot POST /api/auth/signup"**: Check that:
  - Backend is running on port 3334
  - `API_BASE_URL` in frontend `.env` is `http://localhost:3334/api/v1`
  - `DATABASE_URL_SIMPLIFI` is correct and database is accessible

- **Database Connection Errors**: Verify:
  - PostgreSQL is running
  - `DATABASE_URL_SIMPLIFI` is correct
  - Database exists and migrations are applied

- **JWT Errors**: Ensure `JWT_SECRET` is set and matches between backend and any other services

