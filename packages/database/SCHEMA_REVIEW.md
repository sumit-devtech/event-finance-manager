# Schema Review & Recommendations

## ✅ **Overall Assessment: GOOD** 
Your schema is well-structured and follows good practices. Here are improvements to make it even better.

---

## 🔴 **Critical Issues to Fix**

### 1. **Enum Usage Inconsistency**
**Problem:** You have enums defined (`UserRole`, `EventStatus`, `BudgetItemCategory`, `NotificationType`) but some models use `String` instead of the enum.

**Current:**
```prisma
role String // admin / manager / viewer
status String @default("draft")
```

**Should be:**
```prisma
role UserRole
status EventStatus @default(Planning)
```

**Impact:** 
- No type safety
- Can insert invalid values
- Harder to refactor

**Fix:** Update these models:
- `User.role` → `UserRole` enum
- `Event.status` → `EventStatus` enum  
- `Expense.status` → Create `ExpenseStatus` enum
- `Subscription.status` → Create `SubscriptionStatus` enum
- `Subscription.billingCycle` → Create `BillingCycle` enum

---

### 2. **Missing Indexes for Multi-Tenancy**
**Problem:** Critical queries will be slow without proper indexes.

**Add these indexes:**
```prisma
// User
model User {
  @@index([organizationId])
  @@index([email]) // Already unique, but explicit index helps
  @@index([organizationId, isActive])
}

// Event
model Event {
  @@index([organizationId])
  @@index([organizationId, status])
  @@index([createdBy])
  @@index([organizationId, startDate])
}

// Expense
model Expense {
  @@index([eventId, status])
  @@index([organizationId]) // Add organizationId field first!
}

// BudgetItem
model BudgetItem {
  @@index([eventId, category]) // Composite for common queries
}

// Vendor
model Vendor {
  @@index([organizationId])
}

// Subscription
model Subscription {
  @@index([organizationId, status])
}
```

---

### 3. **Missing `organizationId` in Expense**
**Problem:** Expense doesn't have `organizationId`, making multi-tenant queries inefficient.

**Current:**
```prisma
model Expense {
  eventId String
  // Missing organizationId!
}
```

**Fix:** Add `organizationId` for direct filtering:
```prisma
model Expense {
  organizationId String? // Add this
  eventId String
  // ... rest
  organization Organization? @relation(fields: [organizationId], references: [id])
  @@index([organizationId])
}
```

**Why:** You'll need to join Event → Organization to filter expenses by org, which is slower.

---

## 🟡 **Important Improvements**

### 4. **Add Composite Unique Constraint for VendorEvent**
**Problem:** Same vendor can be assigned to same event multiple times.

**Current:**
```prisma
model VendorEvent {
  vendorId String
  eventId String
  // No unique constraint!
}
```

**Fix:**
```prisma
model VendorEvent {
  @@unique([vendorId, eventId])
}
```

---

### 5. **Add `updatedAt` to Missing Models**
**Problem:** Some models don't track updates.

**Add `updatedAt` to:**
- `Vendor`
- `EventStakeholder`
- `Expense`
- `ROIMetrics`
- `CRMSync`
- `Insight`
- `Notification` (for tracking when read)

**Example:**
```prisma
model Vendor {
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt // Add this
}
```

---

### 6. **File Model: Add Validation**
**Problem:** File can link to multiple entities, but no validation ensures only one is set.

**Current:**
```prisma
model File {
  eventId String?
  budgetItemId String?
  reportId String?
  // All can be null or multiple can be set!
}
```

**Fix Options:**

**Option A:** Add validation in application layer (recommended for flexibility)
```typescript
// In your service
if (!eventId && !budgetItemId && !reportId) {
  throw new Error("File must link to at least one entity");
}
```

**Option B:** Use Prisma validation (more strict)
```prisma
// Add check constraint via raw SQL migration
// Or handle in application logic
```

---

### 7. **Add `deletedAt` for Soft Deletes (Optional)**
**Problem:** No way to soft-delete records.

**Consider adding:**
```prisma
model Event {
  deletedAt DateTime?
  // ...
  @@index([deletedAt])
}

// Then filter: where: { deletedAt: null }
```

**Benefit:** Can recover deleted data, maintain referential integrity.

---

## 🟢 **Nice-to-Have Enhancements**

### 8. **Add `version` Field to BudgetItem**
**Problem:** No way to track budget changes over time.

**Consider:**
```prisma
model BudgetItem {
  version Int @default(1) // Track revisions
  // ...
}
```

**Or:** Keep it simple (current approach is fine for MVP).

---

### 9. **Add `tags` or `labels` to Event**
**Problem:** No way to categorize/filter events beyond status.

**Consider:**
```prisma
model Event {
  tags String[] // Array of tags
  // or
  labels Json? // Flexible labels
}
```

---

### 10. **Add `currency` Field**
**Problem:** No currency support for multi-currency events.

**Consider:**
```prisma
model Event {
  currency String @default("USD")
}

model BudgetItem {
  currency String? // Inherit from Event or override
}
```

---

### 11. **Add `metadata` Field to More Models**
**Problem:** Limited flexibility for future features.

**Consider adding `metadata Json?` to:**
- `Event`
- `BudgetItem`
- `Vendor`

**Benefit:** Store custom fields without migrations.

---

## 📊 **Performance Optimizations**

### 12. **Add Composite Indexes for Common Queries**
```prisma
// Events by org and status
model Event {
  @@index([organizationId, status, startDate])
}

// Expenses by event and status
model Expense {
  @@index([eventId, status, createdAt])
}

// Budget items by event and category
model BudgetItem {
  @@index([eventId, category, createdAt])
}
```

---

## 🔒 **Security Improvements**

### 13. **Add `organizationId` to ActivityLog**
**Problem:** Can't efficiently filter activity logs by organization.

**Fix:**
```prisma
model ActivityLog {
  organizationId String? // Add this
  userId String
  eventId String?
  // ...
  organization Organization? @relation(fields: [organizationId], references: [id])
  @@index([organizationId])
}
```

---

### 14. **Add `organizationId` to Notification**
**Problem:** Similar issue - can't filter notifications by org efficiently.

**Consider:**
```prisma
model Notification {
  organizationId String? // Add this
  userId String
  // ...
  organization Organization? @relation(fields: [organizationId], references: [id])
  @@index([organizationId, read])
}
```

---

## 📝 **Data Integrity**

### 15. **Add `@default()` Values**
**Consider:**
```prisma
model Expense {
  status String @default("pending") // ✅ You have this
  amount Float // Should be @default(0)?
}

model BudgetItem {
  estimatedCost Decimal? @db.Decimal(10, 2) // Consider @default(0)
  actualCost Decimal? @db.Decimal(10, 2) // Consider @default(0)
}
```

---

### 16. **Add Constraints**
```prisma
model Expense {
  amount Float // Consider: Must be >= 0
  // Add validation in application layer
}

model BudgetItem {
  estimatedCost Decimal? @db.Decimal(10, 2)
  actualCost Decimal? @db.Decimal(10, 2)
  // Ensure actualCost <= estimatedCost? (business rule)
}
```

---

## 🎯 **Summary: Priority Actions**

### **Must Fix (Before Production):**
1. ✅ Use enums instead of String for `role`, `status`, etc.
2. ✅ Add `organizationId` to `Expense` model
3. ✅ Add critical indexes (especially `organizationId` indexes)
4. ✅ Add `@@unique([vendorId, eventId])` to VendorEvent

### **Should Fix (Soon):**
5. ✅ Add `updatedAt` to models missing it
6. ✅ Add `organizationId` to ActivityLog and Notification
7. ✅ Add composite indexes for common queries

### **Nice to Have:**
8. ✅ Consider soft deletes (`deletedAt`)
9. ✅ Add currency support
10. ✅ Add metadata fields for flexibility

---

## ✅ **What's Already Good:**

1. ✅ Multi-tenancy structure is solid
2. ✅ Proper use of UUIDs
3. ✅ Good cascade delete strategy
4. ✅ Flexible File model (can link to multiple entities)
5. ✅ Good use of JSON fields for flexible data
6. ✅ Proper indexes on foreign keys
7. ✅ EventAssignment with unique constraint
8. ✅ Good separation: EventStakeholder vs EventAssignment

---

## 🚀 **Recommended Next Steps:**

1. **Create migration script** to add missing indexes
2. **Update enums** to use proper Prisma enums
3. **Add organizationId** to Expense, ActivityLog, Notification
4. **Test multi-tenant queries** to ensure proper isolation
5. **Add validation layer** in your services for business rules

---

## 📋 **Quick Fix Checklist:**

- [ ] Change `User.role` to `UserRole` enum
- [ ] Change `Event.status` to `EventStatus` enum
- [ ] Create `ExpenseStatus` enum and use it
- [ ] Create `SubscriptionStatus` enum and use it
- [ ] Add `organizationId` to Expense model
- [ ] Add `organizationId` to ActivityLog model
- [ ] Add `organizationId` to Notification model
- [ ] Add `@@unique([vendorId, eventId])` to VendorEvent
- [ ] Add `updatedAt` to Vendor, Expense, ROIMetrics, CRMSync, Insight
- [ ] Add indexes: `@@index([organizationId])` to User, Event, Vendor, Expense, etc.
- [ ] Add composite indexes for common query patterns

---

**Overall Rating: 8/10** - Solid foundation, needs enum consistency and performance indexes!

