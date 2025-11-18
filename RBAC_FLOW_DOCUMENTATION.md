# RBAC Flow Documentation

## Overview

This document describes the complete RBAC (Role-Based Access Control) flow for the Sumano SaaS School Management System, specifically focusing on the SuperUser → Admin → School Management flow.

## Architecture

### User Hierarchy

```
SuperUser (superadmin)
    ↓ Creates
Admin (admin) - Assigned to Tenant/School
    ↓ Manages
Teachers, Students, HODs - Within Tenant
```

## Flow: SuperUser Creates Admin Account

### 1. SuperUser Creates School/Tenant

**Endpoint**: `POST /superuser/schools`

**Process**:
1. SuperUser provides school details (name, address, contact info, registration code)
2. Backend creates:
   - Tenant record in `shared.tenants` table
   - Tenant schema (isolated database schema)
   - School record in `shared.schools` table
   - Runs tenant migrations and seeds initial data

**Result**: Tenant/School is created with unique `tenant_id` and `schema_name`

### 2. SuperUser Creates Admin Account

**Endpoint**: `POST /superuser/schools/:id/admins`

**Request Payload**:
```typescript
{
  email: string;
  password: string;
  username: string;
  fullName: string;
  phone?: string;
}
```

**Backend Process** (`createAdminForSchool`):
1. Validates input (email, password, username, fullName required)
2. Checks for duplicate email/username
3. Verifies school exists for tenant
4. Creates user in `shared.users` with:
   - `role: 'admin'`
   - `tenant_id: <tenant_id>` (links admin to tenant)
   - `status: 'active'`
   - `is_verified: true`
   - Password hash (argon2)
5. Creates entry in `shared.user_roles` table
6. Records audit logs (shared and tenant)
7. Sends notification

**Response**:
```typescript
{
  id: string;
  email: string;
  role: 'admin';
  tenant_id: string;
  created_at: string;
  username: string | null;
  full_name: string | null;
}
```

**Key Points**:
- Admin is **immediately active** (no approval needed)
- Admin is **verified** (no email verification needed)
- Admin is **bound to tenant** via `tenant_id`

## Flow: Admin Logs In and Accesses Tenant

### 1. Admin Authentication

**Endpoint**: `POST /auth/login`

**Request**:
```typescript
{
  email: string;
  password: string;
}
```

**Backend Process** (`login`):
1. Finds user by email in `shared.users`
2. Verifies password hash
3. Checks user status (must be 'active')
4. Generates JWT access token with payload:
   ```typescript
   {
     userId: user.id,
     tenantId: user.tenant_id,  // ← Critical: tenant_id in token
     email: user.email,
     role: user.role
   }
   ```
5. Generates refresh token
6. Returns auth response with tokens

**Response**:
```typescript
{
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'admin';
    tenantId: string;  // ← Admin's tenant ID
    isVerified: true;
    status: 'active';
  }
}
```

### 2. Tenant Context Resolution

**Middleware**: `tenantResolver()`

**Process** (Updated to use JWT tenantId):
1. Checks if tenant context already exists
2. **Priority order for tenant resolution**:
   - **1st**: JWT token `tenantId` (from `req.user.tenantId`) ← **NEW: Uses JWT tenantId**
   - 2nd: `x-tenant-id` header
   - 3rd: Host header (subdomain)
3. For non-superadmin users:
   - If no tenant identifier found → 403 error
   - If tenant not found → 404 error
4. Connects to tenant schema:
   ```sql
   SET search_path TO <tenant_schema_name>, public
   ```
5. Sets `req.tenant` and `req.tenantClient`

**Key Fix**: Now uses `req.user.tenantId` from JWT token as **first priority**, ensuring admins automatically get their tenant context.

### 3. Admin Accesses Tenant-Scoped Endpoints

**Example**: `GET /teachers`

**Middleware Chain**:
```
authenticate → tenantResolver() → ensureTenantContext() → requirePermission('users:manage')
```

**Process**:
1. `authenticate`: Extracts JWT, sets `req.user` with `tenantId`
2. `tenantResolver()`: Uses `req.user.tenantId` to set tenant context
3. `ensureTenantContext()`: Verifies tenant context exists
4. `requirePermission()`: Checks admin has 'users:manage' permission
5. Route handler: Uses `req.tenantClient` (scoped to tenant schema)

**Result**: Admin only sees/manages data from their tenant's schema

## Data Isolation

### Tenant Isolation

- **Database Level**: Each tenant has isolated schema
- **Query Level**: All queries use `SET search_path TO <tenant_schema>`
- **API Level**: `tenantResolver()` ensures tenant context before data access

### Permission Isolation

- **SuperUser**: `requirePermission('tenants:manage')` → Platform-wide access
- **Admin**: `requirePermission('users:manage')` → Tenant-scoped access
- **Backend Enforces**: Permissions checked before data access

## Code Quality: DRY Principles Applied

### 1. Centralized User Creation

**Function**: `createUser()` in `userService.ts`

- Single source of truth for user creation
- Handles all user types (admin, teacher, student)
- Consistent field handling
- Used by:
  - `createAdminForSchool()` (superuser creates admin)
  - `adminCreateUser()` (admin creates student/teacher)
  - `signUp()` (self-registration)

### 2. Tenant Resolution Priority

**Updated `tenantResolver()`**:
- Uses JWT `tenantId` first (for authenticated users)
- Falls back to headers/host (for API clients)
- Consistent error messages
- Reusable across all tenant-scoped routes

### 3. Consistent Response Formats

- Admin creation returns standardized format
- All user operations use same data structures
- Type-safe interfaces throughout

## Security Verification

✅ **Admin Isolation**: Admins can only access their tenant's data
✅ **JWT Tenant Binding**: Admin's `tenantId` in JWT ensures correct tenant context
✅ **Automatic Tenant Resolution**: No manual tenant selection needed for admins
✅ **Permission Checks**: Backend enforces permissions at route level
✅ **Schema Isolation**: Database-level isolation via PostgreSQL schemas

## Frontend Integration

### SuperUser Creates Admin

```typescript
// SuperuserManageSchoolsPage.tsx
await api.superuser.createSchoolAdmin(schoolId, {
  email: 'admin@school.com',
  password: 'securePassword123',
  username: 'admin',
  fullName: 'School Administrator',
  phone: '+1234567890'
});
```

### Admin Logs In

```typescript
// Login flow automatically includes tenantId in JWT
const response = await api.login(email, password);
// response.user.tenantId is set
// All subsequent API calls use this tenantId via tenantResolver
```

### Admin Manages School

```typescript
// All admin operations are tenant-scoped automatically
await api.listTeachers();  // Only returns teachers from admin's tenant
await api.listStudents();  // Only returns students from admin's tenant
await api.listUsers();     // Only returns users from admin's tenant
```

## Summary

✅ **SuperUser creates admin** → Admin account created with `tenant_id`
✅ **Admin logs in** → JWT contains `tenantId`
✅ **Tenant resolver** → Uses JWT `tenantId` to set tenant context
✅ **Admin operations** → Automatically scoped to tenant
✅ **Code is DRY** → Centralized user creation, consistent patterns
✅ **Security enforced** → Backend middleware ensures proper isolation

The RBAC flow is **fully implemented and working correctly**.

