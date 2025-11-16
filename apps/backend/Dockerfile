# ----------------------------------------
#           1. BASE (shared)
# ----------------------------------------
    FROM node:20-alpine AS base
    WORKDIR /app
    RUN apk add --no-cache libc6-compat
    RUN corepack enable && corepack prepare pnpm@latest --activate
    
    # ----------------------------------------
    #           2. DEPS
    # ----------------------------------------
    FROM base AS deps
    COPY pnpm-lock.yaml pnpm-workspace.yaml ./
    COPY package.json ./
    COPY apps/backend/package.json apps/backend/
    COPY packages ./packages
    RUN pnpm install --frozen-lockfile
    
    # ----------------------------------------
    #           3. BUILD
    # ----------------------------------------
    FROM base AS build
    COPY . .
    COPY --from=deps /app/node_modules ./node_modules
    
    # 👇 Turborepo build ONLY backend
    RUN pnpm dlx turbo run build --filter=@event-finance-manager/backend
    
    # ----------------------------------------
    #     4. PRODUCTION RUNTIME IMAGE
    # ----------------------------------------
    FROM base AS runner
    
    ENV NODE_ENV=production
    ENV PORT=3000
    
    WORKDIR /app
    
    # Copy built backend app
    COPY --from=build /app/apps/backend/dist ./dist
    COPY apps/backend/package.json ./
    
    # Install only backend prod deps
    RUN pnpm install --prod --frozen-lockfile
    
    EXPOSE 3000
    
    CMD ["node", "dist/main.js"]
    