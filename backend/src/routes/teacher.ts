import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import tenantResolver from '../middleware/tenantResolver';
import {
  createClassReportPdf,
  findTeacherByEmail,
  getTeacherClassReport,
  getTeacherClassRoster,
  getTeacherOverview,
  getTeacherProfileDetail,
  listTeacherClasses,
  listTeacherMessages,
  requestAssignmentDrop,
  type TeacherRecord
} from '../services/teacherDashboardService';

declare module 'express-serve-static-core' {
  interface Request {
    teacherRecord?: TeacherRecord;
  }
}

const router = Router();

router.use(authenticate, tenantResolver());

router.use(async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant || !req.user?.email) {
      return res.status(500).json({ message: 'Teacher context unavailable' });
    }

    const teacher = await findTeacherByEmail(req.tenantClient, req.tenant.schema, req.user.email);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    req.teacherRecord = teacher;
    next();
  } catch (error) {
    next(error);
  }
});

router.get('/overview', async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const teacher = req.teacherRecord!;
    const overview = await getTeacherOverview(req.tenantClient, req.tenant.schema, teacher);
    res.json(overview);
  } catch (error) {
    next(error);
  }
});

router.get('/classes', async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const teacher = req.teacherRecord!;
    const classes = await listTeacherClasses(req.tenantClient, req.tenant.schema, teacher.id);
    res.json(classes);
  } catch (error) {
    next(error);
  }
});

router.get('/classes/:classId/roster', async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const teacher = req.teacherRecord!;
    const roster = await getTeacherClassRoster(
      req.tenantClient,
      req.tenant.schema,
      teacher.id,
      req.params.classId
    );
    if (!roster) {
      return res.status(403).json({ message: 'You are not assigned to this class.' });
    }
    res.json(roster);
  } catch (error) {
    next(error);
  }
});

router.post('/assignments/:assignmentId/drop', async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const teacher = req.teacherRecord!;
    const updated = await requestAssignmentDrop(
      req.tenantClient,
      req.tenant.schema,
      teacher.id,
      req.params.assignmentId
    );
    if (!updated) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

router.get('/reports/class/:classId', async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const teacher = req.teacherRecord!;
    const report = await getTeacherClassReport(
      req.tenantClient,
      req.tenant.schema,
      teacher.id,
      req.params.classId
    );
    if (!report) {
      return res.status(403).json({ message: 'You are not assigned to this class.' });
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.get('/reports/class/:classId/pdf', async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const teacher = req.teacherRecord!;
    const report = await getTeacherClassReport(
      req.tenantClient,
      req.tenant.schema,
      teacher.id,
      req.params.classId
    );
    if (!report) {
      return res.status(403).json({ message: 'You are not assigned to this class.' });
    }

    const pdfBuffer = await createClassReportPdf(report, teacher.name);
    res
      .status(200)
      .setHeader('Content-Type', 'application/pdf')
      .setHeader(
        'Content-Disposition',
        `attachment; filename="class-report-${report.class.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`
      )
      .send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

router.get('/messages', async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const teacher = req.teacherRecord!;
    const messages = await listTeacherMessages(req.tenantClient, req.tenant.schema, teacher);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.get('/profile', async (req, res, next) => {
  try {
    if (!req.tenantClient || !req.tenant) {
      return res.status(500).json({ message: 'Tenant context missing' });
    }

    const teacher = req.teacherRecord!;
    const profile = await getTeacherProfileDetail(req.tenantClient, req.tenant.schema, teacher);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
