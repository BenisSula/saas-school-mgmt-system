import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import tenantResolver from '../middleware/tenantResolver';
import { requirePermission } from '../middleware/rbac';
import { invoiceSchema } from '../validators/invoiceValidator';
import { createInvoice, getInvoicesForStudent } from '../services/invoiceService';

const router = Router();

router.use(authenticate, tenantResolver());

router.post('/', requirePermission('fees:manage'), async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const parsed = invoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }

    const invoice = await createInvoice(
      req.tenantClient,
      req.tenant.schema,
      parsed.data,
      req.user?.id
    );

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

router.get('/:studentId', requirePermission('fees:view'), async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant || !req.user) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const studentId = req.params.studentId;
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const invoices = await getInvoicesForStudent(req.tenantClient, req.tenant.schema, studentId);
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

export default router;
