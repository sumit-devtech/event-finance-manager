# React Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Environment Setup
- [ ] Verified `.env` file is NOT committed to git
- [ ] Created `.env.example` with placeholder values
- [ ] Documented all required environment variables
- [ ] Set up production environment variables on hosting platform

### 2. Code Quality
- [ ] Run `npm run typecheck` - no TypeScript errors
- [ ] Run `npm run build` - build succeeds
- [ ] Test production build locally with `npm run preview`
- [ ] Verify all components render correctly
- [ ] Test demo mode functionality
- [ ] Test authentication flow (signup, login, logout)

### 3. Backend Verification
- [ ] Supabase project is set up
- [ ] Edge function is deployed (`/supabase/functions/server/index.tsx`)
- [ ] KV store is accessible
- [ ] Auth is configured in Supabase dashboard
- [ ] Storage buckets are created (if using file uploads)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Steps:**
1. Push code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy!

**Advantages:**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Instant rollbacks
- Preview deployments for PRs

### Option 2: Netlify

**Steps:**
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect repository
5. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
6. Add environment variables in site settings
7. Deploy!

**Advantages:**
- Simple setup
- Automatic HTTPS
- CDN included
- Form handling (if needed)

### Option 3: Static Hosting (S3, Cloudflare Pages, etc.)

**Steps:**
1. Build locally: `npm run build`
2. Upload `dist/` directory to hosting service
3. Configure:
   - Set `index.html` as default document
   - Enable SPA fallback (all routes → index.html)
   - Set cache headers for static assets

**Advantages:**
- Lowest cost (often free)
- Full control
- Can use any CDN

## 🔧 Configuration Files

### `vite.config.ts` - Already Configured ✅
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### `package.json` - Already Configured ✅
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## 🔐 Environment Variables

### Development (`.env`)
```env
VITE_SUPABASE_URL=https://arnnjktybceptapqqrlq.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

### Production
Add these on your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- Others: Use platform-specific configuration

## 📝 Post-Deployment Verification

### Functional Tests
- [ ] Landing page loads correctly
- [ ] Demo mode works
- [ ] User registration works
- [ ] User login works
- [ ] Organization setup works
- [ ] Event creation works
- [ ] Budget tracking works
- [ ] Expense tracking works
- [ ] Vendor management works
- [ ] Analytics dashboard displays
- [ ] Notifications work
- [ ] File uploads work (if enabled)
- [ ] Mobile responsive design works

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive (TTI) < 5 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] No memory leaks

### Security Tests
- [ ] HTTPS enabled
- [ ] API keys not exposed in client code
- [ ] Auth tokens stored securely
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (backend)

## 🔍 Monitoring & Analytics

### Recommended Tools
1. **Error Tracking:** Sentry
2. **Analytics:** Google Analytics, Plausible, or Fathom
3. **Performance:** Vercel Analytics or Web Vitals
4. **Uptime:** UptimeRobot or Pingdom

### Setup Sentry (Optional)
```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## 🐛 Common Issues & Solutions

### Issue: Build fails with "Cannot find module"
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Environment variables not working
**Solution:** 
- Ensure variables are prefixed with `VITE_`
- Restart dev server after adding new variables
- Check they're set on hosting platform

### Issue: 404 on page refresh
**Solution:** Configure SPA fallback:

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Netlify** - Create `_redirects` in `public/`:
```
/*  /index.html  200
```

### Issue: API calls fail after deployment
**Solution:**
- Verify Supabase URL and keys are correct
- Check CORS settings on backend
- Ensure edge function is deployed
- Test API endpoints directly

## 📊 Performance Optimization

### Already Implemented ✅
- Code splitting (Vite automatic)
- Tree shaking (Vite automatic)
- Asset optimization (Vite automatic)
- Minification (production build)

### Additional Optimizations
- [ ] Enable gzip/brotli compression (hosting provider)
- [ ] Set cache headers for static assets
- [ ] Use Vercel/Netlify CDN
- [ ] Lazy load heavy components
- [ ] Optimize images (use WebP format)

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎉 You're Ready to Deploy!

Follow the checklist above, choose a hosting option, and deploy your React app!

### Quick Deploy Commands

```bash
# 1. Final check
npm run typecheck
npm run build
npm run preview

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Deploy (choose one)
# → Vercel: Import project from dashboard
# → Netlify: Import project from dashboard
# → Manual: Upload dist/ folder
```

---

**Need help? Check the [React Quick Start Guide](./REACT_QUICK_START.md)**
