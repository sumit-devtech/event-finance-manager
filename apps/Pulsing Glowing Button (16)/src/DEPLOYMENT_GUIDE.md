# 🚀 Remix Deployment Guide

## Overview

This guide covers deploying your Remix event budget planner to various hosting platforms.

---

## 🎯 Deployment Options

1. **Vercel** (Recommended - Easiest)
2. **Netlify**
3. **Fly.io**
4. **Railway**
5. **Self-Hosted (VPS)**

---

## 🟢 Option 1: Vercel (Recommended)

### **Why Vercel?**
- ✅ Zero configuration
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier available
- ✅ Best for Remix

### **Prerequisites**
```bash
npm install -g vercel
```

### **Step 1: Install Vercel Adapter**
```bash
npm install @vercel/remix
```

### **Step 2: Update `remix.config.js`**
```javascript
/** @type {import('@remix-run/dev').AppConfig} */
export default {
  serverModuleFormat: "esm",
  server: "@vercel/remix",
  ignoredRouteFiles: ["**/.*"],
};
```

### **Step 3: Create `vercel.json`**
```json
{
  "buildCommand": "remix build",
  "devCommand": "remix dev",
  "installCommand": "npm install",
  "framework": "remix",
  "outputDirectory": "public",
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "SESSION_SECRET": "@session-secret"
  }
}
```

### **Step 4: Deploy**
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### **Step 5: Set Environment Variables**
In Vercel Dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`

### **Step 6: Deploy Again**
```bash
vercel --prod
```

✅ **Done!** Your app is live at `your-project.vercel.app`

---

## 🔷 Option 2: Netlify

### **Step 1: Install Netlify Adapter**
```bash
npm install @netlify/remix-adapter
```

### **Step 2: Update `remix.config.js`**
```javascript
/** @type {import('@remix-run/dev').AppConfig} */
export default {
  serverModuleFormat: "esm",
  server: "@netlify/remix-adapter",
  ignoredRouteFiles: ["**/.*"],
};
```

### **Step 3: Create `netlify.toml`**
```toml
[build]
  command = "remix build"
  publish = "public"

[dev]
  command = "remix dev"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200

[functions]
  directory = "netlify/functions"
```

### **Step 4: Deploy**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

### **Step 5: Set Environment Variables**
```bash
netlify env:set SUPABASE_URL "your-url"
netlify env:set SUPABASE_ANON_KEY "your-key"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-key"
netlify env:set SESSION_SECRET "your-secret"
```

✅ **Done!** Your app is live at `your-project.netlify.app`

---

## 🚂 Option 3: Fly.io

### **Step 1: Install Fly CLI**
```bash
curl -L https://fly.io/install.sh | sh
```

### **Step 2: Login**
```bash
fly auth login
```

### **Step 3: Create `Dockerfile`**
```dockerfile
# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

### **Step 4: Create `fly.toml`**
```toml
app = "your-app-name"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

### **Step 5: Launch**
```bash
fly launch

# Set secrets
fly secrets set SUPABASE_URL="your-url"
fly secrets set SUPABASE_ANON_KEY="your-key"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-key"
fly secrets set SESSION_SECRET="your-secret"

# Deploy
fly deploy
```

✅ **Done!** Your app is live at `your-app-name.fly.dev`

---

## 🚄 Option 4: Railway

### **Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
```

### **Step 2: Login**
```bash
railway login
```

### **Step 3: Initialize Project**
```bash
railway init
```

### **Step 4: Add Environment Variables**
```bash
railway variables set SUPABASE_URL="your-url"
railway variables set SUPABASE_ANON_KEY="your-key"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your-key"
railway variables set SESSION_SECRET="your-secret"
```

### **Step 5: Deploy**
```bash
railway up
```

✅ **Done!** Railway will provide you with a URL.

---

## 🖥️ Option 5: Self-Hosted (VPS)

### **Prerequisites**
- Ubuntu 22.04 VPS
- Node.js 18+
- Nginx
- PM2

### **Step 1: Setup VPS**
```bash
# SSH into your server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### **Step 2: Clone & Build**
```bash
# Clone your repo
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Build
npm run build
```

### **Step 3: Setup PM2**
```bash
# Create ecosystem file
pm2 ecosystem
```

Edit `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'event-planner',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    }
  }]
};
```

```bash
# Start app
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup auto-restart
pm2 startup
```

### **Step 4: Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/event-planner
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/event-planner /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### **Step 5: Setup SSL (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

✅ **Done!** Your app is live at `https://your-domain.com`

---

## 🔐 Environment Variables

### **Required Variables**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-session-secret
```

### **Generate Session Secret**
```bash
openssl rand -base64 32
```

### **Where to Find Supabase Credentials**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon public → `SUPABASE_ANON_KEY`
   - service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Pre-Deployment Checklist

### **Code Quality**
- [ ] All TypeScript errors resolved
- [ ] No console.errors in production
- [ ] Error boundaries implemented
- [ ] Loading states added

### **Performance**
- [ ] Images optimized
- [ ] CSS minified (auto by Remix)
- [ ] Bundle analyzed
- [ ] Lighthouse score > 90

### **Security**
- [ ] Environment variables not in code
- [ ] HTTPS enabled
- [ ] Session secret is strong
- [ ] CORS configured properly
- [ ] Rate limiting considered

### **Functionality**
- [ ] All routes tested
- [ ] Authentication works
- [ ] Demo mode works
- [ ] Forms submit correctly
- [ ] API calls succeed

### **SEO**
- [ ] Meta tags added
- [ ] sitemap.xml created
- [ ] robots.txt configured
- [ ] Open Graph tags added

---

## 📊 Post-Deployment Monitoring

### **1. Setup Error Tracking**

#### **Sentry (Recommended)**
```bash
npm install @sentry/remix
```

```typescript
// app/entry.server.tsx
import * as Sentry from "@sentry/remix";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### **2. Setup Analytics**

#### **Google Analytics**
```typescript
// app/root.tsx
export default function App() {
  return (
    <html>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
```

### **3. Setup Uptime Monitoring**
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)
- [Better Uptime](https://betteruptime.com)

---

## 🔄 Continuous Deployment (CI/CD)

### **GitHub Actions + Vercel**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🚨 Troubleshooting

### **Issue: Build Fails**
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Try building locally
npm run build
```

### **Issue: Environment Variables Not Working**
```bash
# Verify they're set
echo $SUPABASE_URL

# Check spelling (case-sensitive!)
# Check for spaces or quotes
```

### **Issue: 404 on All Routes**
```bash
# Ensure catch-all route is configured
# For Vercel: automatic
# For Nginx: check proxy_pass configuration
```

### **Issue: Session/Auth Not Working**
```bash
# Ensure SESSION_SECRET is set
# Check cookies are enabled
# Verify HTTPS in production
```

---

## 🎉 Success!

Your Remix event budget planner is now deployed and live! 🚀

### **Next Steps:**
1. ✅ Test all functionality in production
2. ✅ Share with users
3. ✅ Monitor performance
4. ✅ Collect feedback
5. ✅ Iterate and improve

---

## 📚 Additional Resources

- [Remix Deployment Docs](https://remix.run/docs/en/main/guides/deployment)
- [Vercel Remix Guide](https://vercel.com/guides/deploying-remix-with-vercel)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Web.dev Performance](https://web.dev/performance/)

---

**Happy Deploying! 🚀**
