# 🚀 Debugging Guide - Start Here

This is your **starting point** for understanding and debugging the complete API → Database → UI flow.

---

## 📚 Documentation Files

1. **[API_DB_FLOW_DEBUG_GUIDE.md](./API_DB_FLOW_DEBUG_GUIDE.md)**
   - **Complete step-by-step guide** with code examples
   - Detailed explanations of each component
   - Debug points at every step
   - Common issues and solutions

2. **[DEBUG_CHECKLIST.md](./DEBUG_CHECKLIST.md)**
   - **Quick reference checklist** for debugging
   - Step-by-step verification points
   - Copy-paste debug code snippets
   - Common issues quick fixes

3. **[API_FLOW_DIAGRAM.md](./API_FLOW_DIAGRAM.md)**
   - **Visual flow diagrams** showing data flow
   - Authentication flow diagram
   - Protected route flow diagram
   - Complete request cycle diagram

---

## 🎯 Quick Start

### Step 1: Understand the Architecture

Read the **flow diagram** first:
```bash
# Open this file
API_FLOW_DIAGRAM.md
```

This gives you a **visual overview** of how data flows through the system.

---

### Step 2: Trace Authentication Flow

Start with **authentication** - it's the foundation:

1. **Open:** `API_DB_FLOW_DEBUG_GUIDE.md`
2. **Go to:** Section 1 - Authentication Flow
3. **Follow:** Each step from 1.1 to 1.9
4. **Add debug logs** at each step using the code examples

**Key Files to Check:**
- `apps/frontend/app/routes/login.tsx` - Login form
- `apps/frontend/app/lib/auth.server.ts` - Auth logic
- `apps/backend/src/auth/auth.service.ts` - Backend auth
- `apps/backend/src/auth/auth.controller.ts` - Auth endpoints

---

### Step 3: Trace Protected Route Flow

Once authentication works, trace a **protected route**:

1. **Open:** `API_DB_FLOW_DEBUG_GUIDE.md`
2. **Go to:** Section 2 - Protected Route Flow
3. **Follow:** Each step from 2.1 to 2.4
4. **Use:** `DEBUG_CHECKLIST.md` to verify each step

**Key Files to Check:**
- `apps/frontend/app/routes/_protected.dashboard.tsx` - Dashboard loader
- `apps/frontend/app/lib/api.ts` - API client
- `apps/backend/src/events/events.controller.ts` - Events endpoints
- `apps/backend/src/events/events.service.ts` - Events logic

---

### Step 4: Debug Database Queries

Enable **Prisma logging** to see actual SQL queries:

**File:** `packages/database/src/client.ts`

```typescript
export const prismaEventDb =
  globalForPrisma.prismaEventDb ??
  new PrismaClientEventDb({
    log: ["query", "error", "warn"],  // ← Enable this
  });
```

**Check console for:**
```
prisma:query SELECT * FROM "User" WHERE email = $1
```

---

## 🔍 Debugging Workflow

### 1. Add Debug Logs

Use this template at each step:

```typescript
console.log("🔍 DEBUG:", {
  step: "[Step Name]",
  file: "[File Path]",
  data: { /* relevant data */ },
});
```

### 2. Check Each Layer

**Frontend:**
- Browser console (F12)
- Network tab (check API requests)
- Application tab (check cookies)

**Backend:**
- Server console (terminal)
- Check Prisma logs
- Verify request/response

**Database:**
- Prisma query logs
- Direct database queries (optional)

### 3. Follow the Flow

Use the **checklist** to verify each step:
- [ ] Step 1 complete
- [ ] Step 2 complete
- [ ] Step 3 complete
- etc.

---

## 🐛 Common Debugging Scenarios

### Scenario 1: Login Not Working

**Check:**
1. Form submission reaches action handler
2. API call is made (check Network tab)
3. Backend receives request (check server logs)
4. User exists in database
5. Password is correct
6. Tokens are generated
7. Session is created
8. Cookie is set

**Use:** `DEBUG_CHECKLIST.md` → Authentication Flow section

---

### Scenario 2: Protected Route Returns 401

**Check:**
1. User is logged in (check cookie)
2. Token exists in session
3. Token is sent in Authorization header
4. Token is valid (not expired)
5. JWT_SECRET matches
6. User exists in database

**Use:** `DEBUG_CHECKLIST.md` → Protected Route Flow section

---

### Scenario 3: No Data Loading

**Check:**
1. API request succeeds (200 status)
2. Response contains data
3. Loader receives data
4. Data transformation works
5. Component receives props
6. UI renders correctly

**Use:** `DEBUG_CHECKLIST.md` → Response Flow section

---

### Scenario 4: Database Query Returns Empty

**Check:**
1. Prisma connection works
2. WHERE clause is correct
3. Data exists in database
4. Organization ID matches
5. Role-based filtering is correct

**Use:** `API_DB_FLOW_DEBUG_GUIDE.md` → Section 5 - Database Query Flow

---

## 📋 Quick Reference

### Key Files

**Frontend:**
- `apps/frontend/app/lib/api.ts` - API client
- `apps/frontend/app/lib/auth.server.ts` - Auth utilities
- `apps/frontend/app/lib/session.server.ts` - Session management
- `apps/frontend/app/routes/login.tsx` - Login route
- `apps/frontend/app/routes/_protected.*.tsx` - Protected routes

**Backend:**
- `apps/backend/src/auth/auth.controller.ts` - Auth endpoints
- `apps/backend/src/auth/auth.service.ts` - Auth logic
- `apps/backend/src/auth/guards/jwt-auth.guard.ts` - Auth guard
- `apps/backend/src/auth/strategies/jwt.strategy.ts` - JWT validation
- `apps/backend/src/prisma/prisma.service.ts` - Database service
- `apps/backend/src/events/events.controller.ts` - Events endpoints
- `apps/backend/src/events/events.service.ts` - Events logic

**Database:**
- `packages/database/src/client.ts` - Prisma client
- `packages/database/prisma/schema.prisma` - Database schema

---

### Debug Commands

**Enable Prisma Logging:**
```typescript
// packages/database/src/client.ts
log: ["query", "error", "warn"]
```

**Check Database Connection:**
```typescript
await prismaEventDb.$connect();
console.log("Database connected");
```

**Decode JWT Token:**
```typescript
const payload = jwt.decode(token);
console.log("Token payload:", payload);
```

**Check Session Cookie:**
- Browser DevTools → Application → Cookies
- Look for: `__session`

---

## 🎓 Learning Path

### Beginner
1. Read `API_FLOW_DIAGRAM.md` - Understand the flow visually
2. Follow `DEBUG_CHECKLIST.md` - Step-by-step verification
3. Add debug logs using examples

### Intermediate
1. Read `API_DB_FLOW_DEBUG_GUIDE.md` - Understand each component
2. Trace a complete flow (login → dashboard)
3. Debug a specific issue using the guide

### Advanced
1. Understand all layers (Frontend → Backend → Database)
2. Optimize queries using Prisma logs
3. Add custom debugging tools

---

## 🚨 Important Notes

1. **Always enable Prisma logging** when debugging database issues
2. **Check both browser and server consoles** - logs are in different places
3. **Verify tokens** - JWT tokens expire, check expiration time
4. **Check CORS** - If API calls fail, check CORS configuration
5. **Session cookies** - Must be httpOnly and secure in production

---

## 📞 Next Steps

1. **Start debugging** using the checklist
2. **Add logs** at each step
3. **Trace the flow** from UI to database and back
4. **Fix issues** using the common solutions guide
5. **Document** any new findings

---

## 📖 Additional Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **NestJS Docs:** https://docs.nestjs.com
- **Remix Docs:** https://remix.run/docs
- **JWT Debugger:** https://jwt.io

---

**Happy Debugging! 🐛🔍**

Start with the **flow diagram**, then use the **checklist** to verify each step, and refer to the **detailed guide** for in-depth explanations.

