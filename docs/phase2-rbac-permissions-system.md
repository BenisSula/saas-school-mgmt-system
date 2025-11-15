# PHASE 2 — RBAC + Permissions System

## Sumano SaaS Platform - Complete RBAC Architecture

**Design Principles**: Extendable, Secure, Easy Integration, DRY, Multi-Tenant Isolation

---

## 📋 Table of Contents

1. [RBAC Overview](#rbac-overview)
2. [Permissions Schema](#permissions-schema)
3. [Role Definitions](#role-definitions)
4. [Backend RBAC Middleware](#backend-rbac-middleware)
5. [Frontend Route Guard Architecture](#frontend-route-guard-architecture)
6. [API → RBAC → Controller Pipeline](#api--rbac--controller-pipeline)
7. [Multi-Tenant Isolation](#multi-tenant-isolation)
8. [Integration Guide](#integration-guide)

---

## 🎯 RBAC Overview

### Core Concepts

**Role-Based Access Control (RBAC)** is implemented as a hierarchical permission system where:
- **Roles** define user types (superadmin, admin, teacher, hod, student)
- **Permissions** define specific actions (e.g., `users:manage`, `reports:view`)
- **Resources** define what can be accessed (e.g., users, tenants, reports)
- **Tenants** provide multi-tenant isolation

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Route Guards │  │ Permission   │  │ UI Guards    │  │
│  │              │  │ Hooks        │  │ Components   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ API Request
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Authenticate │  │ Tenant       │  │ RBAC          │  │
│  │ Middleware   │  │ Resolver     │  │ Middleware    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Validated Request
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Controller Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Business     │  │ Service      │  │ Database     │  │
│  │ Logic        │  │ Layer        │  │ Access       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Permissions Schema

### Permission Format

Permissions follow the pattern: `resource:action`

**Resources**:
- `dashboard` - Dashboard access
- `users` - User management
- `tenants` - Tenant/school management
- `teachers` - Teacher management
- `students` - Student management
- `classes` - Class management
- `subjects` - Subject management
- `attendance` - Attendance management
- `grades` - Grade management
- `exams` - Exam management
- `reports` - Report generation
- `invoices` - Invoice/billing management
- `settings` - System settings
- `messages` - Messaging system
- `support` - Support tickets

**Actions**:
- `view` - Read-only access
- `create` - Create new records
- `update` - Modify existing records
- `delete` - Remove records
- `manage` - Full CRUD access
- `invite` - Invite users
- `approve` - Approve pending items
- `reject` - Reject pending items
- `generate` - Generate reports/documents
- `send` - Send messages/notifications
- `receive` - Receive messages/notifications
- `raise` - Create support tickets

### Complete Permissions Map

```typescript
// Permission definitions structure
interface Permission {
  resource: string;
  action: string;
  description: string;
  scope?: 'tenant' | 'platform' | 'own'; // Access scope
}

// Example permission structure
const PERMISSIONS = {
  // Dashboard
  'dashboard:view': {
    resource: 'dashboard',
    action: 'view',
    description: 'View dashboard',
    scope: 'tenant'
  },
  
  // User Management
  'users:view': { ... },
  'users:create': { ... },
  'users:update': { ... },
  'users:delete': { ... },
  'users:manage': { ... }, // Full CRUD
  'users:invite': { ... },
  'users:approve': { ... },
  'users:reject': { ... },
  
  // Tenant Management
  'tenants:view': { ... },
  'tenants:create': { ... },
  'tenants:update': { ... },
  'tenants:delete': { ... },
  'tenants:manage': { ... },
  
  // Teacher Management
  'teachers:view': { ... },
  'teachers:create': { ... },
  'teachers:update': { ... },
  'teachers:delete': { ... },
  'teachers:manage': { ... },
  'teachers:assign-classes': { ... },
  
  // Student Management
  'students:view': { ... },
  'students:create': { ... },
  'students:update': { ... },
  'students:delete': { ... },
  'students:manage': { ... },
  'students:assign-class': { ... },
  
  // Class Management
  'classes:view': { ... },
  'classes:create': { ... },
  'classes:update': { ... },
  'classes:delete': { ... },
  'classes:manage': { ... },
  
  // Subject Management
  'subjects:view': { ... },
  'subjects:create': { ... },
  'subjects:update': { ... },
  'subjects:delete': { ... },
  'subjects:manage': { ... },
  
  // Attendance
  'attendance:view': { ... },
  'attendance:create': { ... },
  'attendance:update': { ... },
  'attendance:manage': { ... },
  
  // Grades
  'grades:view': { ... },
  'grades:create': { ... },
  'grades:update': { ... },
  'grades:delete': { ... },
  'grades:manage': { ... },
  
  // Exams
  'exams:view': { ... },
  'exams:create': { ... },
  'exams:update': { ... },
  'exams:delete': { ... },
  'exams:manage': { ... },
  
  // Reports
  'reports:view': { ... },
  'reports:generate': { ... },
  'reports:export': { ... },
  
  // Invoices
  'invoices:view': { ... },
  'invoices:create': { ... },
  'invoices:update': { ... },
  'invoices:manage': { ... },
  
  // Settings
  'settings:view': { ... },
  'settings:branding': { ... },
  'settings:terms': { ... },
  'settings:classes': { ... },
  'settings:school': { ... },
  
  // Messages
  'messages:view': { ... },
  'messages:send': { ... },
  'messages:receive': { ... },
  
  // Support
  'support:view': { ... },
  'support:raise': { ... },
  'support:manage': { ... },
  
  // Performance
  'performance:view': { ... },
  'performance:generate': { ... },
};
```

---

## 👥 Role Definitions

### Role Hierarchy

```
superadmin (Platform Level)
    │
    └── admin (Tenant Level)
            │
            ├── hod (Department Level)
            │       │
            │       └── teacher (Class Level)
            │
            └── teacher (Direct)
                    │
                    └── student (Read-only)
```

### Role Permission Maps

#### 1. SuperAdmin (superadmin)
**Scope**: Platform-wide (all tenants)

```typescript
const SUPERADMIN_PERMISSIONS = [
  // Dashboard
  'dashboard:view',
  
  // Tenant Management (Platform-wide)
  'tenants:manage',        // Create/manage all tenants
  'tenants:view',
  'tenants:create',
  'tenants:update',
  'tenants:delete',
  
  // User Management (Platform-wide)
  'users:manage',          // Manage all users across tenants
  'users:view',
  'users:create',
  'users:update',
  'users:delete',
  'users:invite',
  
  // Settings (Platform-wide)
  'settings:view',
  'settings:branding',
  'settings:terms',
  
  // Reports (Platform-wide)
  'reports:view',
  'reports:generate',
  'reports:export',
  
  // Performance (Platform-wide)
  'performance:view',
  'performance:generate',
  
  // Support
  'support:view',
  'support:raise',
  'support:manage',
];
```

#### 2. Admin
**Scope**: Tenant-specific (single school/organization)

```typescript
const ADMIN_PERMISSIONS = [
  // Dashboard
  'dashboard:view',
  
  // User Management (Tenant)
  'users:manage',          // Manage users within tenant
  'users:view',
  'users:create',
  'users:update',
  'users:delete',
  'users:invite',
  'users:approve',
  'users:reject',
  
  // Teacher Management
  'teachers:manage',
  'teachers:view',
  'teachers:create',
  'teachers:update',
  'teachers:delete',
  'teachers:assign-classes',
  
  // Student Management
  'students:manage',
  'students:view',
  'students:create',
  'students:update',
  'students:delete',
  'students:assign-class',
  
  // HOD Management
  'users:manage',          // Can manage HODs (via users)
  
  // Class Management
  'classes:manage',
  'classes:view',
  'classes:create',
  'classes:update',
  'classes:delete',
  
  // Subject Management
  'subjects:manage',
  'subjects:view',
  'subjects:create',
  'subjects:update',
  'subjects:delete',
  
  // Attendance
  'attendance:view',
  'attendance:manage',
  
  // Grades
  'grades:view',
  'grades:manage',
  
  // Exams
  'exams:view',
  'exams:manage',
  
  // Reports (Tenant)
  'reports:view',
  'reports:generate',
  'reports:export',
  
  // Invoices
  'invoices:manage',
  'invoices:view',
  'invoices:create',
  'invoices:update',
  
  // Settings (Tenant)
  'settings:view',
  'settings:branding',
  'settings:terms',
  'settings:classes',
  'settings:school',
  
  // Messages
  'messages:view',
  'messages:send',
  'messages:receive',
  
  // Performance
  'performance:view',
  'performance:generate',
  
  // Support
  'support:view',
  'support:raise',
];
```

#### 3. HOD (Head of Department)
**Scope**: Department-specific within tenant

```typescript
const HOD_PERMISSIONS = [
  // Dashboard
  'dashboard:view',
  
  // Teacher Management (Department)
  'teachers:view',         // View teachers in department
  'teachers:update',       // Update department teachers
  'teachers:assign-classes', // Assign classes to department teachers
  
  // Student Management (Department)
  'students:view',         // View students in department classes
  
  // Class Management (Department)
  'classes:view',          // View department classes
  
  // Subject Management (Department)
  'subjects:view',        // View department subjects
  
  // Attendance (Department)
  'attendance:view',      // View department attendance
  
  // Grades (Department)
  'grades:view',          // View department grades
  
  // Exams (Department)
  'exams:view',           // View department exams
  
  // Reports (Department)
  'reports:view',
  'reports:generate',     // Department reports
  
  // Messages
  'messages:view',
  'messages:send',
  'messages:receive',
  
  // Performance (Department)
  'performance:view',
  'performance:generate',
];
```

#### 4. Teacher
**Scope**: Assigned classes only

```typescript
const TEACHER_PERMISSIONS = [
  // Dashboard
  'dashboard:view',
  
  // Student Management (Assigned Classes)
  'students:view',        // View students in assigned classes
  
  // Class Management (Assigned)
  'classes:view',          // View assigned classes
  
  // Subject Management (Assigned)
  'subjects:view',         // View assigned subjects
  
  // Attendance (Assigned Classes)
  'attendance:view',
  'attendance:create',
  'attendance:update',
  'attendance:manage',
  
  // Grades (Assigned Classes)
  'grades:view',
  'grades:create',
  'grades:update',
  'grades:manage',
  
  // Exams (Assigned Classes)
  'exams:view',
  'exams:create',
  'exams:update',
  
  // Reports (Assigned Classes)
  'reports:view',
  'reports:generate',
  
  // Messages
  'messages:view',
  'messages:send',
  'messages:receive',
  
  // Performance (Assigned Classes)
  'performance:view',
  'performance:generate',
];
```

#### 5. Student
**Scope**: Own data only

```typescript
const STUDENT_PERMISSIONS = [
  // Dashboard
  'dashboard:view',
  
  // Own Profile
  'students:view',        // View own profile only
  
  // Own Class
  'classes:view',          // View own class
  
  // Own Subjects
  'subjects:view',         // View own subjects
  
  // Own Attendance
  'attendance:view',       // View own attendance
  
  // Own Grades
  'grades:view',           // View own grades
  
  // Own Exams
  'exams:view',            // View own exams
  
  // Own Reports
  'reports:view',          // View own reports
  
  // Own Invoices
  'invoices:view',         // View own invoices
  
  // Messages
  'messages:view',
  'messages:send',
  'messages:receive',
  
  // Support
  'support:view',
  'support:raise',
];
```

---

## 🛡️ Backend RBAC Middleware

### Middleware Architecture

```
Request Flow:
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ authenticate()      │ ← Verify JWT token
│ - Extract token     │
│ - Validate token    │
│ - Attach user to req│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ tenantResolver()    │ ← Resolve tenant context
│ - Extract tenant    │
│ - Validate tenant   │
│ - Attach tenant     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ ensureTenantContext │ ← Ensure tenant context exists
│ - Check tenant      │
│ - Set tenant client │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ requirePermission() │ ← RBAC check
│ - Check role        │
│ - Check permission  │
│ - Check scope       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Controller          │ ← Business logic
└─────────────────────┘
```

### Middleware Components

#### 1. Authentication Middleware (`authenticate.ts`)

**Purpose**: Verify JWT token and attach user to request

**Location**: `backend/src/middleware/authenticate.ts`

**Functionality**:
- Extract JWT token from Authorization header
- Verify token signature and expiration
- Decode user information (id, role, tenantId)
- Attach user object to `req.user`
- Handle token refresh if needed

**Output**:
```typescript
req.user = {
  id: string;
  email: string;
  role: Role;
  tenantId?: string;
  status: UserStatus;
}
```

#### 2. Tenant Resolver Middleware (`tenantResolver.ts`)

**Purpose**: Resolve and validate tenant context

**Location**: `backend/src/middleware/tenantResolver.ts`

**Functionality**:
- Extract tenant identifier (from header, query, or user context)
- Validate tenant exists and is active
- Attach tenant object to `req.tenant`
- Handle tenant-specific database connection

**Output**:
```typescript
req.tenant = {
  id: string;
  name: string;
  schema: string;
  status: TenantStatus;
}
```

#### 3. Tenant Context Middleware (`ensureTenantContext.ts`)

**Purpose**: Ensure tenant database context is set

**Location**: `backend/src/middleware/ensureTenantContext.ts`

**Functionality**:
- Verify tenant context exists
- Set tenant-specific database client
- Handle schema-per-tenant isolation
- Attach tenant client to `req.tenantClient`

**Output**:
```typescript
req.tenantClient = PoolClient; // Tenant-specific database client
```

#### 4. RBAC Middleware (`requirePermission.ts`)

**Purpose**: Check role and permission authorization

**Location**: `backend/src/middleware/rbac.ts`

**Functionality**:
- Check user role against required permission
- Verify permission exists in role's permission set
- Check scope (tenant, platform, own)
- Handle resource-specific checks (e.g., teacher assignment)
- Throw 403 Forbidden if unauthorized

**Usage**:
```typescript
// Single permission
router.get('/users', requirePermission('users:view'), controller);

// Multiple permissions (OR)
router.post('/users', requireAnyPermission(['users:create', 'users:invite']), controller);

// All permissions (AND)
router.delete('/users/:id', requireAllPermissions(['users:delete', 'users:manage']), controller);
```

**Implementation Structure**:
```typescript
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Get user from req.user (set by authenticate)
    // 2. Get user role
    // 3. Check if role has permission
    // 4. Check scope (tenant/platform/own)
    // 5. Check resource-specific access (e.g., teacher assignment)
    // 6. Call next() if authorized, else return 403
  };
}
```

#### 5. Resource-Specific Middleware (`verifyTeacherAssignment.ts`)

**Purpose**: Verify teacher has access to specific resource

**Location**: `backend/src/middleware/verifyTeacherAssignment.ts`

**Functionality**:
- Check if teacher is assigned to specific class
- Verify teacher can access student in their class
- Handle HOD department-level access
- Used for teacher-specific routes

**Usage**:
```typescript
router.get('/classes/:classId/students', 
  requirePermission('students:view'),
  verifyTeacherAssignment('classId'),
  controller
);
```

---

## 🎨 Frontend Route Guard Architecture

### Route Guard Components

#### 1. Protected Route Component

**Location**: `frontend/src/components/layout/ProtectedRoute.tsx`

**Purpose**: Protect routes based on authentication and permissions

**Functionality**:
- Check if user is authenticated
- Check if user has required permission
- Check if user belongs to required tenant
- Redirect to login if not authenticated
- Redirect to unauthorized page if no permission
- Render children if authorized

**Usage**:
```typescript
<Route
  path="/admin/teachers"
  element={
    <ProtectedRoute
      requireAuth={true}
      requirePermission="teachers:view"
      requireRole={['admin']}
    >
      <TeachersManagementPage />
    </ProtectedRoute>
  }
/>
```

#### 2. Permission Hook

**Location**: `frontend/src/lib/rbac/usePermission.ts`

**Purpose**: Check permissions in components

**Functionality**:
- Check if user has specific permission
- Check if user has any of multiple permissions
- Check if user has all of multiple permissions
- Return boolean for conditional rendering

**Usage**:
```typescript
const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

if (hasPermission('users:create')) {
  // Show create button
}
```

#### 3. Role Hook

**Location**: `frontend/src/lib/rbac/useRole.ts`

**Purpose**: Check user role

**Functionality**:
- Check if user has specific role
- Check if user has any of multiple roles
- Return current user role

**Usage**:
```typescript
const { hasRole, hasAnyRole, currentRole } = useRole();

if (hasRole('admin')) {
  // Show admin features
}
```

#### 4. Permission-Based UI Components

**Location**: `frontend/src/components/shared/PermissionGuard.tsx`

**Purpose**: Conditionally render UI based on permissions

**Functionality**:
- Render children only if permission check passes
- Show fallback UI if no permission
- Support multiple permission checks

**Usage**:
```typescript
<PermissionGuard permission="users:create" fallback={<></>}>
  <Button>Create User</Button>
</PermissionGuard>
```

### Route Configuration

**Location**: `frontend/src/app/AppRoutes.tsx`

**Route Structure**:
```typescript
// Public routes
<Route path="/auth/login" element={<Login />} />
<Route path="/auth/register" element={<Register />} />

// Protected routes with RBAC
<Route path="/dashboard" element={
  <ProtectedRoute requireAuth={true}>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoute>
}>
  {/* SuperUser routes */}
  <Route path="superuser/overview" element={
    <ProtectedRoute requireRole={['superadmin']}>
      <SuperuserOverviewPage />
    </ProtectedRoute>
  } />
  
  {/* Admin routes */}
  <Route path="admin/teachers" element={
    <ProtectedRoute 
      requireRole={['admin']}
      requirePermission="teachers:view"
    >
      <TeachersManagementPage />
    </ProtectedRoute>
  } />
  
  {/* Teacher routes */}
  <Route path="teacher/attendance" element={
    <ProtectedRoute 
      requireRole={['teacher']}
      requirePermission="attendance:manage"
    >
      <TeacherAttendancePage />
    </ProtectedRoute>
  } />
  
  {/* Student routes */}
  <Route path="student/dashboard" element={
    <ProtectedRoute 
      requireRole={['student']}
      requirePermission="dashboard:view"
    >
      <StudentDashboardPage />
    </ProtectedRoute>
  } />
</Route>
```

---

## 🔄 API → RBAC → Controller Pipeline

### Complete Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client Request                                           │
│    GET /api/teachers                                         │
│    Headers: { Authorization: "Bearer <token>" }            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Express Router                                           │
│    router.get('/teachers', ...)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Authentication Middleware                                │
│    authenticate()                                           │
│    - Extract JWT token                                      │
│    - Verify token signature                                 │
│    - Decode user info                                       │
│    - Attach: req.user = { id, role, tenantId }             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Tenant Resolver Middleware                               │
│    tenantResolver()                                         │
│    - Extract tenant from header/query/user                  │
│    - Validate tenant exists                                │
│    - Attach: req.tenant = { id, name, schema }            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Tenant Context Middleware                                │
│    ensureTenantContext()                                    │
│    - Verify tenant context                                 │
│    - Set tenant database client                             │
│    - Attach: req.tenantClient = PoolClient                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. RBAC Middleware                                          │
│    requirePermission('teachers:view')                       │
│    - Get user role from req.user                           │
│    - Check role permissions                                │
│    - Verify 'teachers:view' in permissions                 │
│    - Check scope (tenant/platform/own)                     │
│    - If authorized: next()                                 │
│    - If unauthorized: return 403                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Resource-Specific Middleware (Optional)                 │
│    verifyTeacherAssignment()                               │
│    - Check teacher assignment to class                      │
│    - Verify resource access                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Controller                                               │
│    teacherController.listTeachers()                        │
│    - Use req.tenantClient for database queries             │
│    - Apply tenant isolation                                │
│    - Return filtered results                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Response                                                 │
│    { status: 200, data: [...] }                            │
└─────────────────────────────────────────────────────────────┘
```

### Example Route Definition

```typescript
// backend/src/routes/teachers.ts

router.get(
  '/',
  authenticate,                    // Step 1: Authenticate
  tenantResolver(),                // Step 2: Resolve tenant
  ensureTenantContext(),           // Step 3: Set tenant context
  requirePermission('teachers:view'), // Step 4: RBAC check
  teacherController.listTeachers   // Step 5: Controller
);

router.post(
  '/',
  authenticate,
  tenantResolver(),
  ensureTenantContext(),
  requirePermission('teachers:create'),
  validateRequest(teacherSchema),
  teacherController.createTeacher
);

router.get(
  '/:id',
  authenticate,
  tenantResolver(),
  ensureTenantContext(),
  requirePermission('teachers:view'),
  verifyTeacherAssignment('id'),   // Step 4.5: Resource-specific check
  teacherController.getTeacher
);
```

---

## 🏢 Multi-Tenant Isolation

### Isolation Strategy

**Schema-Per-Tenant**: Each tenant has its own database schema

### Isolation Points

#### 1. Database Level
- Each tenant has separate schema: `tenant_<id>`
- All queries scoped to tenant schema
- Tenant client (`req.tenantClient`) automatically uses correct schema

#### 2. Middleware Level
- `tenantResolver()` ensures tenant context
- `ensureTenantContext()` sets tenant database client
- All subsequent queries use tenant client

#### 3. Service Level
- Services receive `tenantClient` parameter
- All database operations use tenant client
- No cross-tenant data access possible

#### 4. RBAC Level
- Permissions scoped to tenant (except superadmin)
- Role checks include tenant validation
- Resource access verified against tenant

### Tenant Isolation Flow

```
User Request
    │
    ▼
Authenticate → Extract user.tenantId
    │
    ▼
Resolve Tenant → Validate tenant exists and active
    │
    ▼
Set Tenant Context → Create tenant-specific DB client
    │
    ▼
RBAC Check → Verify permission within tenant scope
    │
    ▼
Controller → Use tenant client (automatic isolation)
    │
    ▼
Database Query → Executed in tenant schema only
```

### SuperAdmin Exception

- SuperAdmin has `platform` scope
- Can access all tenants
- Uses main database pool (not tenant client)
- Special routes for platform-wide operations

---

## 🔌 Integration Guide

### Backend Integration

#### Step 1: Define Permissions
```typescript
// backend/src/config/permissions.ts
export const PERMISSIONS = {
  'teachers:view': { ... },
  'teachers:create': { ... },
  // ... more permissions
};
```

#### Step 2: Define Role Permissions
```typescript
// backend/src/config/roles.ts
export const ROLE_PERMISSIONS = {
  admin: ['teachers:view', 'teachers:create', ...],
  teacher: ['teachers:view', ...],
  // ... more roles
};
```

#### Step 3: Apply Middleware to Routes
```typescript
// backend/src/routes/teachers.ts
router.get(
  '/',
  authenticate,
  tenantResolver(),
  ensureTenantContext(),
  requirePermission('teachers:view'),
  controller
);
```

### Frontend Integration

#### Step 1: Configure Route Guards
```typescript
// frontend/src/app/AppRoutes.tsx
<Route
  path="/admin/teachers"
  element={
    <ProtectedRoute
      requireAuth={true}
      requireRole={['admin']}
      requirePermission="teachers:view"
    >
      <TeachersManagementPage />
    </ProtectedRoute>
  }
/>
```

#### Step 2: Use Permission Hooks
```typescript
// frontend/src/pages/admin/TeachersManagementPage.tsx
const { hasPermission } = usePermission();

{hasPermission('teachers:create') && (
  <Button onClick={handleCreate}>Create Teacher</Button>
)}
```

#### Step 3: Use Permission Guards
```typescript
// frontend/src/components/admin/TeacherActions.tsx
<PermissionGuard permission="teachers:delete">
  <Button onClick={handleDelete}>Delete</Button>
</PermissionGuard>
```

---

## 🔒 Security Considerations

### 1. Token Security
- JWT tokens stored in httpOnly cookies (recommended) or secure storage
- Token expiration and refresh mechanism
- Token revocation on logout

### 2. Permission Validation
- Always validate on backend (never trust frontend)
- Check permissions at route level
- Verify resource access at service level

### 3. Tenant Isolation
- Never allow cross-tenant data access
- Validate tenant context in every request
- Use tenant-specific database clients

### 4. Role Escalation Prevention
- Users cannot modify their own role
- Role changes require higher-level permission
- Audit log all role changes

### 5. Resource Access Control
- Verify resource ownership/assignment
- Check teacher-class assignments
- Validate student-class assignments
- HOD department boundaries

---

## 📈 Extensibility

### Adding New Permissions

1. **Define Permission**:
```typescript
// backend/src/config/permissions.ts
'new-resource:new-action': {
  resource: 'new-resource',
  action: 'new-action',
  description: 'Description',
  scope: 'tenant'
}
```

2. **Assign to Roles**:
```typescript
// backend/src/config/roles.ts
admin: [..., 'new-resource:new-action']
```

3. **Use in Routes**:
```typescript
router.get('/new-resource', requirePermission('new-resource:new-action'), ...)
```

### Adding New Roles

1. **Define Role**:
```typescript
// backend/src/config/roles.ts
export const NEW_ROLE_PERMISSIONS = [...];
```

2. **Update Type Definitions**:
```typescript
// shared/types/rbac.types.ts
export type Role = 'superadmin' | 'admin' | 'teacher' | 'hod' | 'student' | 'new-role';
```

3. **Add Route Guards**:
```typescript
<ProtectedRoute requireRole={['new-role']}>...</ProtectedRoute>
```

---

## 📝 Summary

### Key Components

1. **Permissions Schema**: Resource:Action format with scope
2. **Role Definitions**: 5 roles with hierarchical permissions
3. **Backend Middleware**: 4-layer middleware chain (auth → tenant → context → RBAC)
4. **Frontend Guards**: Route guards, permission hooks, UI guards
5. **API Pipeline**: Complete request flow with RBAC validation
6. **Multi-Tenant Isolation**: Schema-per-tenant with automatic scoping

### Design Principles Achieved

✅ **Extendable**: Easy to add permissions and roles
✅ **Secure**: Multi-layer validation, tenant isolation
✅ **Easy Integration**: Simple hooks and components
✅ **DRY**: Centralized permission definitions
✅ **Type-Safe**: TypeScript throughout

---

**Next Steps**: Implement the RBAC system following this architecture.

