# 🚀 Quick Deploy to Render

## Step 1: Create PostgreSQL Database
1. Render Dashboard → **New** → **PostgreSQL**
2. Name: `event-finance-manager-db`
3. Region: `Oregon`
4. Copy **Internal Database URL**

## Step 2: Deploy via Blueprint
1. Render Dashboard → **New** → **Blueprint**
2. Connect GitHub → Select `event-finance-manager` repo
3. Render will auto-detect `render.yaml`

## Step 3: Set Environment Variables

### Backend Service:
```env
DATABASE_URL=<internal-database-url>
JWT_SECRET=<generate: openssl rand -base64 32>
RESEND_API_KEY=re_your_key_here
SMTP_FROM=onboarding@resend.dev
FRONTEND_URL=https://event-finance-manager-frontend.onrender.com
```

### Frontend Service:
```env
VITE_API_BASE_URL=https://event-finance-manager-backend.onrender.com/api
SESSION_SECRET=<generate: openssl rand -base64 32>
```

## Step 4: Run Migrations
Backend → Shell → Run:
```bash
cd apps/backend
pnpm --filter @event-finance-manager/database exec prisma migrate deploy
```

## Step 5: Deploy!
Click **Manual Deploy** on both services.

✅ Done! Your app will be live at:
- Frontend: `https://event-finance-manager-frontend.onrender.com`
- Backend: `https://event-finance-manager-backend.onrender.com/api`
