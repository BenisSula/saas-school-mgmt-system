import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import tenantResolver from '../middleware/tenantResolver';
import { requirePermission } from '../middleware/rbac';
import { brandingSchema } from '../validators/brandingValidator';
import { academicTermSchema, classSchema } from '../validators/termValidator';
import { getBranding, upsertBranding } from '../services/brandingService';
import {
  createOrUpdateTerm,
  createOrUpdateClass,
  listClasses,
  listTerms
} from '../services/termService';

const router = Router();

router.use(authenticate, tenantResolver());

router.get('/branding', requirePermission('settings:branding'), async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const branding = await getBranding(req.tenantClient, req.tenant.schema);
    res.json(branding);
  } catch (error) {
    next(error);
  }
});

router.put('/branding', requirePermission('settings:branding'), async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const parsed = brandingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const branding = await upsertBranding(req.tenantClient, req.tenant.schema, parsed.data);
    res.json(branding);
  } catch (error) {
    next(error);
  }
});

router.post('/terms', requirePermission('settings:terms'), async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const parsed = academicTermSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const term = await createOrUpdateTerm(req.tenantClient, req.tenant.schema, parsed.data);
    res.status(201).json(term);
  } catch (error) {
    next(error);
  }
});

router.get('/terms', requirePermission('settings:terms'), async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const terms = await listTerms(req.tenantClient, req.tenant.schema);
    res.json(terms);
  } catch (error) {
    next(error);
  }
});

router.post('/classes', requirePermission('settings:classes'), async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const parsed = classSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const classRow = await createOrUpdateClass(req.tenantClient, req.tenant.schema, parsed.data);
    res.status(201).json(classRow);
  } catch (error) {
    next(error);
  }
});

router.get('/classes', requirePermission('settings:classes'), async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const classes = await listClasses(req.tenantClient, req.tenant.schema);
    res.json(classes);
  } catch (error) {
    next(error);
  }
});

export default router;

