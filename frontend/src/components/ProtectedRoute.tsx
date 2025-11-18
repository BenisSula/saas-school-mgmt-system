import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role, Permission } from '../config/permissions';
import { hasPermission } from '../config/permissions';

export interface ProtectedRouteProps {
  allowedRoles?: Role[];
  allowedPermissions?: Permission[];
  requireAllPermissions?: boolean; // If true, requires ALL permissions; if false, requires ANY permission
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ProtectedRoute({
  allowedRoles,
  allowedPermissions,
  requireAllPermissions = false,
  fallback,
  loadingFallback,
  children
}: ProtectedRouteProps) {
  const { isLoading, user } = useAuth();

  // Calculate required permissions based on user role and permission list
  const hasRequiredPermissions = React.useMemo(() => {
    if (!allowedPermissions || allowedPermissions.length === 0) {
      return true; // No permission requirements
    }

    if (!user || !user.role) {
      return false;
    }

    const role = user.role as Role;

    if (requireAllPermissions) {
      // User must have ALL specified permissions
      return allowedPermissions.every((perm) => hasPermission(role, perm));
    } else {
      // User must have ANY of the specified permissions
      return allowedPermissions.some((perm) => hasPermission(role, perm));
    }
  }, [allowedPermissions, requireAllPermissions, user]);

  if (isLoading) {
    return (
      loadingFallback ?? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-[var(--brand-muted)]">
          Checking permissions…
        </div>
      )
    );
  }

  const defaultSignInPrompt = (
    <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/80 p-6 text-center text-sm text-[var(--brand-muted)]">
      Please sign in to view this page.
    </div>
  );

  const defaultAccessDeniedPrompt = (
    <div
      className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200"
      role="alert"
      aria-live="assertive"
    >
      You do not have permission to view this page.
    </div>
  );

  if (!user) {
    return fallback ?? defaultSignInPrompt;
  }

  if (user.status !== 'active') {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-amber-200">
        Your account is pending admin approval. Please contact your administrator for access.
      </div>
    );
  }

  const accessDeniedContent = fallback ?? defaultAccessDeniedPrompt;

  // Check role-based access first
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return accessDeniedContent;
  }

  // Check permission-based access (only if roles check passed or no roles specified)
  // If both roles and permissions are specified, user must pass both checks
  if (allowedPermissions && !hasRequiredPermissions) {
    return accessDeniedContent;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
