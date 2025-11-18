# RBAC Permissions Map

Complete documentation of Role-Based Access Control (RBAC) permissions in the SaaS School Management System.

## Table of Contents

- [Overview](#overview)
- [Roles](#roles)
- [Permissions](#permissions)
- [Role-Permission Matrix](#role-permission-matrix)
- [Permission Descriptions](#permission-descriptions)
- [Usage Examples](#usage-examples)

---

## Overview

The system uses a **Role-Based Access Control (RBAC)** model where:

- **Roles** define user types (student, teacher, admin, superadmin, hod)
- **Permissions** define specific actions (e.g., `users:manage`, `attendance:mark`)
- **Role-Permission Mapping** determines what each role can do
- **Middleware** enforces permissions on API routes
- **Frontend** uses permissions to show/hide UI elements

---

## Roles

### Student
Regular student users who can:
- View their own dashboard, attendance, results, and fees
- Receive messages and notifications
- Raise support tickets

### Teacher
Teachers who can:
- Manage assigned classes
- Mark attendance for their classes
- Enter and edit grades
- View class rosters
- Generate performance reports
- Send/receive messages

### HOD (Head of Department)
Department heads who can:
- View department-wide analytics
- View attendance and exam data
- Generate department reports
- Send messages to department members

### Admin
School administrators who can:
- Manage all users (students, teachers)
- Configure school settings
- Manage classes, subjects, and terms
- View all reports
- Manage fees and invoices
- Configure branding

### Superadmin
Platform administrators who can:
- Manage all tenants (schools)
- Create new schools
- View platform-wide analytics
- Manage all platform users
- Configure platform settings

---

## Permissions

### Permission Format

Permissions follow the pattern: `<resource>:<action>`

Examples:
- `users:manage` - Manage users
- `attendance:mark` - Mark attendance
- `exams:view` - View exams

---

## Role-Permission Matrix

| Permission | Student | Teacher | HOD | Admin | Superadmin |
|------------|---------|---------|-----|--------|------------|
| **Dashboard** |
| `dashboard:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Attendance** |
| `attendance:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `attendance:mark` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `attendance:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Exams** |
| `exams:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `exams:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Grades** |
| `grades:enter` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `grades:edit` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `grades:manage` | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Fees** |
| `fees:view` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `fees:view_self` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `fees:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Users** |
| `users:invite` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `users:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Tenants** |
| `tenants:manage` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Settings** |
| `settings:branding` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `settings:terms` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `settings:classes` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Students** |
| `students:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `students:view_own_class` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `students:view_self` | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Teachers** |
| `teachers:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **School** |
| `school:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Department** |
| `department-analytics` | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Reports** |
| `reports:view` | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Performance** |
| `performance:charts` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `performance:generate` | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Messages** |
| `messages:send` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `messages:receive` | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Profile** |
| `profile:view_self` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Support** |
| `support:raise` | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Permission Descriptions

### Dashboard Permissions

#### `dashboard:view`
- **Description:** View the dashboard page
- **Roles:** All roles
- **Usage:** Required to access any dashboard route

### Attendance Permissions

#### `attendance:view`
- **Description:** View attendance records
- **Roles:** All roles
- **Usage:** View own attendance (students) or class attendance (teachers/admins)

#### `attendance:mark`
- **Description:** Mark attendance for students
- **Roles:** Teacher, Admin, Superadmin
- **Usage:** Required to POST `/attendance/mark`
- **Additional:** Teachers can only mark for their assigned classes

#### `attendance:manage`
- **Description:** Full attendance management (view reports, edit records)
- **Roles:** Admin, Superadmin
- **Usage:** Required for attendance reports and bulk operations

### Exam Permissions

#### `exams:view`
- **Description:** View exam schedules and details
- **Roles:** All roles
- **Usage:** View exam information

#### `exams:manage`
- **Description:** Create, update, and delete exams
- **Roles:** Admin, Superadmin
- **Usage:** Required to POST/PUT/DELETE `/exams`

### Grade Permissions

#### `grades:enter`
- **Description:** Enter grades for students
- **Roles:** Teacher, Admin, Superadmin
- **Usage:** Required to POST `/grades/bulk`
- **Additional:** Teachers can only enter grades for their assigned classes

#### `grades:edit`
- **Description:** Edit existing grades
- **Roles:** Teacher, Admin, Superadmin
- **Usage:** Required to update grade entries

#### `grades:manage`
- **Description:** Full grade management (view all, edit any)
- **Roles:** HOD, Admin, Superadmin
- **Usage:** Required for grade reports and bulk operations

### Fee Permissions

#### `fees:view`
- **Description:** View fee information (all students)
- **Roles:** Admin, Superadmin
- **Usage:** View fee reports and outstanding balances

#### `fees:view_self`
- **Description:** View own fee information
- **Roles:** Student
- **Usage:** Students viewing their own invoices

#### `fees:manage`
- **Description:** Create invoices and manage payments
- **Roles:** Admin, Superadmin
- **Usage:** Required to POST `/invoices` and manage payments

### User Management Permissions

#### `users:invite`
- **Description:** Invite new users to the system
- **Roles:** Admin, Superadmin
- **Usage:** Send invitation emails

#### `users:manage`
- **Description:** Full user management (create, update, delete, approve/reject)
- **Roles:** Admin, Superadmin
- **Usage:** Required for all `/users` endpoints

### Tenant Management Permissions

#### `tenants:manage`
- **Description:** Manage tenants (schools) on the platform
- **Roles:** Superadmin only
- **Usage:** Required for all `/superuser` endpoints

### Settings Permissions

#### `settings:branding`
- **Description:** Configure tenant branding (logo, colors, theme)
- **Roles:** Admin, Superadmin
- **Usage:** Required to PUT `/configuration/branding`

#### `settings:terms`
- **Description:** Manage academic terms
- **Roles:** Admin, Superadmin
- **Usage:** Required for `/configuration/terms` endpoints

#### `settings:classes`
- **Description:** Manage classes and subjects
- **Roles:** Admin, Superadmin
- **Usage:** Required for `/configuration/classes` endpoints

### Student Permissions

#### `students:manage`
- **Description:** Full student management (CRUD operations)
- **Roles:** Admin, Superadmin
- **Usage:** Required for all `/students` endpoints

#### `students:view_own_class`
- **Description:** View students in assigned classes
- **Roles:** Teacher, Admin, Superadmin
- **Usage:** Teachers viewing their class rosters

#### `students:view_self`
- **Description:** View own student profile
- **Roles:** Student
- **Usage:** Students viewing their own information

### Teacher Permissions

#### `teachers:manage`
- **Description:** Full teacher management (CRUD operations)
- **Roles:** Admin, Superadmin
- **Usage:** Required for all `/teachers` endpoints

### School Permissions

#### `school:manage`
- **Description:** Manage school profile and settings
- **Roles:** Admin, Superadmin
- **Usage:** Required for `/school` endpoints

### Department Permissions

#### `department-analytics`
- **Description:** View department-wide analytics
- **Roles:** HOD only
- **Usage:** Required for department analytics reports

### Report Permissions

#### `reports:view`
- **Description:** View and generate reports
- **Roles:** HOD, Admin, Superadmin
- **Usage:** Required for `/reports` endpoints

### Performance Permissions

#### `performance:charts`
- **Description:** View performance charts and visualizations
- **Roles:** HOD only
- **Usage:** Department performance dashboards

#### `performance:generate`
- **Description:** Generate performance reports
- **Roles:** Teacher, Admin, Superadmin
- **Usage:** Create performance reports for classes

### Message Permissions

#### `messages:send`
- **Description:** Send messages to users
- **Roles:** Teacher, HOD, Admin, Superadmin
- **Usage:** Required to send messages

#### `messages:receive`
- **Description:** Receive messages
- **Roles:** Student, Teacher, Admin, Superadmin
- **Usage:** View received messages

### Profile Permissions

#### `profile:view_self`
- **Description:** View own profile
- **Roles:** All roles
- **Usage:** Access to profile page

### Support Permissions

#### `support:raise`
- **Description:** Raise support tickets
- **Roles:** Student only
- **Usage:** Submit support requests

---

## Usage Examples

### Backend: Checking Permissions

```typescript
// In route handler
import { requirePermission } from '../middleware/rbac';

router.post('/students', 
  authenticate,
  tenantResolver(),
  requirePermission('students:manage'), // Check permission
  async (req, res) => {
    // Handler code
  }
);
```

### Backend: Conditional Permission Check

```typescript
import { hasPermission } from '../config/permissions';

if (hasPermission(user.role, 'attendance:mark')) {
  // Allow marking attendance
}
```

### Frontend: Using Permissions Hook

```tsx
import { usePermission } from '../hooks/usePermission';

function AttendancePage() {
  const canMarkAttendance = usePermission('attendance:mark');
  const canViewReports = usePermission('attendance:manage');

  return (
    <div>
      {canMarkAttendance && (
        <button>Mark Attendance</button>
      )}
      {canViewReports && (
        <Link to="/reports">View Reports</Link>
      )}
    </div>
  );
}
```

### Frontend: Protected Route

```tsx
<ProtectedRoute
  requiredPermissions={['users:manage']}
  fallback={<Navigate to="/not-authorized" />}
>
  <UserManagementPage />
</ProtectedRoute>
```

### Frontend: Conditional Rendering

```tsx
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../lib/rbac';

function Sidebar() {
  const { user } = useAuth();
  
  return (
    <nav>
      {hasPermission(user?.role, 'users:manage') && (
        <Link to="/users">User Management</Link>
      )}
      {hasPermission(user?.role, 'reports:view') && (
        <Link to="/reports">Reports</Link>
      )}
    </nav>
  );
}
```

---

## Permission Enforcement Points

1. **API Routes:** Middleware checks permissions before route handlers
2. **Frontend Routes:** `ProtectedRoute` component checks permissions
3. **UI Elements:** Components check permissions before rendering
4. **Service Layer:** Services verify permissions for sensitive operations

---

## Adding New Permissions

### Step 1: Define Permission

Add to `backend/src/config/permissions.ts`:

```typescript
export type Permission =
  | 'existing:permission'
  | 'new:permission'; // Add new permission
```

### Step 2: Assign to Roles

```typescript
export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    // ... existing permissions
    'new:permission' // Add to appropriate roles
  ]
};
```

### Step 3: Use in Routes

```typescript
router.post('/new-endpoint',
  requirePermission('new:permission'),
  handler
);
```

### Step 4: Update Frontend

```tsx
// In component
const hasNewPermission = usePermission('new:permission');
```

---

## Best Practices

1. **Principle of Least Privilege:** Grant minimum permissions needed
2. **Explicit Permissions:** Use specific permissions, not broad ones
3. **Consistent Naming:** Follow `<resource>:<action>` pattern
4. **Document Changes:** Update this document when adding permissions
5. **Test Permissions:** Write tests for permission enforcement
6. **Audit Logging:** Log all permission checks for security audits

---

## Security Considerations

1. **Never trust client-side checks alone** - Always verify on backend
2. **Use middleware** - Centralize permission checking
3. **Log permission denials** - Track unauthorized access attempts
4. **Regular audits** - Review permission assignments periodically
5. **Role hierarchy** - Consider if roles should inherit permissions

