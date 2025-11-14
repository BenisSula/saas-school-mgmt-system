import { Request, Response, NextFunction } from 'express';
import { FRIENDLY_TENANT_CONTEXT_ERROR } from '../lib/friendlyMessages';

/**
 * Middleware to ensure tenant context is available on the request.
 * This should be used after tenantResolver() middleware.
 *
 * Usage:
 * router.use(authenticate, tenantResolver(), ensureTenantContext(), requirePermission('...'));
 */
export function ensureTenantContext() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Superadmin might not have tenant context in some cases
    if (req.user?.role === 'superadmin' && (!req.tenantClient || !req.tenant)) {
      // Allow superadmin to proceed without tenant context (they can access all tenants)
      return next();
    }
    
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: FRIENDLY_TENANT_CONTEXT_ERROR });
    }
    return next();
  };
}

export default ensureTenantContext;
