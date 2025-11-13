import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import tenantResolver from '../middleware/tenantResolver';
import { requirePermission } from '../middleware/rbac';
import { listTenantUsers, updateTenantUserRole } from '../services/userService';
import { roleUpdateSchema } from '../validators/userValidator';

const router = Router();

router.use(authenticate, tenantResolver());

router.get('/', requirePermission('users:manage'), async (req, res, next) => {
  try {
    if (!req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const users = await listTenantUsers(req.tenant.id);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.patch('/:userId/role', requirePermission('users:manage'), async (req, res, next) => {
  try {
    if (!req.tenant || !req.user) {
      return res.status(500).json({ message: 'Tenant context or user missing' });
    }

    const parsed = roleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }

    const updated = await updateTenantUserRole(
      req.tenant.id,
      req.params.userId,
      parsed.data.role,
      req.user.id
    );

    if (!updated) {
      return res.status(404).json({ message: 'User not found for tenant' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
