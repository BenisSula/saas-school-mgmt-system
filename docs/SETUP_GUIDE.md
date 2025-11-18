# Setup Guide

Complete guide to setting up and running the SaaS School Management System.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running Tests](#running-tests)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** >= 9.x or **pnpm** >= 8.x
- **Git**

### Optional Software

- **Docker** & **Docker Compose** (for containerized setup)
- **Redis** (for caching, optional)

### System Requirements

- **RAM:** Minimum 4GB, Recommended 8GB+
- **Disk Space:** Minimum 10GB
- **OS:** Linux, macOS, or Windows (WSL2 recommended for Windows)

---

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository:**
```bash
git clone <repository-url>
cd saas-school-mgmt-system
```

2. **Start services:**
```bash
docker-compose up -d
```

3. **Run migrations:**
```bash
docker-compose exec backend npm run migrate
```

4. **Seed demo data (optional):**
```bash
docker-compose exec backend npm run demo:seed
```

5. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api-docs (if Swagger UI is configured)

---

## Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd saas-school-mgmt-system
```

### Step 2: Install Dependencies

**Root level:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 3: Database Setup

1. **Create PostgreSQL database:**
```bash
createdb school_management
```

2. **Set up environment variables:**
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/school_management
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

3. **Run migrations:**
```bash
npm run migrate
```

4. **Seed superuser (optional):**
```bash
npm run seed:superuser
```

### Step 4: Start Development Servers

**Option 1: Run separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option 2: Run concurrently (from root)**
```bash
npm run dev
```

### Step 5: Verify Installation

1. **Check backend health:**
```bash
curl http://localhost:3001/health
```

2. **Open frontend:**
Navigate to http://localhost:5173

3. **Test login:**
- Use superuser credentials (if seeded)
- Or register a new account

---

## Production Deployment

### Backend Deployment

#### Option 1: Traditional Server

1. **Build backend:**
```bash
cd backend
npm run build
```

2. **Set production environment variables:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
CORS_ORIGIN=https://yourdomain.com
PORT=3001
```

3. **Start with PM2:**
```bash
pm2 start dist/server.js --name school-api
pm2 save
```

#### Option 2: Docker

1. **Build image:**
```bash
cd backend
docker build -t school-api:latest .
```

2. **Run container:**
```bash
docker run -d \
  --name school-api \
  -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  school-api:latest
```

### Frontend Deployment

1. **Build frontend:**
```bash
cd frontend
npm run build
```

2. **Deploy dist/ folder:**
- **Nginx:** Copy `dist/` to `/var/www/html`
- **Vercel/Netlify:** Deploy `dist/` folder
- **AWS S3 + CloudFront:** Upload `dist/` to S3 bucket

3. **Configure API URL:**
Set `VITE_API_URL` environment variable during build:
```bash
VITE_API_URL=https://api.yourdomain.com npm run build
```

### Database Setup (Production)

1. **Create production database:**
```bash
createdb school_management_prod
```

2. **Run migrations:**
```bash
NODE_ENV=production npm run migrate
```

3. **Set up backups:**
```bash
# Add to crontab
0 2 * * * pg_dump school_management_prod > /backups/db-$(date +\%Y\%m\%d).sql
```

---

## Database Setup

### Initial Schema Creation

The system uses two types of schemas:

1. **Shared Schema:** Platform-wide data (tenants, users, audit logs)
2. **Tenant Schemas:** Isolated data per school

### Migration Process

1. **Run shared schema migration:**
```bash
cd backend
npm run migrate
```

This creates:
- `shared.tenants` table
- `shared.users` table
- `shared.audit_logs` table

2. **Create tenant schema (via API or script):**
```bash
# Via superuser API
POST /superuser/schools
{
  "name": "Example School",
  "slug": "example-school",
  "adminEmail": "admin@example.com",
  "adminPassword": "SecurePass123!",
  "adminName": "Admin User"
}
```

Or via script:
```bash
npm run create:school
```

### Database Maintenance

**Backup:**
```bash
pg_dump school_management > backup.sql
```

**Restore:**
```bash
psql school_management < backup.sql
```

**Vacuum (cleanup):**
```bash
psql school_management -c "VACUUM ANALYZE;"
```

---

## Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/school_management

# JWT Secrets (use strong random strings)
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret

# Server
NODE_ENV=development
PORT=3001

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Optional: Redis (for caching)
REDIS_URL=redis://localhost:6379

# Optional: Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
SMTP_FROM=noreply@example.com
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=School Management System
```

### Generating Secrets

**JWT Secrets:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Running Tests

### Backend Tests

**Run all tests:**
```bash
cd backend
npm test
```

**Run specific test file:**
```bash
npm test -- tests/auth.test.ts
```

**Run with coverage:**
```bash
npm test -- --coverage
```

**Watch mode:**
```bash
npm run test:watch
```

### Frontend Tests

**Run all tests:**
```bash
cd frontend
npm test
```

**Run accessibility tests:**
```bash
npm run test:accessibility
```

**Watch mode:**
```bash
npm run test:watch
```

### E2E Tests

**Run Playwright tests:**
```bash
cd frontend
npm run test:e2e
```

**Run with UI:**
```bash
npm run test:e2e:ui
```

**Run in headed mode:**
```bash
npm run test:e2e:headed
```

### Test Coverage

**Backend:**
```bash
cd backend
npm test -- --coverage
```

**Frontend:**
```bash
cd frontend
npm test -- --coverage
```

---

## Troubleshooting

### Common Issues

#### Database Connection Error

**Error:** `Connection refused` or `password authentication failed`

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check `DATABASE_URL` in `.env`
3. Verify database exists: `psql -l`
4. Check PostgreSQL authentication in `pg_hba.conf`

#### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find process using port
lsof -i :3001
# Kill process
kill -9 <PID>
```

#### Migration Errors

**Error:** `relation already exists`

**Solution:**
```bash
# Drop and recreate database (development only)
dropdb school_management
createdb school_management
npm run migrate
```

#### JWT Token Errors

**Error:** `Invalid token` or `Token expired`

**Solution:**
1. Clear browser localStorage/cookies
2. Verify `JWT_SECRET` matches between restarts
3. Check token expiry settings

#### CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
1. Add frontend URL to `CORS_ORIGIN` in backend `.env`
2. Restart backend server
3. Check browser console for exact error

#### Tenant Context Missing

**Error:** `Tenant context required`

**Solution:**
1. Ensure `x-tenant-id` header is set in requests
2. Verify user belongs to tenant
3. Check tenant exists in database

### Debugging

#### Backend Debugging

**Enable debug logs:**
```env
DEBUG=*
```

**View logs:**
```bash
# PM2
pm2 logs school-api

# Docker
docker logs school-api

# Direct
npm run dev
```

#### Frontend Debugging

**Enable React DevTools:**
Install React DevTools browser extension

**View network requests:**
Open browser DevTools → Network tab

**Check console errors:**
Open browser DevTools → Console tab

### Performance Issues

#### Slow Database Queries

1. **Add indexes:**
```sql
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_attendance_student_date ON attendance_records(student_id, attendance_date);
```

2. **Analyze queries:**
```sql
EXPLAIN ANALYZE SELECT * FROM students WHERE class_id = '...';
```

#### High Memory Usage

1. **Check for memory leaks:**
```bash
node --inspect dist/server.js
```

2. **Monitor with PM2:**
```bash
pm2 monit
```

3. **Increase Node memory:**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

---

## Additional Resources

### Documentation

- [Component Documentation](./COMPONENT_DOCUMENTATION.md)
- [API Usage Documentation](./API_USAGE_DOCUMENTATION.md)
- [Architecture Documentation](./ARCHITECTURE_AND_FOLDER_STRUCTURE.md)
- [RBAC Permissions Map](./RBAC_PERMISSIONS_MAP.md)

### Scripts Reference

**Backend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run test` - Run tests
- `npm run seed:superuser` - Create superuser
- `npm run demo:seed` - Seed demo data

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:e2e` - Run E2E tests

### Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review existing documentation
3. Check GitHub issues
4. Contact support team

---

## Next Steps

After setup:

1. **Create first school:**
   - Use superuser account
   - Navigate to `/dashboard/superuser/schools`
   - Create new school

2. **Configure branding:**
   - Login as admin
   - Navigate to `/dashboard/settings`
   - Configure school branding

3. **Add users:**
   - Navigate to `/dashboard/users`
   - Register students and teachers
   - Approve pending users

4. **Set up classes:**
   - Navigate to `/dashboard/classes`
   - Create classes and subjects

5. **Start using:**
   - Mark attendance
   - Create exams
   - Enter grades
   - Generate reports

---

## Security Checklist

Before deploying to production:

- [ ] Change all default secrets
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Set up monitoring/logging
- [ ] Review RBAC permissions
- [ ] Enable audit logging
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable CSRF protection
- [ ] Review input validation
- [ ] Set up error tracking (Sentry, etc.)

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check system health

**Weekly:**
- Review audit logs
- Check database size
- Review performance metrics

**Monthly:**
- Database vacuum/analyze
- Review security logs
- Update dependencies
- Backup verification

**Quarterly:**
- Security audit
- Performance optimization
- Dependency updates
- Documentation review

