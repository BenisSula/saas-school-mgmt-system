# Tenant Context & Middleware Ordering

This document explains how tenant context is resolved and the correct ordering of middleware in the SaaS School Management System.

## Table of Contents

- [Tenant Context Overview](#tenant-context-overview)
- [Middleware Ordering](#middleware-ordering)
- [Tenant Resolution](#tenant-resolution)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Tenant Context Overview

The system uses a **schema-per-tenant** architecture where each tenant has:
- A tenant record in `shared.tenants`
- A dedicated PostgreSQL schema (e.g., `tenant_alpha`, `tenant_beta`)
- Isolated data within that schema

Every request must have tenant context resolved before accessing tenant-specific data.

## Middleware Ordering

**CRITICAL**: Middleware must be applied in the correct order. Incorrect ordering will cause tenant resolution failures and security issues.

### Correct Order

```typescript
router.use(
  authenticate,           // 1. Authenticate user (sets req.user)
  tenantResolver(),       // 2. Resolve tenant (sets req.tenant, req.tenantClient)
  ensureTenantContext(),  // 3. Verify tenant context exists
  requirePermission(...)  // 4. Check permissions (requires req.user)
);
```

### Why This Order Matters

1. **`authenticate`** must come first because:
   - Sets `req.user` with user information
   - `tenantResolver` may need user's `tenantId` to resolve tenant
   - Permission checks need `req.user`

2. **`tenantResolver()`** must come after `authenticate` because:
   - May use `req.user.tenantId` to resolve tenant
   - Sets `req.tenant` and `req.tenantClient`
   - Required before any tenant-specific operations

3. **`ensureTenantContext()`** must come after `tenantResolver` because:
   - Verifies `req.tenant` and `req.tenantClient` exist
   - Prevents 500 errors from missing tenant context
   - Should be checked before route handlers

4. **`requirePermission()`** can come after tenant context because:
   - Only needs `req.user` (set by `authenticate`)
   - Doesn't require tenant context (permissions are role-based)

### Incorrect Ordering Examples

❌ **Wrong: Tenant resolver before authentication**
```typescript
router.use(
  tenantResolver(),  // ❌ req.user not set yet
  authenticate,
  // ...
);
```

❌ **Wrong: Permission check before tenant resolver**
```typescript
router.use(
  authenticate,
  requirePermission('users:manage'),  // ❌ OK, but tenant not resolved yet
  tenantResolver(),  // ❌ Too late - route handler may need tenant
  // ...
);
```

❌ **Wrong: Missing ensureTenantContext**
```typescript
router.use(
  authenticate,
  tenantResolver(),
  // ❌ Missing ensureTenantContext - may cause 500 errors
  requirePermission('users:manage')
);
```

## Tenant Resolution

### How Tenant Resolution Works

1. **Extract tenant identifier**:
   - From `x-tenant-id` header (preferred)
   - From `req.user.tenantId` (fallback)
   - From query parameter `tenantId` (development only)

2. **Query tenant record**:
   - Lookup in `shared.tenants` table
   - Get `schema_name` (e.g., `tenant_alpha`)

3. **Get tenant database client**:
   - Acquire connection from pool
   - Set search path to tenant schema
   - Store as `req.tenantClient`

4. **Set tenant context**:
   - `req.tenant.id`: Tenant UUID
   - `req.tenant.name`: Tenant name
   - `req.tenant.schema`: Schema name
   - `req.tenantClient`: Database client for tenant schema

### Tenant Resolver Middleware

```typescript
import tenantResolver from '../middleware/tenantResolver';

// Basic usage
router.use(authenticate, tenantResolver(), ensureTenantContext());

// With options (if supported)
router.use(
  authenticate,
  tenantResolver({ 
    required: true,  // Require tenant (default: true)
    headerName: 'x-tenant-id'  // Custom header name
  }),
  ensureTenantContext()
);
```

### SuperAdmin Tenant Resolution

SuperAdmins have `tenantId: null` and can:
- Access platform-level routes (no tenant required)
- Specify tenant via `x-tenant-id` header for tenant operations
- Switch between tenants dynamically

**Example:**
```typescript
// SuperAdmin accessing tenant data
GET /admin/overview
Headers:
  Authorization: Bearer <superadmin-token>
  x-tenant-id: <tenant-id>  // Required for tenant operations
```

## Common Patterns

### Pattern 1: Tenant-Specific Route

```typescript
import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import tenantResolver from '../middleware/tenantResolver';
import ensureTenantContext from '../middleware/ensureTenantContext';
import { requirePermission } from '../middleware/rbac';

const router = Router();

router.use(
  authenticate,
  tenantResolver(),
  ensureTenantContext()
);

router.get('/students', requirePermission('students:view'), async (req, res) => {
  // req.tenant is guaranteed to exist
  // req.tenantClient is guaranteed to exist
  const students = await listStudents(req.tenantClient!, req.tenant!.schema);
  res.json(students);
});
```

### Pattern 2: Platform-Level Route (SuperAdmin Only)

```typescript
import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { requirePermission } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/tenants', requirePermission('tenants:manage'), async (req, res) => {
  // No tenant resolver - platform-level route
  // req.user.role should be 'superadmin'
  const tenants = await listTenants();
  res.json(tenants);
});
```

### Pattern 3: Teacher Assignment Verification

```typescript
import verifyTeacherAssignment from '../middleware/verifyTeacherAssignment';

router.post(
  '/attendance/mark',
  authenticate,
  tenantResolver(),
  ensureTenantContext(),
  requirePermission('attendance:mark'),
  verifyTeacherAssignment({ classIdParam: 'classId' }),  // After tenant context
  async (req, res) => {
    // Teacher assignment verified
    // Tenant context available
    await markAttendance(req.tenantClient!, req.tenant!.schema, records);
  }
);
```

### Pattern 4: Self-Access or Permission

```typescript
import { requireSelfOrPermission } from '../middleware/rbac';

router.get(
  '/attendance/:studentId',
  authenticate,
  tenantResolver(),
  ensureTenantContext(),
  requireSelfOrPermission('students:manage', 'studentId'),  // Allows self-access
  async (req, res) => {
    // Student can access own data OR admin can access any
    const attendance = await getStudentAttendance(
      req.tenantClient!,
      req.tenant!.schema,
      req.params.studentId
    );
    res.json(attendance);
  }
);
```

## Troubleshooting

### Error: "Tenant context or user missing"

**Cause**: `ensureTenantContext()` called before `tenantResolver()`

**Fix**: Reorder middleware:
```typescript
router.use(
  authenticate,
  tenantResolver(),      // Must come before ensureTenantContext
  ensureTenantContext()
);
```

### Error: "Tenant database client not available"

**Cause**: `tenantResolver()` failed to create tenant client

**Possible reasons**:
- Invalid `x-tenant-id` header
- Tenant doesn't exist in database
- Database connection pool exhausted
- Schema doesn't exist

**Fix**: 
1. Verify tenant exists: `SELECT * FROM shared.tenants WHERE id = ?`
2. Verify schema exists: `SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?`
3. Check database connection pool

### Error: "Cannot read properties of undefined (reading 'schema')"

**Cause**: Accessing `req.tenant.schema` before tenant resolution

**Fix**: Ensure `tenantResolver()` and `ensureTenantContext()` are applied:
```typescript
router.use(
  authenticate,
  tenantResolver(),
  ensureTenantContext()  // Verifies req.tenant exists
);

// Now safe to use req.tenant.schema
router.get('/data', async (req, res) => {
  const data = await query(req.tenantClient!, req.tenant!.schema);
});
```

### Error: "User context missing" in permission check

**Cause**: `requirePermission()` called before `authenticate`

**Fix**: Reorder middleware:
```typescript
router.use(
  authenticate,           // Must come first
  requirePermission(...)  // Can come after
);
```

### Tenant Not Resolved for SuperAdmin

**Cause**: SuperAdmin has `tenantId: null`, so automatic resolution fails

**Fix**: SuperAdmin must provide `x-tenant-id` header:
```typescript
// Frontend/API call
fetch('/api/students', {
  headers: {
    'Authorization': 'Bearer <token>',
    'x-tenant-id': '<tenant-id>'  // Required for SuperAdmin
  }
});
```

## Best Practices

1. **Always use middleware in correct order**: `authenticate` → `tenantResolver()` → `ensureTenantContext()` → `requirePermission()`

2. **Use `ensureTenantContext()`**: Prevents 500 errors from missing tenant context

3. **Type safety**: Use TypeScript types for tenant context:
   ```typescript
   if (!req.tenant || !req.tenantClient) {
     return res.status(500).json({ message: 'Tenant context missing' });
   }
   // TypeScript now knows req.tenant and req.tenantClient are defined
   ```

4. **SuperAdmin handling**: Always check if tenant is required:
   ```typescript
   if (req.user?.role === 'superadmin' && !req.tenant) {
     // Platform-level operation
   } else if (!req.tenant) {
     return res.status(400).json({ message: 'Tenant required' });
   }
   ```

5. **Error handling**: Provide clear error messages:
   ```typescript
   if (!req.tenantClient) {
     return res.status(500).json({ 
       message: 'Tenant database connection unavailable' 
     });
   }
   ```

## Related Documentation

- [Authentication & Roles](./auth-and-roles.md) - User roles and permissions
- [Database Migrations](../backend/src/db/migrations/) - Schema setup
- [Tenant Manager](../backend/src/db/tenantManager.ts) - Tenant creation logic

