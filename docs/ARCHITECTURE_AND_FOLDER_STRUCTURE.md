# Architecture & Folder Structure

Complete documentation of the system architecture and folder structure for the SaaS School Management System.

## Table of Contents

- [System Architecture](#system-architecture)
- [Monorepo Structure](#monorepo-structure)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Database Architecture](#database-architecture)
- [Multi-Tenant Architecture](#multi-tenant-architecture)
- [Security Architecture](#security-architecture)

---

## System Architecture

### Overview

The SaaS School Management System is a **monorepo** application with:

- **Backend:** Express.js + TypeScript API with PostgreSQL
- **Frontend:** React + TypeScript + Vite with Tailwind CSS
- **Database:** PostgreSQL with schema-per-tenant isolation
- **Authentication:** JWT-based with refresh tokens
- **Authorization:** Role-Based Access Control (RBAC)

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React/Vite)  │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │
│  (Express/TS)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Shared │ │Tenant│
│Schema │ │Schema│
└───────┘ └──────┘
```

---

## Monorepo Structure

```
saas-school-mgmt-system/
├── backend/              # Express.js backend
│   ├── src/             # TypeScript source
│   ├── dist/            # Compiled JavaScript
│   ├── tests/           # Test files
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/            # React frontend
│   ├── src/             # TypeScript source
│   ├── dist/            # Built assets
│   ├── e2e/             # E2E tests
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                # Documentation
│   ├── *.md            # Various docs
│   └── ...
│
├── docker-compose.yml   # Docker setup
├── package.json         # Root package.json
└── README.md
```

---

## Backend Structure

### Directory Layout

```
backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   │
│   ├── config/                   # Configuration
│   │   └── permissions.ts        # RBAC permissions map
│   │
│   ├── db/                       # Database
│   │   ├── connection.ts         # PostgreSQL pool
│   │   ├── tenantManager.ts      # Tenant schema management
│   │   ├── migrate.ts             # Migration runner
│   │   └── migrations/           # SQL migration files
│   │       ├── 001_shared_schema.sql
│   │       └── tenants/
│   │           └── 001_core_tables.sql
│   │
│   ├── middleware/                # Express middleware
│   │   ├── authenticate.ts       # JWT authentication
│   │   ├── rbac.ts               # Permission checking
│   │   ├── tenantResolver.ts     # Tenant context resolution
│   │   ├── ensureTenantContext.ts # Tenant validation
│   │   ├── validation.ts         # Input validation
│   │   ├── errorHandler.ts       # Error handling
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   ├── csrf.ts               # CSRF protection
│   │   └── ...
│   │
│   ├── routes/                    # API routes
│   │   ├── auth.ts               # Authentication routes
│   │   ├── users.ts              # User management
│   │   ├── students.ts           # Student CRUD
│   │   ├── teachers.ts           # Teacher CRUD
│   │   ├── attendance.ts         # Attendance tracking
│   │   ├── exams.ts              # Exam management
│   │   ├── grades.ts             # Grade entry
│   │   ├── results.ts            # Results retrieval
│   │   ├── invoices.ts           # Invoice management
│   │   ├── payments.ts           # Payment processing
│   │   ├── reports.ts            # Report generation
│   │   ├── configuration.ts      # Configuration management
│   │   ├── branding.ts           # Branding settings
│   │   ├── school.ts             # School profile
│   │   ├── superuser.ts          # Superuser operations
│   │   ├── tenants.ts            # Tenant management
│   │   ├── teacher.ts            # Teacher portal
│   │   ├── studentPortal.ts      # Student portal
│   │   ├── audit.ts              # Audit logs
│   │   ├── search.ts             # Search functionality
│   │   ├── notifications.ts      # Notifications
│   │   └── health.ts             # Health check
│   │
│   ├── services/                  # Business logic
│   │   ├── authService.ts        # Authentication logic
│   │   ├── userService.ts       # User management
│   │   ├── studentService.ts    # Student operations
│   │   ├── teacherService.ts    # Teacher operations
│   │   ├── attendanceService.ts # Attendance logic
│   │   ├── examService.ts       # Exam logic
│   │   ├── reportService.ts     # Report generation
│   │   ├── brandingService.ts   # Branding logic
│   │   ├── tenantManager.ts     # Tenant operations
│   │   ├── superuserService.ts  # Superuser operations
│   │   └── ...
│   │
│   ├── validators/                # Input validators
│   │   ├── authValidator.ts
│   │   ├── studentValidator.ts
│   │   ├── teacherValidator.ts
│   │   ├── examValidator.ts
│   │   └── ...
│   │
│   ├── lib/                       # Utilities
│   │   ├── apiErrors.ts         # Error response helpers
│   │   ├── logger.ts            # Logging utility
│   │   ├── queryUtils.ts        # Database query helpers
│   │   └── ...
│   │
│   ├── scripts/                   # Utility scripts
│   │   ├── seedDemo.ts          # Demo data seeding
│   │   ├── seedSuperUserSetup.ts
│   │   └── ...
│   │
│   └── seed/                      # Seed data
│       └── demoTenant.ts
│
├── tests/                          # Test files
│   ├── auth.test.ts
│   ├── rbac.test.ts
│   ├── tenantManager.test.ts
│   └── ...
│
├── openapi.yaml                    # OpenAPI/Swagger spec
├── jest.config.ts                  # Jest configuration
├── tsconfig.json                   # TypeScript config
└── package.json
```

### Key Files

#### `src/app.ts`
Main Express application setup:
- CORS configuration
- Middleware registration
- Route mounting
- Error handling

#### `src/server.ts`
Server entry point:
- Environment validation
- Database connection
- Server startup

#### `src/db/connection.ts`
PostgreSQL connection pool management.

#### `src/db/tenantManager.ts`
Tenant schema management:
- Schema creation
- Schema deletion
- Schema migration

---

## Frontend Structure

### Directory Layout

```
frontend/
├── src/
│   ├── main.tsx                   # Application entry point
│   ├── App.tsx                    # Root component & routing
│   │
│   ├── components/                # React components
│   │   ├── ui/                   # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── BrandProvider.tsx
│   │   │   └── ...
│   │   │
│   │   ├── auth/                 # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   └── fields/           # Form fields
│   │   │
│   │   ├── admin/                # Admin-specific components
│   │   │   ├── ManagementPageLayout.tsx
│   │   │   ├── PaginatedTable.tsx
│   │   │   └── ...
│   │   │
│   │   ├── charts/               # Chart components
│   │   │   ├── BarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   └── PieChart.tsx
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── LandingHeader.tsx
│   │   │   └── ...
│   │   │
│   │   ├── profile/              # Profile components
│   │   │   └── ...
│   │   │
│   │   └── ProtectedRoute.tsx    # Route protection
│   │
│   ├── pages/                     # Page components
│   │   ├── index.tsx             # Landing page
│   │   ├── auth/                 # Auth pages
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   │
│   │   ├── admin/                # Admin pages
│   │   │   ├── AdminOverviewPage.tsx
│   │   │   ├── AdminReportsPage.tsx
│   │   │   └── ...
│   │   │
│   │   ├── teacher/              # Teacher pages
│   │   │   ├── TeacherDashboardPage.tsx
│   │   │   └── ...
│   │   │
│   │   ├── student/              # Student pages
│   │   │   ├── StudentDashboardPage.tsx
│   │   │   └── ...
│   │   │
│   │   └── superuser/            # Superuser pages
│   │       └── ...
│   │
│   ├── layouts/                   # Layout wrappers
│   │   ├── LandingShell.tsx     # Public layout
│   │   └── AdminShell.tsx        # Authenticated layout
│   │
│   ├── context/                   # React contexts
│   │   ├── AuthContext.tsx       # Authentication state
│   │   └── ...
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePermission.ts
│   │   └── ...
│   │
│   ├── lib/                       # Utilities & API client
│   │   ├── api.ts                # API client
│   │   ├── roleLinks.tsx         # Navigation links
│   │   ├── sanitize.ts           # Input sanitization
│   │   ├── rbac/                 # RBAC utilities
│   │   └── ...
│   │
│   ├── config/                    # Configuration
│   │   └── api.ts                # API configuration
│   │
│   ├── types/                     # TypeScript types
│   │   └── index.ts
│   │
│   └── styles/                    # Global styles
│       └── index.css
│
├── e2e/                           # E2E tests (Playwright)
│   ├── admin-approve-teacher.spec.ts
│   └── ...
│
├── public/                        # Static assets
├── vite.config.ts                 # Vite configuration
├── tailwind.config.cjs            # Tailwind CSS config
└── package.json
```

### Key Files

#### `src/App.tsx`
Main application component:
- Route definitions
- Protected route configuration
- Layout wrapping

#### `src/context/AuthContext.tsx`
Authentication context:
- User state management
- Token refresh
- Login/logout

#### `src/lib/api.ts`
API client:
- HTTP request handling
- Token management
- Error handling
- Tenant context

#### `src/lib/roleLinks.tsx`
Navigation link definitions per role.

---

## Database Architecture

### Schema Structure

#### Shared Schema (`shared`)
Contains platform-wide data:

```sql
-- Tenants (schools)
shared.tenants
  - id (UUID)
  - name (TEXT)
  - slug (TEXT, UNIQUE)
  - schema_name (TEXT, UNIQUE)
  - status (TEXT)
  - created_at (TIMESTAMPTZ)

-- Users (platform-wide)
shared.users
  - id (UUID)
  - email (TEXT, UNIQUE)
  - password_hash (TEXT)
  - role (TEXT)
  - status (TEXT)
  - tenant_id (UUID, FK)
  - pending_profile_data (JSONB)
  - created_at (TIMESTAMPTZ)

-- Audit logs
shared.audit_logs
  - id (UUID)
  - tenant_id (UUID)
  - user_id (UUID)
  - action (TEXT)
  - resource_type (TEXT)
  - resource_id (UUID)
  - metadata (JSONB)
  - created_at (TIMESTAMPTZ)
```

#### Tenant Schema (`tenant_<slug>`)
Each tenant has an isolated schema:

```sql
-- Core tables in each tenant schema
tenant_<slug>.schools
tenant_<slug>.students
tenant_<slug>.teachers
tenant_<slug>.attendance_records
tenant_<slug>.exam_schedules
tenant_<slug>.exam_sessions
tenant_<slug>.grade_entries
tenant_<slug>.invoices
tenant_<slug>.payments
tenant_<slug>.branding_settings
tenant_<slug>.academic_terms
tenant_<slug>.classes
```

### Multi-Tenant Isolation

1. **Schema-per-tenant:** Each school gets its own PostgreSQL schema
2. **Connection pooling:** Shared connection pool with schema switching
3. **Tenant resolution:** Middleware resolves tenant from `x-tenant-id` header
4. **Data isolation:** All queries automatically scoped to tenant schema

---

## Multi-Tenant Architecture

### Tenant Onboarding Flow

1. **Superuser creates tenant:**
   - Creates record in `shared.tenants`
   - Generates unique schema name
   - Creates PostgreSQL schema

2. **Schema initialization:**
   - Runs migrations on tenant schema
   - Seeds initial data
   - Creates admin user

3. **Tenant activation:**
   - Admin logs in
   - Configures branding
   - Sets up classes/subjects

### Tenant Resolution

```typescript
// Middleware flow:
1. Extract x-tenant-id from header
2. Lookup tenant in shared.tenants
3. Verify user belongs to tenant
4. Set tenant context on request
5. Switch database connection to tenant schema
```

---

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Backend validates credentials
3. Backend generates JWT access token (15min expiry)
4. Backend generates refresh token (7 days expiry)
5. Tokens returned to client
6. Client stores tokens (localStorage/cookies)
7. Client includes access token in Authorization header
8. On 401, client uses refresh token to get new access token
```

### Authorization Flow

```
1. Request arrives with JWT token
2. Middleware validates token
3. Middleware extracts user role
4. Middleware checks required permission
5. Permission checked against rolePermissions map
6. Access granted/denied
```

### Security Layers

1. **Authentication:** JWT tokens with refresh mechanism
2. **Authorization:** RBAC with permission-based access
3. **Tenant Isolation:** Schema-per-tenant with middleware enforcement
4. **Input Validation:** Zod schemas for all inputs
5. **Rate Limiting:** Per-endpoint rate limits
6. **CSRF Protection:** CSRF tokens for state-changing operations
7. **SQL Injection Prevention:** Parameterized queries only
8. **XSS Prevention:** Input sanitization
9. **Audit Logging:** All admin actions logged

---

## Data Flow

### Request Flow

```
Client Request
    ↓
CORS Middleware
    ↓
Rate Limiter
    ↓
Input Sanitization
    ↓
Authentication Middleware
    ↓
Tenant Resolver
    ↓
Tenant Context Validation
    ↓
RBAC Check
    ↓
Route Handler
    ↓
Service Layer
    ↓
Database Query (tenant-scoped)
    ↓
Response
```

### Response Flow

```
Database Result
    ↓
Service Layer (business logic)
    ↓
Route Handler (formatting)
    ↓
Error Handler (if error)
    ↓
Client Response
```

---

## Development Workflow

### Adding a New Feature

1. **Backend:**
   - Create route in `src/routes/`
   - Create service in `src/services/`
   - Create validator in `src/validators/`
   - Add tests in `tests/`

2. **Frontend:**
   - Create page in `src/pages/`
   - Create components in `src/components/`
   - Add route in `src/App.tsx`
   - Add tests in `src/__tests__/`

3. **Database:**
   - Create migration in `src/db/migrations/`
   - Run migration: `npm run migrate`

---

## Deployment Architecture

### Production Setup

```
┌─────────────┐
│   Nginx     │ (Reverse proxy)
└──────┬──────┘
       │
┌──────▼──────┐
│   Frontend  │ (Static files)
└────────────┘

┌─────────────┐
│   Nginx     │ (API gateway)
└──────┬──────┘
       │
┌──────▼──────┐
│   Backend   │ (Express API)
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │ (Database)
└────────────┘
```

### Environment Variables

**Backend:**
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `NODE_ENV`

**Frontend:**
- `VITE_API_URL`
- `VITE_APP_NAME`

---

## Best Practices

1. **Code Organization:**
   - Keep components small and focused
   - Extract reusable logic to hooks/services
   - Use TypeScript for type safety

2. **Database:**
   - Always use parameterized queries
   - Scope all queries to tenant schema
   - Use transactions for multi-step operations

3. **Security:**
   - Never trust client input
   - Always validate permissions
   - Log all admin actions

4. **Testing:**
   - Unit tests for services
   - Integration tests for routes
   - E2E tests for critical flows

