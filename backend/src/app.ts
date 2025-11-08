import express from 'express';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import authenticate from './middleware/authenticate';
import { requirePermission } from './middleware/rbac';

const app = express();

app.use(express.json());

app.use('/health', healthRouter);
app.use('/auth', authRouter);

app.get('/admin/overview', authenticate, requirePermission('users:manage'), (_req, res) => {
  res.status(200).json({ message: 'Welcome, admin' });
});

export default app;

