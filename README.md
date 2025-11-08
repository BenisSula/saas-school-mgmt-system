# SaaS School Management System

Monorepo scaffold for the SaaS School Management Portal. Phase 1 delivered project scaffolding; Phase 2 adds secure authentication, JWT sessions, and role-based access control across Student/Teacher/Admin/SuperAdmin personas.

## Project Structure

- `backend/` – Express + TypeScript API with auth routes, RBAC middleware, Postgres connection helper, and database migrations.
- `frontend/` – Vite + React + TypeScript app with Tailwind CSS, layout/component stubs, and smoke test.
- `docs/` – Discovery phase documentation and user stories.
- `.github/workflows/ci.yml` – CI pipeline that runs linting and tests for both apps.

## Requirements

- Node.js 20+
- npm 10+
- Docker & Docker Compose (for local infra)

## Getting Started (Local)

1. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Copy environment template**
   ```bash
   cp .env.example .env
   ```
   Adjust values as needed (e.g., database connection string, API base URL).

3. **Run database migrations (first time)**
   ```bash
   npm run migrate --prefix backend
   ```

4. **Run backend locally**
   ```bash
   npm run dev --prefix backend
   ```

5. **Run frontend locally**
   ```bash
   npm run dev --prefix frontend
   ```
   The frontend points to the backend via `VITE_API_BASE_URL`.

## Docker Compose

Spin up Postgres, backend, and frontend with one command:

```bash
docker compose up --build
```

Services:
- `db`: Postgres 16 with persistent volume.
- `backend`: Express API watching for changes (`npm run dev`).
- `frontend`: Vite dev server exposed on port 5173.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run lint --prefix backend` | Lints backend TypeScript files. |
| `npm run test --prefix backend` | Runs backend unit tests (Jest + ts-jest). |
| `npm run lint --prefix frontend` | Lints frontend using ESLint + React plugins. |
| `npm run test --prefix frontend` | Runs frontend tests (Vitest + Testing Library). |
| `npm run migrate --prefix backend` | Applies Postgres migrations (shared tenant/user schemas). |
| `npm run format:write --prefix backend` | Formats backend files with Prettier. |
| `npm run format:write --prefix frontend` | Formats frontend files with Prettier. |

## Husky & Lint-Staged

Husky enforces linting and tests before commits. After installing dependencies at the repo root (see below), hooks run automatically.

## Repository Root Tooling

Install root tooling (Husky, lint-staged, concurrently) and enable Git hooks:

```bash
npm install
npm run prepare
```

## Tenant Bootstrapping (Local)

1. Start Docker Compose to provision Postgres.
2. Ensure `DATABASE_URL` uses the schema-per-tenant pattern (e.g., `postgres://.../saas_school?schema=tenant_xyz` in future phases).
3. Use `POST /auth/signup` to create an initial tenant admin (include `tenantId`) or SuperAdmin (omit `tenantId`). Multi-tenant onboarding scripts will follow in future phases.

## Authentication API (Phase 2)

- `POST /auth/signup` – Create user (SuperAdmin or tenant-scoped role). Response contains access + refresh tokens.
- `POST /auth/login` – Exchange credentials for tokens.
- `POST /auth/refresh` – Rotate refresh token and mint new access token.
- `POST /auth/request-password-reset` / `POST /auth/reset-password` – Password recovery flow (tokens logged to console locally).
- `POST /auth/request-email-verification` / `POST /auth/verify-email` – Email verification stubs (tokens logged).
- Protected resources call `authenticate` middleware and `requirePermission` to enforce centralized permissions (`config/permissions.ts`). Tokens embed `tenant_id` to guarantee isolation.

## Testing

```bash
# Backend
npm run test --prefix backend

# Frontend
npm run test --prefix frontend
```

CI replicates these commands for pull requests.

## Next Steps

- Integrate real email/SMS providers for verification & reset flows.
- Flesh out frontend routing and state management.
- Add tenant onboarding automation (`POST /tenants`) and schema provisioning.
- Extend tests to cover attendance, exams, fee modules, and end-to-end auth flows.

