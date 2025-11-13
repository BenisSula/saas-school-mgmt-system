import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import tenantResolver from '../middleware/tenantResolver';
import { requirePermission } from '../middleware/rbac';
import { brandingSchema } from '../validators/brandingValidator';
import { getBranding, upsertBranding } from '../services/brandingService';

const router = Router();

router.use(authenticate, tenantResolver(), requirePermission('settings:branding'));

router.get('/', async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const branding = await getBranding(req.tenantClient!, req.tenant.schema);
    res.json(branding ?? {});
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  const parsed = brandingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.message });
  }

  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const branding = await upsertBranding(req.tenantClient!, req.tenant.schema, parsed.data);
    res.json(branding);
  } catch (error) {
    next(error);
  }
});

export default router;
