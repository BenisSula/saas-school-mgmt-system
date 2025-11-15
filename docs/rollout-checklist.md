# Phase 7 Rollout Checklist

This document provides a step-by-step checklist for rolling out the Phase 7 changes (HOD role, status management, RBAC consolidation) to staging and production.

## Pre-Deployment Checklist

### Code Review
- [ ] All Phase 1-6 changes reviewed and approved
- [ ] Integration tests passing locally
- [ ] Unit tests passing locally
- [ ] Linting and formatting checks passing
- [ ] No breaking changes to public APIs (or documented)

### Database Migrations
- [ ] Migration `008_users_status.sql` reviewed
- [ ] Migration `009_add_hod_role.sql` reviewed
- [ ] Migration `010_backfill_user_status.sql` reviewed
- [ ] Migration rollback scripts prepared (if needed)
- [ ] Migration execution time estimated
- [ ] Database backup strategy confirmed

### Documentation
- [ ] `docs/auth-and-roles.md` reviewed and accurate
- [ ] `docs/tenant-context.md` reviewed and accurate
- [ ] API documentation updated (if needed)
- [ ] Changelog updated

### Testing
- [ ] All integration tests passing:
  - [ ] `superuser-admin-flow.test.ts`
  - [ ] `admin-hod-teacher-flow.test.ts`
  - [ ] `teacher-student-attendance.test.ts`
- [ ] All middleware tests passing:
  - [ ] `rbac.test.ts`
  - [ ] `verifyTeacherAssignment.test.ts`
- [ ] Frontend tests passing (if applicable)
- [ ] E2E tests passing (if applicable)

## Staging Deployment

### Step 1: Deploy Code
```bash
# 1. Merge feature branch to staging
git checkout staging
git merge feature/phase7-docs-migration-rollout

# 2. Build and deploy
npm run build --prefix backend
npm run build --prefix frontend

# 3. Deploy to staging environment
# (Follow your deployment process)
```

### Step 2: Run Database Migrations

**⚠️ IMPORTANT**: Run migrations in order and verify each step.

```bash
# 1. Backup staging database
pg_dump -h staging-db-host -U postgres -d school_mgmt > staging_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations in order
psql -h staging-db-host -U postgres -d school_mgmt -f backend/src/db/migrations/008_users_status.sql
psql -h staging-db-host -U postgres -d school_mgmt -f backend/src/db/migrations/009_add_hod_role.sql
psql -h staging-db-host -U postgres -d school_mgmt -f backend/src/db/migrations/010_backfill_user_status.sql

# 3. Verify migrations
psql -h staging-db-host -U postgres -d school_mgmt -c "
  SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status IS NOT NULL) as users_with_status,
    COUNT(*) FILTER (WHERE role = 'hod') as hod_users
  FROM shared.users;
"
```

**Expected Results**:
- All users have non-null `status`
- `hod` role is allowed in role constraint
- No errors during migration

### Step 3: Verify Data Integrity

```sql
-- Check status distribution
SELECT status, COUNT(*) 
FROM shared.users 
GROUP BY status;

-- Check role distribution
SELECT role, COUNT(*) 
FROM shared.users 
GROUP BY role;

-- Verify no null statuses
SELECT COUNT(*) 
FROM shared.users 
WHERE status IS NULL;
-- Should return 0

-- Verify HOD role constraint
SELECT role 
FROM shared.users 
WHERE role = 'hod';
-- Should not error
```

### Step 4: Run Integration Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if applicable)
cd frontend
npm test

# E2E tests (if applicable)
npm run test:e2e
```

**Expected**: All tests passing

### Step 5: Manual Testing

#### Test 1: SuperAdmin Creates Tenant + Admin
- [ ] SuperAdmin can create tenant
- [ ] SuperAdmin can create admin user
- [ ] Admin status is `active` immediately
- [ ] Admin can login and access dashboard

#### Test 2: Admin Creates HOD
- [ ] Admin can create HOD user
- [ ] HOD status is `pending` initially
- [ ] Admin can approve HOD
- [ ] HOD status becomes `active`
- [ ] HOD can login and access dashboard

#### Test 3: Admin Creates Teacher
- [ ] Admin can create teacher user
- [ ] Teacher status is `pending` initially
- [ ] Admin can approve teacher
- [ ] Teacher status becomes `active`
- [ ] Teacher can login and access dashboard

#### Test 4: Teacher Marks Attendance
- [ ] Teacher can mark attendance for assigned class
- [ ] Teacher cannot mark attendance for non-assigned class
- [ ] Student can view their attendance
- [ ] Attendance appears in student dashboard

#### Test 5: Status Enforcement
- [ ] Pending user cannot login (appropriate error message)
- [ ] Suspended user cannot login (appropriate error message)
- [ ] Rejected user cannot login (appropriate error message)
- [ ] Active user can login successfully

#### Test 6: Permission Checks
- [ ] Teacher can access teacher-only routes
- [ ] Student cannot access teacher routes (403)
- [ ] Admin can access admin routes
- [ ] HOD can access HOD routes

### Step 6: Performance Check
- [ ] API response times acceptable (< 500ms for most endpoints)
- [ ] Database query performance acceptable
- [ ] No memory leaks observed
- [ ] No excessive database connections

### Step 7: Monitoring
- [ ] Application logs reviewed (no errors)
- [ ] Database logs reviewed (no errors)
- [ ] Error tracking system checked (no new errors)
- [ ] Performance metrics reviewed

## Production Deployment

### Prerequisites
- [ ] All staging tests passing
- [ ] Staging environment stable for 24+ hours
- [ ] Production maintenance window scheduled
- [ ] Rollback plan documented
- [ ] Team notified of deployment

### Maintenance Window

**Recommended**: Low-traffic period (e.g., weekend night)

**Duration**: 30-60 minutes (depending on database size)

### Step 1: Pre-Deployment Backup

```bash
# Full database backup
pg_dump -h prod-db-host -U postgres -d school_mgmt > prod_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh prod_backup_*.sql
```

### Step 2: Enable Maintenance Mode

```bash
# Set maintenance mode flag (if supported)
# Or update load balancer to stop routing traffic
```

### Step 3: Deploy Code

```bash
# 1. Tag release
git tag -a v1.0.0-phase7 -m "Phase 7: HOD role, status management, RBAC consolidation"
git push origin v1.0.0-phase7

# 2. Deploy to production
# (Follow your deployment process)
```

### Step 4: Run Database Migrations

**⚠️ CRITICAL**: Run during maintenance window with database locked if possible.

```bash
# 1. Run migrations in order
psql -h prod-db-host -U postgres -d school_mgmt -f backend/src/db/migrations/008_users_status.sql
psql -h prod-db-host -U postgres -d school_mgmt -f backend/src/db/migrations/009_add_hod_role.sql
psql -h prod-db-host -U postgres -d school_mgmt -f backend/src/db/migrations/010_backfill_user_status.sql

# 2. Verify migrations
psql -h prod-db-host -U postgres -d school_mgmt -c "
  SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status IS NOT NULL) as users_with_status
  FROM shared.users;
"
```

**Expected**: All users have status, no errors

### Step 5: Verify Deployment

```bash
# 1. Health check
curl https://api.production.com/health

# 2. Smoke test
curl https://api.production.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"..."}'
```

### Step 6: Disable Maintenance Mode

```bash
# Remove maintenance mode flag
# Or update load balancer to resume routing
```

### Step 7: Post-Deployment Monitoring

**First 15 minutes**:
- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Check application logs
- [ ] Check database logs

**First hour**:
- [ ] Verify no increase in error rates
- [ ] Verify no performance degradation
- [ ] Check user reports (if any)

**First 24 hours**:
- [ ] Daily monitoring check
- [ ] Review error tracking
- [ ] Review performance metrics

## Rollback Plan

### If Migration Fails

1. **Stop deployment immediately**
2. **Restore database from backup**:
   ```bash
   psql -h prod-db-host -U postgres -d school_mgmt < prod_backup_YYYYMMDD_HHMMSS.sql
   ```
3. **Revert code deployment**
4. **Investigate issue**
5. **Fix and retry**

### If Application Errors Occur

1. **Check error logs** to identify issue
2. **If critical**: Rollback code deployment
3. **If minor**: Hotfix deployment
4. **Monitor closely**

### Rollback Commands

```bash
# Rollback code (example)
git revert <commit-hash>
git push origin main

# Rollback database (if needed)
psql -h prod-db-host -U postgres -d school_mgmt < prod_backup_YYYYMMDD_HHMMSS.sql
```

## Post-Deployment Tasks

### Documentation
- [ ] Update deployment log
- [ ] Document any issues encountered
- [ ] Update runbook if needed

### Communication
- [ ] Notify team of successful deployment
- [ ] Update status page (if applicable)
- [ ] Send release notes to stakeholders

### Follow-up
- [ ] Schedule post-deployment review
- [ ] Review metrics after 1 week
- [ ] Gather user feedback
- [ ] Plan next phase

## Acceptance Criteria

All of the following must be true:

- [ ] HOD role supported and usable end-to-end
- [ ] New and existing users have correct status
- [ ] Single RBAC middleware used across codebase
- [ ] Teacher operations guarded at route and service layers
- [ ] Tenant context checks centralized and consistent
- [ ] Frontend and backend types include status and honor role/permission contracts
- [ ] Integration & e2e tests cover core flows and pass in CI
- [ ] No data loss during migration
- [ ] No production incidents
- [ ] All tests passing in CI

## Support Contacts

- **Database Issues**: [DBA Team]
- **Application Issues**: [DevOps Team]
- **Emergency Rollback**: [On-Call Engineer]

## Related Documentation

- [Authentication & Roles](./auth-and-roles.md)
- [Tenant Context](./tenant-context.md)
- [Deployment Guide](./deployment-checklist.md)

