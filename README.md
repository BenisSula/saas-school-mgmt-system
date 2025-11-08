# SaaS School Management System

This monorepo powers the SaaS School Management Portal and tracks the incremental delivery phases (Phase 0 discovery → Phase 9 polish). The backend provides a schema-per-tenant Express API, while the frontend delivers a branded, role-aware React experience backed by reusable UI primitives.

---

## Monorepo Layout

| Path | Purpose |
| ---- | ------- |
| `backend/` | Express + TypeScript API, RBAC middleware, tenant onboarding, migrations, Jest suites. |
| `frontend/` | Vite + React + TypeScript client with Tailwind UI kit, BrandProvider theming, Vitest suites, and axe-core checks. |
| `docs/` | Discovery artifacts, deployment checklist, performance & accessibility audits, security notes. |
| `.github/workflows/ci.yml` | CI pipeline blueprint (lint + test for backend and frontend). |

Frontend structure highlights:

- `src/App.tsx` – role-aware shell with responsive navbar + sidebar.
- `src/context/AuthContext.tsx` – handles access/refresh tokens, tenant persistence, auto-refresh schedule.
- `src/lib/api.ts` – typed client with sanitised request helpers and token lifecycle management.
- `src/components/ui/` – reusable themable primitives (Button, Input, Modal, Table, Navbar, Sidebar, ThemeToggle, BrandProvider).
- `src/pages/` – dashboards for each persona (admin configuration, reports, RBAC, teacher grades/attendance, student results/fees, landing auth).

---

## Theming & BrandProvider

`frontend/src/components/ui/BrandProvider.tsx` fetches tenant branding (`/configuration/branding`), normalises colour tokens, and writes them to CSS variables (`--brand-*`). The provider also:

- Persists light/dark preference in `localStorage` via `ThemeToggle`.
- Exposes `useBrand()` hook with tokens, load state, and `refresh()` util.
- Ensures every UI primitive (buttons, tables, navbar, sidebar) reads brand tokens instead of hard-coding colours.

To override branding per tenant:

```ts
await api.updateBranding({
  primary_color: '#2563eb',
  secondary_color: '#0f172a',
  theme_flags: { gradients: true }
});
await refresh(); // from useBrand()
```

---

## Authentication Flow (Frontend)

- `AuthContext` hydrates from storage (`hydrateFromStorage`) on load, schedules token refresh (`scheduleTokenRefresh`), and clears refresh timers on logout.
- `authApi.login|register|refresh` lives in `src/lib/api.ts`; responses call `initialiseSession` to persist tokens + tenant ID while validating tenant format.
- Failures trigger `setAuthHandlers({ onUnauthorized })`, which displays toasts and redirects to the landing page.
- `ProtectedRoute` wraps role-gated views (admin/teacher/student) and renders a fallback for unauthorised users.
- Every request automatically adds the sanitised `x-tenant-id` header and a `Bearer` token when authenticated.

Example guard inside a page:

```tsx
const { user } = useAuth();
if (!user || user.role !== 'admin') {
  return <StatusBanner status="error" message="Admins only" />;
}
```

---

## API Integration Guide

The typed `api` client (in `src/lib/api.ts`) centralises fetch logic, error handling, sanitisation, and retries.

Key helpers:

- `apiFetch` – attaches `Authorization` + `x-tenant-id`, retries once on 401 via refresh token.
- `setTenant` – validates tenant slug (`^[a-zA-Z0-9_-]+$`) before persisting.
- `sanitizeText` / `sanitizeIdentifier` (`src/lib/sanitize.ts`) – strip unsafe characters before sending to backend.

Usage pattern:

```ts
const { history, summary } = await api.getStudentAttendanceHistory(
  user.id,
  filters.from,
  filters.to
);

await api.bulkUpsertGrades(examId, entries.map((entry) => ({
  ...entry,
  studentId: sanitizeIdentifier(entry.studentId)
})));
```

When adding new endpoints:
1. Define Zod schema server-side.
2. Add typed function to `src/lib/api.ts` (re-use `apiFetch`).
3. Consume via hooks/pages, sanitising input before send.
4. Extend Vitest suite or add axe tests if UI changes.

---

## Local Development

| Step | Command |
| ---- | ------- |
| Install backend deps | `npm install --prefix backend` |
| Install frontend deps | `npm install --prefix frontend` |
| Bootstrap env | `cp .env.example .env` |
| Run migrations | `npm run migrate --prefix backend` |
| Start backend | `npm run dev --prefix backend` (port 3001) |
| Start frontend | `npm run dev --prefix frontend` (port 5173/5175) |

Environment variables of note:

- `VITE_API_BASE_URL` (required) – API origin for the frontend build.
- `VITE_TENANT_ID` (optional) – default tenant when storage empty.
- `CORS_ORIGIN` – comma-separated origins backend allows.
- JWT secrets, token TTLs, Postgres connection – see `.env.example` for defaults.

### Docker Compose

```bash
docker compose up --build
```
Services: Postgres 16 (`db`), hot-reloading backend, Vite dev server.

---

## Build & CI/CD Readiness

- Frontend build: `npm run build --prefix frontend` (runs `tsc` + `vite build`). Produces `frontend/dist/` ready for static hosting.
- Backend build: `npm run build --prefix backend` (compiles to `backend/dist/`).
- Test suites:
  - Backend: `npm run test --prefix backend` (Jest integration/unit).
  - Frontend: `npm run test --prefix frontend` (Vitest + Testing Library).
  - Accessibility smoke: `npm run test:accessibility --prefix frontend` (axe-core).
- Pre-commit: Husky + lint-staged auto-run after `npm install` at repo root.
- Example CI stages: install → lint (`npm run lint --prefix ...`) → tests → `npm run build --prefix frontend` → upload static artefact.

---

## Documentation & Checklists

- `CHANGELOG.md` – running summary of major releases (Phases 0–7).
- `docs/deployment-checklist.md` – go-live checklist (envs, builds, back-ups, observability, smoke tests).
- `docs/security-tests.md` – commands + results for security-oriented testing.
- `docs/performance-audit.md` / `docs/accessibility-report.md` – latest Lighthouse + axe findings.

See `CHANGELOG.md` for historical phase milestones and `docs/deployment-checklist.md` before any production deployment.

