# Complete API → Database → UI Flow Debugging Guide

This guide walks you through **every step** of how data flows from authentication to database operations to UI rendering. Use this to debug and understand each component.

---

## 🎯 Architecture Overview

```
┌─────────────────┐
│   UI Component  │ (React/Remix)
└────────┬────────┘
         │ User Action (click, submit)
         ▼
┌─────────────────┐
│ Remix Route      │ (loader/action)
│ - _protected.*  │
└────────┬────────┘
         │ Server-side API call
         ▼
┌─────────────────┐
│ API Client      │ (app/lib/api.ts)
│ - api.get()     │
│ - api.post()    │
└────────┬────────┘
         │ HTTP Request with Bearer Token
         ▼
┌─────────────────┐
│ NestJS Backend  │
│ - Controller    │
│ - Guard (Auth)  │
│ - Service       │
└────────┬────────┘
         │ Prisma Query
         ▼
┌─────────────────┐
│ Database        │ (PostgreSQL via Prisma)
│ - User          │
│ - Event         │
│ - Expense       │
└─────────────────┘
```

---

## 📋 Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Protected Route Flow](#2-protected-route-flow)
3. [API Request Flow](#3-api-request-flow)
4. [Backend Processing Flow](#4-backend-processing-flow)
5. [Database Query Flow](#5-database-query-flow)
6. [Response Flow Back to UI](#6-response-flow-back-to-ui)
7. [Debugging Checklist](#7-debugging-checklist)

---

## 1. Authentication Flow

### Step-by-Step: User Login

#### **Step 1.1: User Submits Login Form**
**File:** `apps/frontend/app/routes/login.tsx`
**Location:** Lines 33-132

```typescript
// User fills form and clicks "Login"
// Form submits to action() function
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  
  // Calls loginUser() function
  const result = await loginUser(email, password, redirectTo, request);
}
```

**🔍 Debug Points:**
- Check `formData` contains email/password
- Verify form submission reaches action handler
- Add: `console.log("Login attempt:", email)`

---

#### **Step 1.2: Server-Side Login Function**
**File:** `apps/frontend/app/lib/auth.server.ts`
**Location:** Lines 73-123

```typescript
export async function loginUser(email, password, redirectTo, request) {
  // STEP 1: Call backend API
  const authResponse = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  
  // STEP 2: Store tokens in session
  const session = await setAuthTokensInSession(
    authResponse.accessToken,
    authResponse.refreshToken,
    authResponse.user,
    existingCookieHeader,
  );
  
  // STEP 3: Commit session to cookie
  const cookieHeader = await commitSession(session);
  
  return { user, headers: { "Set-Cookie": cookieHeader }, redirectTo };
}
```

**🔍 Debug Points:**
- Check API response: `console.log("Auth response:", authResponse)`
- Verify tokens exist: `console.log("Access token:", authResponse.accessToken)`
- Check session storage: `console.log("Session:", session.data)`

---

#### **Step 1.3: API Client Makes Request**
**File:** `apps/frontend/app/lib/api.ts`
**Location:** Lines 68-128

```typescript
async function apiRequest<T>(endpoint: string, options: RequestOptions = {}) {
  // Build URL
  const url = buildUrl(`${API_BASE_URL}${endpoint}`, params);
  
  // Get auth token (null for login)
  const authToken = token || getAuthToken();
  
  // Set headers
  const headers = {
    "Content-Type": "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
  
  // Make fetch request
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password }),
  });
  
  // Handle response
  if (!response.ok) {
    throw new ApiClientError(response.status, errorMessage);
  }
  
  return await response.json();
}
```

**🔍 Debug Points:**
- Check URL: `console.log("API URL:", url)`
- Check headers: `console.log("Request headers:", headers)`
- Check response status: `console.log("Response status:", response.status)`
- Check response body: `console.log("Response data:", await response.json())`

---

#### **Step 1.4: Backend Auth Controller**
**File:** `apps/backend/src/auth/auth.controller.ts`
**Location:** Lines 13-18

```typescript
@Controller("auth")
export class AuthController {
  @Public()  // No auth required for login
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

**🔍 Debug Points:**
- Check DTO received: `console.log("Login DTO:", loginDto)`
- Verify route is hit: Add log at start of method
- Check request body parsing

---

#### **Step 1.5: Backend Auth Service - Validate User**
**File:** `apps/backend/src/auth/auth.service.ts`
**Location:** Lines 28-53

```typescript
async validateUser(email: string, password: string) {
  // STEP 1: Find user in database
  const user = await this.prisma.client.user.findUnique({
    where: { email },
  });
  
  // STEP 2: Check user exists
  if (!user || !user.passwordHash) {
    throw new UnauthorizedException("Invalid credentials");
  }
  
  // STEP 3: Check email verified
  if (!user.emailVerified) {
    throw new UnauthorizedException("Please verify your email");
  }
  
  // STEP 4: Check account active
  if (!user.isActive) {
    throw new UnauthorizedException("Account inactive");
  }
  
  // STEP 5: Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid credentials");
  }
  
  return { ...user, passwordHash: undefined };
}
```

**🔍 Debug Points:**
- Check user found: `console.log("User found:", user?.email)`
- Check email verified: `console.log("Email verified:", user?.emailVerified)`
- Check account active: `console.log("Account active:", user?.isActive)`
- Check password comparison: Add log before/after bcrypt.compare

---

#### **Step 1.6: Database Query (Prisma)**
**File:** `apps/backend/src/prisma/prisma.service.ts`
**Location:** Lines 6-8

```typescript
// PrismaService wraps PrismaClient
get client(): PrismaClientEventDb {
  return prismaEventDb;  // From @event-finance-manager/database
}
```

**Database Query:**
```sql
SELECT * FROM "User" WHERE email = $1
```

**🔍 Debug Points:**
- Enable Prisma logging in `packages/database/src/client.ts`:
  ```typescript
  log: ["query", "error", "warn"]
  ```
- Check SQL generated: Look for `prisma:query` in console
- Verify database connection: `await prismaEventDb.$connect()`

---

#### **Step 1.7: Generate JWT Tokens**
**File:** `apps/backend/src/auth/auth.service.ts`
**Location:** Lines 316-344

```typescript
private generateTokens(user: any): AuthResponseDto {
  const payload = {
    email: user.email,
    sub: user.id,
    role: user.role,
    organizationId: user.organizationId,
  };
  
  const accessToken = this.jwtService.sign(payload, {
    expiresIn: "1h",
  });
  
  const refreshToken = this.jwtService.sign(payload, {
    secret: "refresh-secret-key",
    expiresIn: "7d",
  });
  
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      organizationId: user.organizationId,
    },
  };
}
```

**🔍 Debug Points:**
- Check payload: `console.log("JWT payload:", payload)`
- Verify token generated: `console.log("Access token length:", accessToken.length)`
- Test token decode: Use jwt.io to verify token contents

---

#### **Step 1.8: Store Tokens in Session**
**File:** `apps/frontend/app/lib/session.server.ts`
**Location:** Lines 54-66

```typescript
export async function setAuthTokensInSession(
  accessToken: string,
  refreshToken: string,
  user: any,
  cookieHeader?: string | null,
) {
  const session = await getSession(cookieHeader || undefined);
  session.set("accessToken", accessToken);
  session.set("refreshToken", refreshToken);
  session.set("user", user);
  return session;
}
```

**🔍 Debug Points:**
- Check session data: `console.log("Session data:", session.data)`
- Verify cookie created: Check browser DevTools → Application → Cookies
- Cookie name: `__session`
- Cookie should be httpOnly, secure in production

---

#### **Step 1.9: Redirect to Dashboard**
**File:** `apps/frontend/app/routes/login.tsx`
**Location:** Lines 128-131

```typescript
// Success - redirect with session cookie
return redirect(result.redirectTo || "/dashboard", {
  headers: result.headers as HeadersInit,
});
```

**🔍 Debug Points:**
- Verify redirect happens
- Check Set-Cookie header in response
- Verify user lands on dashboard

---

## 2. Protected Route Flow

### Step-by-Step: Accessing Dashboard

#### **Step 2.1: User Navigates to Dashboard**
**File:** `apps/frontend/app/routes/_protected.dashboard.tsx`
**Location:** Lines 53-161

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  // STEP 1: Check authentication
  const user = await requireAuth(request);
  
  // STEP 2: Get auth token from session
  const token = await getAuthTokenFromSession(request);
  
  // STEP 3: Fetch data from API
  const events = await fetchEventsData(token || undefined);
  
  // STEP 4: Return data to component
  return json({ user, events, ... });
}
```

**🔍 Debug Points:**
- Check user exists: `console.log("User:", user)`
- Check token exists: `console.log("Token:", token)`
- Verify loader executes: Add log at start

---

#### **Step 2.2: Require Auth Check**
**File:** `apps/frontend/app/lib/auth.server.ts`
**Location:** Lines 45-53

```typescript
export async function requireAuth(request: Request): Promise<User> {
  const user = await getCurrentUser(request);
  if (!user) {
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
```

**🔍 Debug Points:**
- Check user from session: `console.log("User from session:", user)`
- Verify redirect if no user
- Check session cookie exists

---

#### **Step 2.3: Get Current User from Session**
**File:** `apps/frontend/app/lib/auth.server.ts`
**Location:** Lines 24-39

```typescript
export async function getCurrentUser(request: Request): Promise<User | null> {
  const session = await getSessionFromRequest(request);
  
  const userFromSession = session.get("user");
  const token = session.get("accessToken");
  
  // Both must exist for valid authentication
  if (userFromSession && token) {
    return userFromSession as User;
  }
  
  return null;
}
```

**🔍 Debug Points:**
- Check session exists: `console.log("Session:", session.data)`
- Check user in session: `console.log("User from session:", userFromSession)`
- Check token in session: `console.log("Token from session:", token)`

---

#### **Step 2.4: Fetch Data from API**
**File:** `apps/frontend/app/lib/dashboard.server.ts`
**Location:** Lines 15-25

```typescript
export async function fetchEventsData(token?: string): Promise<ApiEvent[]> {
  try {
    const events = await api.get<ApiEvent[]>("/events", {
      token: token || undefined,
    });
    return events || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
```

**🔍 Debug Points:**
- Check API call: `console.log("Fetching events with token:", token?.substring(0, 20))`
- Check response: `console.log("Events received:", events)`
- Handle errors: Check error message and status code

---

## 3. API Request Flow

### Complete Request Cycle

#### **Step 3.1: API Client Builds Request**
**File:** `apps/frontend/app/lib/api.ts`
**Location:** Lines 68-90

```typescript
async function apiRequest<T>(endpoint: string, options: RequestOptions = {}) {
  const { token, params, ...fetchOptions } = options;
  
  // Build URL
  const url = buildUrl(`${API_BASE_URL}${endpoint}`, params);
  // Example: "http://localhost:3334/api/events"
  
  // Get auth token
  const authToken = token || getAuthToken();
  
  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });
}
```

**🔍 Debug Points:**
- **URL Construction:**
  ```typescript
  console.log("API Base URL:", API_BASE_URL);
  console.log("Endpoint:", endpoint);
  console.log("Full URL:", url);
  ```
- **Headers:**
  ```typescript
  console.log("Request headers:", headers);
  console.log("Auth token present:", !!authToken);
  ```
- **Request Body:**
  ```typescript
  console.log("Request body:", fetchOptions.body);
  ```

---

#### **Step 3.2: Backend Receives Request**
**File:** `apps/backend/src/events/events.controller.ts`
**Location:** Lines 56-79

```typescript
@Controller("events")
@UseGuards(JwtAuthGuard)  // ← Auth guard runs FIRST
export class EventsController {
  @Get()
  findAll(
    @Query("status") status?: EventStatus,
    @Request() req?: any,
  ) {
    // req.user is set by JwtAuthGuard after token validation
    return this.eventsService.findAll({
      status,
      userId: req?.user?.id,
      userRole: req?.user?.role,
      organizationId: req?.user?.organizationId,
    });
  }
}
```

**🔍 Debug Points:**
- Check guard execution: Add log in guard
- Check user from request: `console.log("Request user:", req.user)`
- Check query params: `console.log("Query params:", { status, ... })`

---

#### **Step 3.3: JWT Auth Guard Validates Token**
**File:** `apps/backend/src/auth/guards/jwt-auth.guard.ts`
**Location:** Lines 7-22

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;  // Skip auth for public routes
    }
    return super.canActivate(context);  // Validate JWT token
  }
}
```

**JWT Strategy:**
**File:** `apps/backend/src/auth/strategies/jwt.strategy.ts`
**Location:** Lines 20-35

```typescript
async validate(payload: any) {
  // Payload contains: { email, sub (userId), role, organizationId }
  
  // Query database to get full user
  const user = await this.prisma.client.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      organizationId: true,
    },
  });
  
  if (!user) {
    throw new UnauthorizedException("User not found");
  }
  
  return user;  // This becomes req.user
}
```

**🔍 Debug Points:**
- Check token extraction: `console.log("Token from header:", token)`
- Check payload decode: `console.log("JWT payload:", payload)`
- Check user lookup: `console.log("User from DB:", user)`
- Check guard result: `console.log("Guard passed:", user)`

---

## 4. Backend Processing Flow

### Service Layer Processing

#### **Step 4.1: Events Service Processes Request**
**File:** `apps/backend/src/events/events.service.ts`
**Location:** Lines 88-150

```typescript
async findAll(filters?: {
  status?: EventStatus;
  userId?: string;
  userRole?: UserRole;
  organizationId?: string;
}) {
  const where: any = {};
  
  // Filter by organization
  if (filters?.organizationId) {
    where.organizationId = filters.organizationId;
  }
  
  // Role-based filtering
  if (filters?.userRole === UserRole.Viewer) {
    // Viewers only see assigned events
    where.eventAssignments = {
      some: { userId: filters.userId },
    };
  }
  
  // Status filter
  if (filters?.status) {
    where.status = filters.status;
  }
  
  // Execute Prisma query
  const events = await this.prisma.client.event.findMany({
    where,
    include: {
      _count: {
        select: { budgetItems: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  
  return events;
}
```

**🔍 Debug Points:**
- Check filters: `console.log("Filters:", filters)`
- Check where clause: `console.log("Where clause:", JSON.stringify(where, null, 2))`
- Check query result: `console.log("Events found:", events.length)`
- Check role filtering: Verify correct events returned for role

---

## 5. Database Query Flow

### Prisma Query Execution

#### **Step 5.1: Prisma Service Executes Query**
**File:** `apps/backend/src/prisma/prisma.service.ts`

```typescript
@Injectable()
export class PrismaService {
  get client(): PrismaClientEventDb {
    return prismaEventDb;  // Singleton Prisma client
  }
}
```

**Actual Query (from Prisma logs):**
```sql
SELECT 
  "Event"."id",
  "Event"."name",
  "Event"."status",
  "Event"."organizationId",
  ...
FROM "Event"
WHERE "Event"."organizationId" = $1
  AND "Event"."status" = $2
ORDER BY "Event"."createdAt" DESC
```

**🔍 Debug Points:**
- **Enable Prisma Logging:**
  ```typescript
  // In packages/database/src/client.ts
  log: ["query", "error", "warn"]
  ```
- **Check SQL Generated:**
  - Look for `prisma:query` in console
  - Verify WHERE conditions
  - Check JOIN operations
- **Check Query Performance:**
  - Look for slow queries
  - Check if indexes are used
- **Verify Data Returned:**
  ```typescript
  console.log("Query result count:", events.length);
  console.log("First event:", events[0]);
  ```

---

#### **Step 5.2: Database Returns Data**
- PostgreSQL executes query
- Returns rows matching WHERE clause
- Prisma maps rows to TypeScript objects

**🔍 Debug Points:**
- Check database connection: `await prismaEventDb.$connect()`
- Verify data exists: Query database directly
- Check relationships: Verify includes work correctly

---

## 6. Response Flow Back to UI

### Data Returns to Frontend

#### **Step 6.1: Backend Returns JSON**
**File:** `apps/backend/src/events/events.controller.ts`

```typescript
@Get()
findAll(...) {
  return this.eventsService.findAll(...);
  // NestJS automatically serializes to JSON
}
```

**Response Format:**
```json
[
  {
    "id": "uuid",
    "name": "Event Name",
    "status": "Active",
    "organizationId": "uuid",
    "_count": {
      "budgetItems": 5
    }
  }
]
```

**🔍 Debug Points:**
- Check response status: Should be 200
- Check response headers: `Content-Type: application/json`
- Check response body: `console.log("Response:", JSON.stringify(data, null, 2))`

---

#### **Step 6.2: API Client Receives Response**
**File:** `apps/frontend/app/lib/api.ts`
**Location:** Lines 110-116

```typescript
// Handle response
const contentType = response.headers.get("content-type");
if (contentType && contentType.includes("application/json")) {
  return await response.json();
}
return null as T;
```

**🔍 Debug Points:**
- Check response OK: `console.log("Response OK:", response.ok)`
- Check status: `console.log("Status:", response.status)`
- Check data: `console.log("Response data:", await response.json())`

---

#### **Step 6.3: Loader Returns Data to Component**
**File:** `apps/frontend/app/routes/_protected.dashboard.tsx`
**Location:** Lines 130-137

```typescript
return json<LoaderData>({
  user,
  events: transformedEvents,
  stats: transformedStats,
  budgetData: budgetDataResult.budgetData,
  expenseCategories: budgetDataResult.expenseCategories,
  alerts,
});
```

**🔍 Debug Points:**
- Check loader data: `console.log("Loader data:", { user, events: events.length })`
- Verify transformations: Check transformed data structure
- Check errors: Handle try/catch properly

---

#### **Step 6.4: Component Receives Data**
**File:** `apps/frontend/app/routes/_protected.dashboard.tsx`
**Location:** Lines 167-183

```typescript
export default function DashboardRoute() {
  const loaderData = useLoaderData<typeof loader>();
  
  return (
    <Dashboard
      user={loaderData.user}
      events={loaderData.events}
      stats={loaderData.stats}
      budgetData={loaderData.budgetData}
      expenseCategories={loaderData.expenseCategories}
      alerts={loaderData.alerts}
    />
  );
}
```

**🔍 Debug Points:**
- Check loaderData: `console.log("Loader data in component:", loaderData)`
- Verify props passed: Check Dashboard component receives data
- Check rendering: Verify UI updates with data

---

## 7. Debugging Checklist

### Authentication Debugging

- [ ] **Login Form Submission**
  - [ ] Form data reaches action handler
  - [ ] Email/password are valid strings
  - [ ] No client-side validation errors

- [ ] **API Call to Backend**
  - [ ] URL is correct (`/auth/login`)
  - [ ] Request body contains email/password
  - [ ] No CORS errors
  - [ ] Network request succeeds (200 status)

- [ ] **Backend Validation**
  - [ ] User exists in database
  - [ ] Password hash matches
  - [ ] Email is verified
  - [ ] Account is active

- [ ] **Token Generation**
  - [ ] JWT tokens are generated
  - [ ] Tokens contain correct payload
  - [ ] Tokens are returned in response

- [ ] **Session Storage**
  - [ ] Tokens stored in session
  - [ ] Cookie is set in browser
  - [ ] Cookie is httpOnly and secure

---

### Protected Route Debugging

- [ ] **Route Protection**
  - [ ] `requireAuth()` is called
  - [ ] Session contains user and token
  - [ ] Redirect happens if not authenticated

- [ ] **API Request with Auth**
  - [ ] Token is extracted from session
  - [ ] Token is added to Authorization header
  - [ ] Backend receives token

- [ ] **Backend Auth Guard**
  - [ ] JWT token is valid
  - [ ] Token payload is decoded
  - [ ] User is found in database
  - [ ] `req.user` is set correctly

---

### Database Query Debugging

- [ ] **Prisma Connection**
  - [ ] Database connection is established
  - [ ] Prisma client is initialized
  - [ ] No connection errors

- [ ] **Query Execution**
  - [ ] Prisma logging is enabled
  - [ ] SQL query is correct
  - [ ] WHERE conditions are applied
  - [ ] Includes/relations work correctly

- [ ] **Data Returned**
  - [ ] Query returns expected data
  - [ ] Data structure matches TypeScript types
  - [ ] No null/undefined unexpected values

---

### Response Flow Debugging

- [ ] **Backend Response**
  - [ ] Controller returns data
  - [ ] Response status is 200
  - [ ] Response is JSON

- [ ] **API Client**
  - [ ] Response is received
  - [ ] JSON is parsed correctly
  - [ ] Errors are handled

- [ ] **Loader**
  - [ ] Data is transformed correctly
  - [ ] Loader returns correct structure
  - [ ] No errors thrown

- [ ] **Component**
  - [ ] `useLoaderData()` receives data
  - [ ] Props are passed to child components
  - [ ] UI renders with data

---

## 🔧 Quick Debug Commands

### Frontend Debugging
```typescript
// In any loader/action
console.log("🔍 DEBUG:", {
  requestUrl: request.url,
  user: user?.email,
  token: token?.substring(0, 20),
});

// In API client
console.log("🔍 API Request:", {
  url,
  method: fetchOptions.method,
  headers,
  body: fetchOptions.body,
});

// In component
console.log("🔍 Component Data:", loaderData);
```

### Backend Debugging
```typescript
// In controller
console.log("🔍 Controller:", {
  route: request.url,
  user: req.user?.email,
  body: request.body,
});

// In service
console.log("🔍 Service:", {
  filters,
  whereClause: JSON.stringify(where, null, 2),
  resultCount: events.length,
});

// In Prisma (enable logging)
// Check console for: prisma:query SELECT ...
```

### Database Debugging
```sql
-- Check user exists
SELECT id, email, "emailVerified", "isActive" FROM "User" WHERE email = 'test@example.com';

-- Check events
SELECT id, name, status, "organizationId" FROM "Event" WHERE "organizationId" = 'uuid';

-- Check token payload (decode JWT)
-- Use jwt.io or similar tool
```

---

## 📝 Common Issues & Solutions

### Issue 1: "User not found" on login
**Check:**
- User exists in database
- Email is correct (case-sensitive)
- Database connection is working

**Solution:**
```typescript
// Add debug log in auth.service.ts
console.log("Looking for user:", email);
const user = await this.prisma.client.user.findUnique({ where: { email } });
console.log("User found:", user ? "Yes" : "No");
```

---

### Issue 2: "Invalid credentials" but password is correct
**Check:**
- Password hash in database
- bcrypt.compare() is working
- Password is hashed correctly on registration

**Solution:**
```typescript
// Add debug log
console.log("Comparing password...");
const isValid = await bcrypt.compare(password, user.passwordHash);
console.log("Password valid:", isValid);
```

---

### Issue 3: Token not sent in API request
**Check:**
- Session contains token
- Token is extracted correctly
- Authorization header is set

**Solution:**
```typescript
// In api.ts
console.log("Auth token:", authToken ? "Present" : "Missing");
console.log("Headers:", headers);
```

---

### Issue 4: "Unauthorized" on protected routes
**Check:**
- Token is valid (not expired)
- Token signature is correct
- JWT_SECRET matches
- User exists in database

**Solution:**
```typescript
// In jwt.strategy.ts
console.log("JWT payload:", payload);
console.log("Looking for user ID:", payload.sub);
const user = await this.prisma.client.user.findUnique({ where: { id: payload.sub } });
console.log("User found:", user ? "Yes" : "No");
```

---

### Issue 5: Data not loading in UI
**Check:**
- API returns data
- Loader executes
- Component receives data
- No errors in console

**Solution:**
```typescript
// Add logs at each step
console.log("1. API response:", events);
console.log("2. Loader data:", { user, events });
console.log("3. Component data:", loaderData);
```

---

## 🎯 Next Steps

1. **Add logging** to each step using the debug points above
2. **Test authentication flow** end-to-end
3. **Test protected route** with valid token
4. **Test database queries** with Prisma logging
5. **Verify UI updates** with real data

---

## 📚 Key Files Reference

### Frontend
- `apps/frontend/app/lib/api.ts` - API client
- `apps/frontend/app/lib/auth.server.ts` - Auth utilities
- `apps/frontend/app/lib/session.server.ts` - Session management
- `apps/frontend/app/routes/login.tsx` - Login route
- `apps/frontend/app/routes/_protected.*.tsx` - Protected routes

### Backend
- `apps/backend/src/auth/auth.controller.ts` - Auth endpoints
- `apps/backend/src/auth/auth.service.ts` - Auth logic
- `apps/backend/src/auth/guards/jwt-auth.guard.ts` - Auth guard
- `apps/backend/src/auth/strategies/jwt.strategy.ts` - JWT validation
- `apps/backend/src/prisma/prisma.service.ts` - Database service
- `apps/backend/src/events/events.controller.ts` - Events endpoints
- `apps/backend/src/events/events.service.ts` - Events logic

### Database
- `packages/database/src/client.ts` - Prisma client
- `packages/database/prisma/schema.prisma` - Database schema

---

**Happy Debugging! 🐛🔍**

