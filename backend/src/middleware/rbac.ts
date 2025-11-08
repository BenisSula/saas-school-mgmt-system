import { Request, Response, NextFunction } from 'express';
import { Permission, Role, hasPermission } from '../config/permissions';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
    tenantId: string;
    email: string;
    tokenId: string;
  };
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !hasPermission(role, permission)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

export default requireRole;


