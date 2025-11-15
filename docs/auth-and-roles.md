# Authentication, Roles, and User Status

This document covers the authentication system, user roles, default statuses, and user creation flows in the SaaS School Management System.

## Table of Contents

- [User Roles](#user-roles)
- [User Status](#user-status)
- [User Creation Flows](#user-creation-flows)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Status Management](#status-management)

## User Roles

The system supports five user roles, each with specific permissions and responsibilities:

### 1. SuperAdmin
- **Scope**: Platform-wide
- **Tenant**: None (platform-level access)
- **Default Status**: `active`
- **Permissions**: Full platform management, tenant creation, audit log access
- **Creation**: Created manually or via platform initialization

### 2. Admin
- **Scope**: Tenant-specific
- **Tenant**: Required
- **Default Status**: 
  - `active` if created by SuperAdmin
  - `pending` if self-registered (requires SuperAdmin approval)
- **Permissions**: Tenant management, user management, school configuration, reports
- **Creation**: 
  - By SuperAdmin via tenant creation
  - Self-registration with tenant name (creates tenant)

### 3. HOD (Head of Department)
- **Scope**: Tenant-specific, department-level
- **Tenant**: Required
- **Default Status**: `pending` (requires Admin approval)
- **Permissions**: Department analytics, reports, teacher oversight
- **Creation**: By Admin via user management

### 4. Teacher
- **Scope**: Tenant-specific, class/subject assignments
- **Tenant**: Required
- **Default Status**: `pending` (requires Admin approval)
- **Permissions**: 
  - Attendance management for assigned classes
  - Grade entry and editing
  - Class roster viewing
  - Student communication
- **Creation**: By Admin via user management or self-registration

### 5. Student
- **Scope**: Tenant-specific, personal data only
- **Tenant**: Required
- **Default Status**: `pending` (requires Admin approval)
- **Permissions**: 
  - View own attendance, grades, fees
  - Access personal dashboard
  - Receive messages
- **Creation**: By Admin via user management or self-registration

## User Status

All users have a `status` field that controls their access to the system:

| Status | Description | Access Level |
|--------|-------------|--------------|
| `pending` | User created but not yet approved | Limited/No access |
| `active` | User approved and can access system | Full access per role |
| `suspended` | User temporarily disabled | No access |
| `rejected` | User registration rejected | No access |

### Default Status by Role

- **SuperAdmin**: Always `active` (cannot be pending)
- **Admin** (created by SuperAdmin): `active`
- **Admin** (self-registered): `pending` (requires SuperAdmin approval)
- **HOD, Teacher, Student**: `pending` (requires Admin approval)

### Status Transitions

```
pending → active (via Admin approval)
active → suspended (via Admin action)
suspended → active (via Admin reactivation)
pending → rejected (via Admin rejection)
```

## User Creation Flows

### Flow 1: SuperAdmin Creates Tenant + Admin

1. SuperAdmin calls `POST /tenants` with tenant details
2. System creates tenant schema and seed data
3. SuperAdmin creates admin user (via signup or user management)
4. Admin status is set to `active` automatically
5. Admin can immediately access tenant dashboard

**API Example:**
```typescript
// Create tenant
POST /tenants
{
  "name": "Acme Academy",
  "domain": "acme.local"
}

// Create admin (status: active)
POST /auth/signup
{
  "email": "admin@acme.local",
  "password": "SecurePass123!",
  "role": "admin",
  "tenantId": "<tenant-id>"
}
```

### Flow 2: Admin Self-Registration

1. User calls `POST /auth/signup` with `role: 'admin'` and `tenantName`
2. System creates tenant schema if tenant doesn't exist
3. Admin user is created with status `pending`
4. SuperAdmin must approve via `PATCH /users/:userId/approve`
5. Once approved, admin status becomes `active`

**API Example:**
```typescript
// Self-register as admin (creates tenant)
POST /auth/signup
{
  "email": "newadmin@school.com",
  "password": "SecurePass123!",
  "role": "admin",
  "tenantName": "New School"
}
// Response: status: 'pending'

// SuperAdmin approves
PATCH /users/:userId/approve
// Response: status: 'active'
```

### Flow 3: Admin Creates HOD/Teacher/Student

1. Admin calls `POST /auth/signup` with user details
2. User is created with status `pending`
3. Admin approves via `PATCH /users/:userId/approve`
4. User status becomes `active`
5. User can now login and access system

**API Example:**
```typescript
// Create teacher
POST /auth/signup
{
  "email": "teacher@school.com",
  "password": "SecurePass123!",
  "role": "teacher",
  "tenantId": "<tenant-id>"
}
// Response: status: 'pending'

// Admin approves
PATCH /users/:userId/approve
// Response: status: 'active'
```

### Flow 4: User Self-Registration (Teacher/Student)

1. User calls `POST /auth/signup` with role and tenantId
2. User is created with status `pending`
3. User cannot login until approved
4. Admin receives notification (if configured)
5. Admin approves via `PATCH /users/:userId/approve`
6. User can now login

## Authentication Flow

### Login Process

1. User submits credentials via `POST /auth/login`
2. System validates credentials
3. System checks user status:
   - If `pending`: Returns error "Account pending admin approval"
   - If `suspended`: Returns error "Account suspended"
   - If `rejected`: Returns error "Account rejected"
   - If `active`: Proceeds to token generation
4. System generates JWT access and refresh tokens
5. Response includes user object with `status` field

**API Example:**
```typescript
POST /auth/login
{
  "email": "user@school.com",
  "password": "SecurePass123!"
}

// Response (if active):
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": "900s",
  "user": {
    "id": "...",
    "email": "user@school.com",
    "role": "teacher",
    "tenantId": "...",
    "isVerified": true,
    "status": "active"
  }
}
```

### Token Refresh

1. User calls `POST /auth/refresh` with refresh token
2. System validates refresh token
3. System checks user status (same as login)
4. New tokens generated if status is `active`
5. Response includes updated user object with `status`

## Role-Based Access Control (RBAC)

### Permission System

The system uses a permission-based RBAC model:

- **Permissions**: Granular actions (e.g., `attendance:manage`, `users:manage`)
- **Role Permissions**: Each role has a set of permissions
- **Middleware**: `requirePermission()` enforces permissions at route level
- **Service Layer**: Additional checks provide defense-in-depth

### Permission Examples

| Permission | Description | Roles |
|------------|-------------|-------|
| `attendance:manage` | Full attendance management | Admin, SuperAdmin |
| `attendance:mark` | Mark attendance for assigned classes | Teacher |
| `attendance:view` | View attendance records | Student, Teacher, HOD, Admin |
| `users:manage` | Manage tenant users | Admin, SuperAdmin |
| `tenants:manage` | Manage tenants | SuperAdmin only |
| `grades:enter` | Enter grades | Teacher |
| `grades:manage` | Full grade management | Admin, HOD |

### Using Permissions in Routes

```typescript
import { requirePermission } from '../middleware/rbac';

router.post(
  '/attendance/mark',
  requirePermission('attendance:mark'), // Teacher can mark
  async (req, res) => {
    // Route handler
  }
);

router.get(
  '/users',
  requirePermission('users:manage'), // Admin only
  async (req, res) => {
    // Route handler
  }
);
```

## Status Management

### Checking User Status

The `status` field is included in:
- `AuthResponse` (login, signup, refresh)
- User list endpoints
- User detail endpoints

### Updating User Status

**Approve User:**
```typescript
PATCH /users/:userId/approve
// Sets status to 'active'
```

**Reject User:**
```typescript
PATCH /users/:userId/reject
// Sets status to 'rejected'
```

**Suspend User:**
```typescript
PATCH /users/:userId
{
  "status": "suspended"
}
```

### Status Validation

- Frontend: `userUtils.ts` provides `normalizeUser()`, `ensureActive()`, `isActive()`
- Backend: Services check status before allowing operations
- Middleware: Can enforce status checks if needed

## Best Practices

1. **Always check status**: Don't assume users are active
2. **Default to pending**: New users should start as `pending` unless explicitly created by admin
3. **Explicit approval**: Use approval endpoints rather than direct status updates
4. **Status in responses**: Always include `status` in auth responses
5. **Frontend handling**: Use `normalizeUser()` to ensure status is always defined

## Migration Notes

When migrating existing systems:

1. Run migration `008_users_status.sql` to add status column
2. Run migration `010_backfill_user_status.sql` to set default statuses
3. Verify all users have non-null status
4. Update application code to handle status field
5. Test approval workflows

## Related Documentation

- [Tenant Context](./tenant-context.md) - Middleware ordering and tenant resolution
- [API Documentation](../backend/openapi.yaml) - Full API specification
- [Permissions Configuration](../backend/src/config/permissions.ts) - Permission definitions

