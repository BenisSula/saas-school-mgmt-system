export type Role = 'student' | 'teacher' | 'admin' | 'superadmin';

export type Permission =
  | 'dashboard:view'
  | 'attendance:manage'
  | 'attendance:view'
  | 'exams:manage'
  | 'exams:view'
  | 'fees:manage'
  | 'fees:view'
  | 'users:invite'
  | 'users:manage'
  | 'tenants:manage'
  | 'settings:branding';

export const rolePermissions: Record<Role, Permission[]> = {
  student: ['dashboard:view', 'attendance:view', 'exams:view', 'fees:view'],
  teacher: [
    'dashboard:view',
    'attendance:manage',
    'exams:manage',
    'fees:view'
  ],
  admin: [
    'dashboard:view',
    'attendance:manage',
    'exams:manage',
    'fees:manage',
    'users:invite',
    'users:manage',
    'settings:branding'
  ],
  superadmin: [
    'dashboard:view',
    'attendance:manage',
    'exams:manage',
    'fees:manage',
    'users:invite',
    'users:manage',
    'tenants:manage',
    'settings:branding'
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role] ?? [];
  return permissions.includes(permission);
}

