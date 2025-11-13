import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import tenantResolver from '../middleware/tenantResolver';
import { requirePermission } from '../middleware/rbac';
import { studentSchema } from '../validators/studentValidator';
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} from '../services/studentService';

const router = Router();

router.use(authenticate, tenantResolver(), requirePermission('users:manage'));

router.get('/', async (req, res) => {
  if (!req.tenantClient || !req.tenant) {
    return res.status(500).json({ message: 'Tenant context missing' });
  }
  const students = await listStudents(req.tenantClient!, req.tenant.schema);
  res.json(students);
});

router.get('/:id', async (req, res) => {
  if (!req.tenantClient || !req.tenant) {
    return res.status(500).json({ message: 'Tenant context missing' });
  }
  const student = await getStudent(req.tenantClient!, req.tenant.schema, req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

router.post('/', async (req, res, next) => {
  const parsed = studentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.message });
  }

  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }
    const student = await createStudent(req.tenantClient!, req.tenant.schema, parsed.data);
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res) => {
  const parsed = studentSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.message });
  }

  if (!req.tenantClient || !req.tenant) {
    return res.status(500).json({ message: 'Tenant context missing' });
  }
  const student = await updateStudent(
    req.tenantClient!,
    req.tenant.schema,
    req.params.id,
    parsed.data
  );
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

router.delete('/:id', async (req, res) => {
  if (!req.tenantClient || !req.tenant) {
    return res.status(500).json({ message: 'Tenant context missing' });
  }
  await deleteStudent(req.tenantClient!, req.tenant.schema, req.params.id);
  res.status(204).send();
});

export default router;
