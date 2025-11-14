# 🚀 Audit Quick Reference - Action Items

## 🔴 CRITICAL - Fix Immediately

### 1. HOD Role Missing from Database
```sql
-- Create migration: backend/src/db/migrations/009_add_hod_role.sql
ALTER TABLE shared.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE shared.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'teacher', 'hod', 'admin', 'superadmin'));
```
**Impact:** Cannot create HOD users currently

### 2. Status Not Set in signUp()
**File:** `backend/src/services/authService.ts:134-151`
**Fix:** Add `status` column to INSERT, set based on role
**Impact:** Users may have null status, blocking access

### 3. RBAC Middleware Duplication
**Files:** 
- `backend/src/middleware/rbac.ts` (keep)
- `backend/src/middleware/authGuards.ts` (merge)

**Action:** 
- Move `requireSelfOrPermission()` to `rbac.ts`
- Remove `requireRoleGuard()` (use `requireRole()` instead)
- Update all route imports

**Impact:** Security inconsistency, maintenance burden

### 4. User Creation Logic Duplication
**Files:**
- `backend/src/services/authService.ts` → `signUp()`
- `backend/src/services/superuserService.ts` → `createAdminForSchool()`

**Action:** Extract to `userService.createUser()`
**Impact:** Inconsistent status handling

---

## ⚠️ HIGH PRIORITY - Fix This Week

### 5. Tenant Context Checks Duplicated
**Pattern:** Repeated in ~15 route files
```typescript
if (!req.tenantClient || !req.tenant) {
  return res.status(500).json({ message: 'Tenant context missing' });
}
```
**Fix:** Create `ensureTenantContext()` middleware

### 6. Frontend RBAC Only Checks Roles
**File:** `frontend/src/components/ProtectedRoute.tsx`
**Fix:** Add permission checking (create `usePermission()` hook)
**Impact:** Frontend may show UI that backend rejects

### 7. AuthModal Success Handling
**File:** `frontend/src/components/auth/AuthModal.tsx:108`
**Fix:** Add navigation on success
**Impact:** Poor UX after modal login

---

## 📋 FILES TO UPDATE

### Backend Routes (RBAC Consolidation)
- `backend/src/routes/results.ts`
- `backend/src/routes/attendance.ts`
- `backend/src/routes/teacher.ts`
- `backend/src/routes/users.ts`
- `backend/src/routes/students.ts`
- `backend/src/routes/teachers.ts`
- All other routes using `authGuards`

### Backend Services
- `backend/src/services/authService.ts` - Add status to signUp
- `backend/src/services/superuserService.ts` - Use userService.createUser()
- `backend/src/services/userService.ts` - Add createUser() method

### Frontend
- `frontend/src/components/ProtectedRoute.tsx` - Add permission checks
- `frontend/src/components/auth/AuthModal.tsx` - Fix success handling
- `frontend/src/context/AuthContext.tsx` - Extract status utilities

---

## ✅ WHAT'S WORKING WELL

- Token refresh mechanism
- Tenant isolation (schema-per-tenant)
- Basic RBAC enforcement
- Auth component reusability
- API error handling
- Cross-tenant access prevention

---

## 📊 METRICS

- **Critical Issues:** 4
- **High Priority:** 3
- **Files to Update:** ~25
- **Estimated Fix Time:** 2-3 weeks

---

See `docs/comprehensive-audit-report.md` for full details.

