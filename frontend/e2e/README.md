# E2E Tests with Playwright

This directory contains end-to-end tests for the frontend application using Playwright.

## Prerequisites

1. **Backend must be running** on `http://localhost:3001` (or configure `VITE_API_BASE_URL`)
2. **Frontend dev server** will be started automatically by Playwright
3. **Test credentials** must exist in the database (see below)

## Test Credentials

The tests use the following demo credentials (from README.md):

- **SuperUser:** `owner.demo@platform.test` / `OwnerDemo#2025`
- **Admin:** `admin.demo@academy.test` / `AdminDemo#2025`
- **Teacher:** `teacher.demo@academy.test` / `TeacherDemo#2025`
- **Student:** `student.demo@academy.test` / `StudentDemo#2025`

**Note:** If these credentials don't exist, tests will gracefully skip after login failures.

## Running Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/superuser-create-school.spec.ts
```

## Test Scenarios

### 1. SuperUser Create School (`superuser-create-school.spec.ts`)
- SuperUser logs in
- Navigates to school management
- Creates a new school
- Verifies school appears in list

### 2. Admin Approve Teacher (`admin-approve-teacher.spec.ts`)
- Admin logs in
- Navigates to user management
- Finds pending teacher
- Approves teacher
- Teacher can login

### 3. Teacher Grade Entry (`teacher-grade-student.spec.ts`)
- Teacher logs in
- Navigates to grade entry
- Enters grade for student
- Student logs in
- Student sees grade

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:5173` (frontend dev server)
- Browser: Chromium
- Auto-starts dev server before tests
- Screenshots on failure
- HTML report generated

## Troubleshooting

### Tests fail with "Login failed"
- Ensure backend is running
- Verify test credentials exist in database
- Check `VITE_API_BASE_URL` environment variable

### Tests timeout waiting for navigation
- Check if backend is responding
- Verify API endpoints are accessible
- Check browser console for errors

### Tests can't find elements
- Page structure may have changed
- Check selectors in test files
- Use Playwright's codegen: `npx playwright codegen http://localhost:5173`

## CI/CD Integration

For CI environments:
- Set `CI=true` environment variable
- Tests will retry twice on failure
- Use single worker to avoid race conditions
- Ensure backend is available in CI environment

