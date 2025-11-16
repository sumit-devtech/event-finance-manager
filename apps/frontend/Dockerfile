# ----------------------------------------
#           1. BASE
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
    COPY apps/frontend/package.json apps/frontend/
    COPY packages ./packages
    RUN pnpm install --frozen-lockfile
    
    # ----------------------------------------
    #           3. BUILD
    # ----------------------------------------
    FROM base AS build
    COPY . .
    COPY --from=deps /app/node_modules ./node_modules
    
    # 👇 Turbo build only frontend
    RUN pnpm dlx turbo run build --filter=@event-finance-manager/frontend
    
    # ----------------------------------------
    #           4. PRODUCTION RUNTIME
    # ----------------------------------------
    FROM base AS runner
    
    ENV NODE_ENV=production
    ENV PORT=3000
    
    WORKDIR /app
    
    COPY --from=build /app/apps/frontend/build ./build
    COPY apps/frontend/package.json ./
    
    RUN pnpm install --prod --frozen-lockfile
    
    EXPOSE 3000
    CMD ["pnpm", "start"]
    