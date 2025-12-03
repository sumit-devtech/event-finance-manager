# Signup Workflow Documentation

## Overview

This document describes the complete signup workflow for the Event Finance Manager application, including user registration, organization creation, subscription setup, and email verification.

## Workflow Steps

### 1. User Registration Request

**Frontend:** `apps/frontend/app/routes/login.tsx`
- User fills out registration form with:
  - Email address
  - Password (minimum 6 characters)
  - Full name
  - Password confirmation

**Backend Endpoint:** `POST /auth/register`
- Controller: `apps/backend/src/auth/auth.controller.ts`
- Service: `apps/backend/src/auth/auth.service.ts` → `register()`

### 2. Database Transaction

All database operations are performed in a single Prisma transaction to ensure data consistency:

#### 2.1 Create Organization
```typescript
Organization {
  id: uuid(),
  name: "{User's Name}'s Organization" or "{Email Domain}'s Organization",
  industry: null,
  logoUrl: null,
  createdAt: now(),
  updatedAt: now()
}
```

#### 2.2 Create User
```typescript
User {
  id: uuid(),
  organizationId: organization.id,  // ✅ Linked to organization
  email: registerDto.email,
  passwordHash: bcrypt hash,
  fullName: registerDto.name,
  role: "Admin",  // ✅ First user is always Admin
  isActive: false,  // ✅ Inactive until email verified
  emailVerified: false,  // ✅ Email not verified yet
  emailVerificationToken: uuid(),  // ✅ Unique verification token
  emailVerificationExpires: now() + 24 hours,  // ✅ 24 hour expiry
  createdAt: now(),
  updatedAt: now()
}
```

#### 2.3 Create Free Subscription
```typescript
Subscription {
  id: uuid(),
  organizationId: organization.id,  // ✅ Linked to organization
  planName: "free",
  billingCycle: "Monthly",
  status: "Active",
  currentPeriodStart: now(),
  currentPeriodEnd: now() + 30 days,
  createdAt: now(),
  updatedAt: now()
}
```

#### 2.4 Create Subscription History
```typescript
SubscriptionHistory {
  id: uuid(),
  subscriptionId: subscription.id,  // ✅ Linked to subscription
  action: "create",
  newValue: {
    planName: "free",
    billingCycle: "Monthly",
    status: "Active"
  },
  changedBy: user.id,  // ✅ Linked to user
  changedAt: now()
}
```

#### 2.5 Create Activity Log
```typescript
ActivityLog {
  id: uuid(),
  organizationId: organization.id,  // ✅ Linked to organization
  userId: user.id,  // ✅ Linked to user
  action: "user.registered",
  metadata: {
    email: user.email,
    fullName: user.fullName
  },
  createdAt: now()
}
```

### 3. Send Verification Email

After successful registration, a verification email is sent to the user's email address containing:
- Verification link: `{FRONTEND_URL}/auth/verify-email?token={emailVerificationToken}`
- Expiration notice (24 hours)
- Instructions to verify account

**Email Service:** `apps/backend/src/notifications/email.service.ts`

### 4. Registration Response

**Response:** (NO JWT tokens returned)
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "email": "user@example.com"
}
```

**Frontend Action:**
- Redirects to `/auth/verify-email?email={email}&pending=true`
- Shows "Check Your Email" page with resend option

### 5. Email Verification

**User Action:** Clicks verification link in email

**Backend Endpoint:** `GET /auth/verify-email?token={token}`
- Service: `apps/backend/src/auth/auth.service.ts` → `verifyEmail()`

**Verification Process:**
1. Validate token exists and is not expired
2. Check email is not already verified
3. Update User:
   - `emailVerified: true`
   - `isActive: true`
   - `emailVerificationToken: null`
   - `emailVerificationExpires: null`
4. Create ActivityLog entry: `"user.email_verified"`
5. Return JWT tokens (user can now login)

**Response:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "Admin",
    "organizationId": "..."
  }
}
```

**Frontend Action:**
- Sets tokens in session
- Redirects to `/dashboard?verified=true`

### 6. Login Protection

**Login Validation:** `apps/backend/src/auth/auth.service.ts` → `validateUser()`

Before allowing login, the system checks:
- ✅ Email is verified (`emailVerified === true`)
- ✅ Account is active (`isActive === true`)
- ✅ Password is correct

**Error Messages:**
- `"Please verify your email before logging in"` - if email not verified
- `"Your account is inactive. Please contact support."` - if account inactive
- `"Invalid credentials"` - if password incorrect

## Database Tables & References

### Tables That Get Entries During Signup

| Table | Fields Set | References Created |
|-------|-----------|-------------------|
| **Organization** | `id`, `name`, `createdAt`, `updatedAt` | None (root entity) |
| **User** | `id`, `email`, `passwordHash`, `fullName`, `role`, `organizationId`, `isActive`, `emailVerified`, `emailVerificationToken`, `emailVerificationExpires` | `organizationId` → Organization.id |
| **Subscription** | `id`, `planName`, `billingCycle`, `status`, `organizationId`, `currentPeriodStart`, `currentPeriodEnd` | `organizationId` → Organization.id |
| **SubscriptionHistory** | `id`, `subscriptionId`, `action`, `newValue`, `changedBy`, `changedAt` | `subscriptionId` → Subscription.id<br>`changedBy` → User.id |
| **ActivityLog** | `id`, `organizationId`, `userId`, `action`, `metadata`, `createdAt` | `organizationId` → Organization.id<br>`userId` → User.id |

### Reference Chain

```
Organization (root)
  ├── User.organizationId → Organization.id
  ├── Subscription.organizationId → Organization.id
  │   └── SubscriptionHistory.subscriptionId → Subscription.id
  │       └── SubscriptionHistory.changedBy → User.id
  └── ActivityLog.organizationId → Organization.id
      └── ActivityLog.userId → User.id
```

## API Endpoints

### POST /auth/register
**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "email": "user@example.com"
}
```

**Response (Error):**
```json
{
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

### GET /auth/verify-email?token={token}
**Description:** Verify user email address

**Query Parameters:**
- `token` (required): Email verification token

**Response (Success):**
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Admin",
    "organizationId": "org_id"
  }
}
```

**Response (Error):**
```json
{
  "statusCode": 404,
  "message": "Invalid verification token"
}
```

### POST /auth/resend-verification
**Description:** Resend verification email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent. Please check your inbox."
}
```

## Security Features

1. **Email Verification Required:** Users cannot login until email is verified
2. **Token Expiration:** Verification tokens expire after 24 hours
3. **Unique Tokens:** Each verification token is a unique UUID
4. **Transaction Safety:** All database operations use Prisma transactions
5. **Password Hashing:** Passwords are hashed using bcrypt (10 rounds)
6. **Account Activation:** Accounts are inactive until email verification

## Error Handling

### Registration Errors
- **409 Conflict:** Email already exists
- **400 Bad Request:** Invalid input data

### Verification Errors
- **404 Not Found:** Invalid verification token
- **400 Bad Request:** Token expired or email already verified

### Login Errors
- **401 Unauthorized:** Email not verified
- **401 Unauthorized:** Account inactive
- **401 Unauthorized:** Invalid credentials

## Frontend Routes

### /login
- Registration form
- Login form
- Handles both registration and login

### /auth/verify-email
- Email verification page
- Shows "Check Your Email" message if pending
- Auto-verifies if token is present in URL
- Resend verification email option

## Testing Checklist

- [x] User can register with email/password
- [x] Organization is created with correct name
- [x] User is assigned to organization (organizationId set)
- [x] User role is "Admin"
- [x] User is created with `isActive: false` and `emailVerified: false`
- [x] Email verification token is generated and stored
- [x] Verification email is sent successfully
- [x] User cannot login before email verification
- [x] Email verification link works correctly
- [x] User account is activated after verification
- [x] JWT tokens are returned only after verification
- [x] Free subscription is created and active
- [x] SubscriptionHistory entry is created
- [x] ActivityLog entries are created for registration and verification
- [x] JWT token includes organizationId
- [x] User can create events after verification (subscription allows 1 event)
- [x] Resend verification email works
- [x] Expired verification tokens are rejected
- [x] Transaction rolls back on any error

## Migration Required

Before using this workflow, run the database migration to add email verification fields:

```bash
cd packages/database
npx prisma migrate dev --name add_email_verification
```

This will add the following fields to the User model:
- `emailVerified Boolean @default(false)`
- `emailVerificationToken String? @unique`
- `emailVerificationExpires DateTime?`

## Environment Variables

### Required Environment Variables

Required environment variables for email functionality (configure in `apps/backend/.env`):

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com
FRONTEND_URL=http://localhost:5173
```

### SMTP Configuration for Testing

For development and testing, you can use one of these options:

#### Option 1: Mailtrap (Recommended for Testing)

[Mailtrap](https://mailtrap.io/) is a popular email testing service that captures all emails without sending them to real recipients.

1. Sign up for a free account at https://mailtrap.io/
2. Create an inbox
3. Copy the SMTP credentials from your inbox settings

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM=noreply@event-finance-manager.com
FRONTEND_URL=http://localhost:5173
```

**Benefits:**
- ✅ Free tier available
- ✅ All emails captured in Mailtrap dashboard
- ✅ No risk of sending test emails to real users
- ✅ Email preview and HTML inspection

#### Option 2: Ethereal Email (Nodemailer Testing)

[Ethereal Email](https://ethereal.email/) is a free testing service by Nodemailer that creates temporary SMTP accounts.

1. Visit https://ethereal.email/
2. Click "Create Account" to generate credentials
3. Use the generated credentials

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=generated-username
SMTP_PASSWORD=generated-password
SMTP_FROM=noreply@event-finance-manager.com
FRONTEND_URL=http://localhost:5173
```

**Benefits:**
- ✅ Completely free
- ✅ No signup required
- ✅ Emails viewable at https://ethereal.email/messages
- ✅ Perfect for quick testing

#### Option 3: Gmail SMTP (Development Only)

For local development, you can use Gmail SMTP with an App Password.

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated app password

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Note:** Gmail has sending limits and may block if too many emails are sent. Not recommended for production.

#### Option 4: Local Testing (No SMTP)

For testing without email functionality, the registration will still work but emails won't be sent. The system will log a warning and continue.

```env
# Leave SMTP variables unset or empty
# Registration will work, but verification emails won't be sent
# Users can still verify manually via database or API endpoint
FRONTEND_URL=http://localhost:5173
```

**How Manual Verification Works:**

When SMTP is not configured, users can still register, but they need to verify their email manually. Here are the methods:

##### Method 1: Using the Verification API Endpoint

1. **Get the verification token from the database:**
   ```sql
   -- Connect to your database and run:
   SELECT email, "emailVerificationToken", "emailVerificationExpires"
   FROM "User"
   WHERE "emailVerified" = false;
   ```

2. **Use the token to verify via API:**
   ```bash
   # Direct API call
   curl "http://localhost:3334/api/auth/verify-email?token=YOUR_TOKEN_HERE"
   
   # Or visit in browser:
   http://localhost:5173/auth/verify-email?token=YOUR_TOKEN_HERE
   ```

3. **The API will:**
   - Validate the token
   - Set `emailVerified = true`
   - Set `isActive = true`
   - Clear the verification token
   - Return JWT tokens for login

##### Method 2: Direct Database Update (Quick Testing)

For quick testing, you can manually update the database:

```sql
-- Update user to verified and active
UPDATE "User"
SET 
  "emailVerified" = true,
  "isActive" = true,
  "emailVerificationToken" = NULL,
  "emailVerificationExpires" = NULL
WHERE email = 'user@example.com';
```

**Note:** This method won't return JWT tokens. You'll need to login normally after updating the database.

##### Method 3: Using Prisma Studio (Visual)

1. **Open Prisma Studio:**
   ```bash
   cd packages/database
   npx prisma studio
   ```

2. **Navigate to User table**
3. **Find the unverified user**
4. **Copy the `emailVerificationToken` value**
5. **Use it in the verification URL:**
   ```
   http://localhost:5173/auth/verify-email?token=COPIED_TOKEN
   ```

##### Method 4: Using the Helper Script

A helper script is provided to easily list all unverified users and their tokens:

```bash
# From project root
npx tsx scripts/list-unverified-users.ts
```

This script will:
- List all unverified users
- Show their verification tokens
- Display verification URLs
- Show expiration status
- Provide API curl commands

**Example Output:**
```
📧 Unverified Users:

================================================================================

1. John Doe (john@example.com)
   Status: ⏰ Valid
   Token: 550e8400-e29b-41d4-a716-446655440000
   Expires: 12/15/2024, 2:30:00 PM
   Verify URL: http://localhost:5173/auth/verify-email?token=550e8400-e29b-41d4-a716-446655440000
   API Call: curl "http://localhost:3334/api/auth/verify-email?token=550e8400-e29b-41d4-a716-446655440000"
   Created: 12/14/2024, 2:30:00 PM

================================================================================

Total: 1 unverified user(s)
```

The script is located at: `scripts/list-unverified-users.ts`

##### Complete Manual Verification Flow

1. **User registers** → Account created but inactive
2. **Check backend logs** for the verification token (if logging is enabled)
3. **Query database** to get the token:
   ```sql
   SELECT "emailVerificationToken" FROM "User" WHERE email = 'user@example.com';
   ```
4. **Visit verification URL:**
   ```
   http://localhost:5173/auth/verify-email?token=TOKEN_FROM_DATABASE
   ```
5. **User is automatically logged in** and redirected to dashboard

**Benefits of Manual Verification:**
- ✅ No email service required
- ✅ Fast for local development
- ✅ Can test verification flow without SMTP setup
- ✅ Useful for CI/CD testing

**Limitations:**
- ❌ Not suitable for production
- ❌ Requires database access
- ❌ Tokens expire after 24 hours (can be extended in code)

### Frontend Environment Variables

The frontend doesn't need SMTP configuration (email is sent from backend). Only required variable:

```env
# apps/frontend/.env
API_BASE_URL=http://localhost:3334/api
```

### Production SMTP Configuration

For production, use a reliable email service:

**Recommended Services:**
- **SendGrid** - https://sendgrid.com/
- **Mailgun** - https://www.mailgun.com/
- **Amazon SES** - https://aws.amazon.com/ses/
- **Postmark** - https://postmarkapp.com/

Example with SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

## Professional Recommendations by Environment

### 🏗️ Development Environment

**Recommended: Mailtrap**

```env
# apps/backend/.env.development or .env.local
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM=noreply@event-finance-manager.dev
FRONTEND_URL=http://localhost:5173
```

**Why Mailtrap?**
- ✅ Free tier: 500 emails/month
- ✅ All emails captured in dashboard (no real emails sent)
- ✅ Email preview and HTML inspection
- ✅ Team collaboration features
- ✅ Perfect for testing email templates
- ✅ No risk of sending test emails to real users

**Alternative for Quick Testing:** Ethereal Email (no signup needed)

---

### 🧪 Testing/Staging Environment

**Recommended: Mailtrap or SendGrid Test Account**

```env
# apps/backend/.env.staging
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-test-api-key
SMTP_FROM=noreply@staging.yourdomain.com
FRONTEND_URL=https://staging.yourdomain.com
```

**Why?**
- Use a separate SendGrid account/key for staging
- Or continue with Mailtrap for staging testing
- Allows testing real email delivery without affecting production
- Can test email deliverability and formatting

---

### 🚀 Production Environment

**Recommended: SendGrid or Postmark**

#### Option 1: SendGrid (Best for Scale) ⭐ **RECOMMENDED**

```env
# apps/backend/.env.production
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-production-api-key
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Why SendGrid?**
- ✅ Generous free tier: 100 emails/day forever
- ✅ Excellent deliverability rates
- ✅ Detailed analytics and tracking
- ✅ Easy to scale as you grow
- ✅ Good documentation and support
- ✅ Transactional email focus
- ✅ Webhook support for email events

**Pricing:**
- Free: 100 emails/day (perfect for MVP)
- Essentials ($19.95/mo): 50,000 emails/month
- Pro ($89.95/mo): 100,000 emails/month

#### Option 2: Postmark (Best for Deliverability)

```env
# apps/backend/.env.production
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=your-postmark-server-token
SMTP_PASSWORD=your-postmark-server-token
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Why Postmark?**
- ✅ Highest deliverability rates in industry
- ✅ Excellent for transactional emails
- ✅ Great developer experience
- ✅ Detailed bounce/spam tracking
- ✅ Free tier: 100 emails/month
- ✅ Pay-as-you-go pricing

**Pricing:**
- Free: 100 emails/month
- $15/mo: 10,000 emails/month
- $80/mo: 50,000 emails/month

#### Option 3: Amazon SES (Best for Cost at Scale)

```env
# apps/backend/.env.production
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Why Amazon SES?**
- ✅ Very cost-effective at scale ($0.10 per 1,000 emails)
- ✅ Integrates well with AWS infrastructure
- ✅ Requires domain verification
- ✅ More setup complexity
- ✅ Good for high-volume applications

**Pricing:**
- $0.10 per 1,000 emails
- Free tier: 62,000 emails/month (if on EC2)

---

### 📋 Recommended Setup by App Stage

#### **Early Stage / MVP** (Current Stage)
```
Development: Mailtrap (Free)
Production: SendGrid (Free tier - 100 emails/day)
```
**Cost:** $0/month

#### **Growth Stage** (10-1000 users)
```
Development: Mailtrap (Free)
Staging: SendGrid Test Account
Production: SendGrid Essentials ($19.95/mo)
```
**Cost:** ~$20/month

#### **Scale Stage** (1000+ users)
```
Development: Mailtrap (Free)
Staging: SendGrid Test Account  
Production: SendGrid Pro ($89.95/mo) or Amazon SES
```
**Cost:** ~$90/month or pay-per-use with SES

#### **Enterprise Stage** (10,000+ users)
```
Development: Mailtrap (Paid for team)
Staging: SendGrid Test Account
Production: Amazon SES or dedicated email infrastructure
```
**Cost:** Variable based on volume

---

### 🔒 Security Best Practices

1. **Use Environment-Specific Configs**
   - Never commit SMTP credentials to git
   - Use `.env.local` for development (already in `.gitignore`)
   - Use secure environment variables in production (AWS Secrets Manager, Render env vars, etc.)

2. **Separate API Keys**
   - Use different API keys for development/staging/production
   - Rotate keys regularly (every 90 days)
   - Use least-privilege access (only send email permissions)

3. **Domain Authentication** (Critical for Production)
   - Set up SPF records for your domain
   - Configure DKIM signing
   - Set up DMARC policy
   - This improves deliverability and prevents spoofing

4. **Rate Limiting**
   - Implement rate limiting on registration endpoint
   - Prevent email spam/abuse
   - Monitor email sending patterns

---

### 🎯 Final Recommendation for Event Finance Manager

**For your Event Finance Manager app, I recommend:**

#### **Development (Local)**
```
✅ Mailtrap (Free)
- Perfect for local testing
- No real emails sent
- Easy to inspect emails
- Free tier covers all development needs
```

#### **Production (Live App)**
```
✅ SendGrid (Start with Free, upgrade as needed)
- Free tier: 100 emails/day = ~3,000/month
- Covers initial users perfectly
- Easy setup and integration
- Good deliverability out of the box
- Upgrade to paid plan when you exceed free tier
```

**Setup Steps:**
1. ✅ Sign up for Mailtrap (free) → https://mailtrap.io/
2. ✅ Sign up for SendGrid (free) → https://sendgrid.com/
3. ✅ Configure domain authentication (SPF, DKIM) for production
4. ✅ Use environment variables (already configured in your app)
5. ✅ Monitor email delivery rates in SendGrid dashboard
6. ✅ Upgrade SendGrid plan when you exceed 100 emails/day

**Why This Setup?**
- ✅ **Professional** - Industry-standard email delivery
- ✅ **Cost-effective** - Free to start, scales with your growth
- ✅ **Easy to implement** - Works with your existing code
- ✅ **Proper separation** - Dev and prod environments isolated
- ✅ **Scalable** - Can grow from free to enterprise plans
- ✅ **Reliable** - High deliverability rates

**Expected Costs:**
- **Now (MVP):** $0/month (both free tiers)
- **At 100 users:** $0/month (still within free tier)
- **At 500 users:** ~$20/month (SendGrid Essentials)
- **At 2000+ users:** ~$90/month (SendGrid Pro) or switch to SES

This setup gives you professional email delivery from day one without any upfront costs!

## Implementation Summary

### Features Implemented

✅ **Organization Creation**
- Organization automatically created on user signup
- Organization name generated from user's name or email domain
- First user of organization is always assigned "Admin" role

✅ **User Registration**
- User created with organization link (`organizationId`)
- Password hashed using bcrypt (10 rounds)
- User account inactive until email verification
- Email verification token generated (24-hour expiry)

✅ **Subscription Management**
- Free subscription automatically created for new organization
- Subscription linked to organization
- Subscription history tracked
- 1 event limit enforced for free plan

✅ **Email Verification**
- Email verification required before login
- Verification tokens expire after 24 hours
- Resend verification email functionality
- Automatic account activation after verification

✅ **Security Features**
- Transaction safety (all-or-nothing database operations)
- Email verification required for login
- Account activation tied to email verification
- Unique verification tokens (UUID)
- Password hashing with bcrypt

✅ **Activity Logging**
- Registration event logged
- Email verification event logged
- All actions tracked with metadata

✅ **JWT Token Enhancement**
- `organizationId` included in JWT payload
- Token refresh includes organization context
- User object includes organizationId in responses

### Files Modified

**Backend:**
- `packages/database/prisma/schema.prisma` - Added email verification fields
- `apps/backend/src/auth/auth.service.ts` - Complete registration workflow
- `apps/backend/src/auth/auth.controller.ts` - Added verification endpoints
- `apps/backend/src/auth/auth.module.ts` - Added NotificationsModule
- `apps/backend/src/auth/dto/auth-response.dto.ts` - Added organizationId
- `apps/backend/src/auth/strategies/jwt.strategy.ts` - Added organizationId

**Frontend:**
- `apps/frontend/app/routes/login.tsx` - Updated registration flow
- `apps/frontend/app/routes/auth.verify-email.tsx` - New verification page

**Documentation:**
- `docs/SIGNUP_WORKFLOW.md` - Complete workflow documentation

## Notes

- First user of an organization is always assigned the "Admin" role
- Organization name is generated from user's name or email domain
- Free subscription allows 1 event (enforced by subscription service)
- All database operations are atomic (transaction-based)
- Email sending failures don't block registration (user can request resend)

