import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import tenantResolver from '../middleware/tenantResolver';
import { requirePermission } from '../middleware/rbac';
import { gradeBulkSchema } from '../validators/examValidator';
import { bulkUpsertGrades } from '../services/examService';

const router = Router();

router.use(authenticate, tenantResolver(), requirePermission('grades:manage'));

router.post('/bulk', async (req, res, next) => {
  const tenant = req.tenant;
  if (!req.tenantClient || !tenant) {
    return res.status(500).json({ message: 'Tenant context missing' });
  }

  const parsed = gradeBulkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.message });
  }

  try {
    const grades = await bulkUpsertGrades(
      req.tenantClient,
      tenant.schema,
      parsed.data.examId,
      parsed.data.entries,
      req.user?.id
    );
    res.status(200).json({ saved: grades.length });
  } catch (error) {
    next(error);
  }
});

export default router;
