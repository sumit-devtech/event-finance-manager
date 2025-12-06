# Quick Debugging Checklist

Use this checklist to debug each component step-by-step.

---

## 🔐 Authentication Flow

### Login Form → Backend → Database → Session

- [ ] **Step 1: Form Submission**
  ```typescript
  // File: apps/frontend/app/routes/login.tsx
  console.log("Form data:", { email, password });
  ```

- [ ] **Step 2: API Call**
  ```typescript
  // File: apps/frontend/app/lib/api.ts
  console.log("API URL:", url);
  console.log("Request body:", body);
  ```

- [ ] **Step 3: Backend Receives**
  ```typescript
  // File: apps/backend/src/auth/auth.controller.ts
  console.log("Login DTO:", loginDto);
  ```

- [ ] **Step 4: Database Query**
  ```typescript
  // File: apps/backend/src/auth/auth.service.ts
  console.log("User found:", user?.email);
  console.log("Email verified:", user?.emailVerified);
  console.log("Account active:", user?.isActive);
  ```

- [ ] **Step 5: Password Check**
  ```typescript
  console.log("Password valid:", isPasswordValid);
  ```

- [ ] **Step 6: Token Generation**
  ```typescript
  console.log("Access token generated:", !!accessToken);
  console.log("Token payload:", payload);
  ```

- [ ] **Step 7: Session Storage**
  ```typescript
  // File: apps/frontend/app/lib/session.server.ts
  console.log("Session data:", session.data);
  ```

- [ ] **Step 8: Cookie Set**
  - Check browser DevTools → Application → Cookies
  - Cookie name: `__session`
  - Should be httpOnly

---

## 🛡️ Protected Route Flow

### Dashboard Loader → API → Backend → Database → UI

- [ ] **Step 1: Route Protection**
  ```typescript
  // File: apps/frontend/app/routes/_protected.dashboard.tsx
  console.log("User:", user?.email);
  console.log("Token:", token?.substring(0, 20));
  ```

- [ ] **Step 2: Session Check**
  ```typescript
  // File: apps/frontend/app/lib/auth.server.ts
  console.log("User from session:", userFromSession);
  console.log("Token from session:", token);
  ```

- [ ] **Step 3: API Request**
  ```typescript
  // File: apps/frontend/app/lib/api.ts
  console.log("Request URL:", url);
  console.log("Auth header:", headers.Authorization ? "Present" : "Missing");
  ```

- [ ] **Step 4: Backend Guard**
  ```typescript
  // File: apps/backend/src/auth/strategies/jwt.strategy.ts
  console.log("JWT payload:", payload);
  console.log("User from DB:", user);
  ```

- [ ] **Step 5: Service Query**
  ```typescript
  // File: apps/backend/src/events/events.service.ts
  console.log("Filters:", filters);
  console.log("Where clause:", JSON.stringify(where, null, 2));
  ```

- [ ] **Step 6: Database Query**
  - Enable Prisma logging in `packages/database/src/client.ts`:
    ```typescript
    log: ["query", "error", "warn"]
    ```
  - Check console for `prisma:query SELECT ...`

- [ ] **Step 7: Response**
  ```typescript
  // File: apps/frontend/app/lib/api.ts
  console.log("Response status:", response.status);
  console.log("Response data:", await response.json());
  ```

- [ ] **Step 8: Loader Returns**
  ```typescript
  // File: apps/frontend/app/routes/_protected.dashboard.tsx
  console.log("Loader data:", { user, events: events.length });
  ```

- [ ] **Step 9: Component Renders**
  ```typescript
  // File: apps/frontend/app/routes/_protected.dashboard.tsx
  console.log("Component data:", loaderData);
  ```

---

## 🐛 Common Issues Quick Fix

### Issue: "User not found"
```typescript
// Check database
const user = await prisma.client.user.findUnique({ where: { email } });
console.log("User exists:", !!user);
```

### Issue: "Invalid credentials"
```typescript
// Check password
const isValid = await bcrypt.compare(password, user.passwordHash);
console.log("Password valid:", isValid);
```

### Issue: "Unauthorized"
```typescript
// Check token
console.log("Token:", token);
console.log("Token payload:", jwt.decode(token));
```

### Issue: "No data returned"
```typescript
// Check query
console.log("Where clause:", where);
console.log("Result count:", events.length);
```

### Issue: "Token not sent"
```typescript
// Check session
console.log("Token in session:", session.get("accessToken"));
console.log("Headers:", headers);
```

---

## 📊 Debug Log Template

Copy this template to add comprehensive logging:

```typescript
// ============================================
// DEBUG: [Component/Function Name]
// ============================================
console.log("🔍 DEBUG START:", {
  timestamp: new Date().toISOString(),
  function: "[Function Name]",
  file: "[File Path]",
});

console.log("📥 INPUT:", {
  // Add input parameters
});

console.log("⚙️ PROCESSING:", {
  // Add processing steps
});

console.log("📤 OUTPUT:", {
  // Add output/result
});

console.log("✅ DEBUG END");
// ============================================
```

---

## 🎯 Step-by-Step Debugging Process

1. **Start at the entry point** (form submission, route navigation)
2. **Add console.log at each step**
3. **Check browser console** for frontend logs
4. **Check server console** for backend logs
5. **Verify data at each transformation**
6. **Check database** directly if needed
7. **Compare expected vs actual** at each step

---

## 🔍 Key Debug Points

### Frontend
- Form submission → Action handler
- API client → Request headers
- Session → Token extraction
- Loader → Data transformation
- Component → Props received

### Backend
- Controller → Request received
- Guard → Token validation
- Service → Business logic
- Prisma → Query execution
- Response → Data returned

### Database
- Connection → Prisma client
- Query → SQL generated
- Result → Data returned

---

## 📝 Quick Commands

### Enable Prisma Logging
```typescript
// packages/database/src/client.ts
log: ["query", "error", "warn"]
```

### Check Database Connection
```typescript
await prismaEventDb.$connect();
console.log("Database connected");
```

### Decode JWT Token
```typescript
// Use jwt.io or:
const payload = jwt.decode(token);
console.log("Token payload:", payload);
```

### Check Session Cookie
```bash
# Browser DevTools → Application → Cookies
# Look for: __session
```

---

**Print this checklist and check off each step as you debug! ✅**

