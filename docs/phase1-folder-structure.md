# PHASE 1 — Base Architecture & Folder Structure

## Sumano SaaS Platform - Complete Folder Structure

**Design Principles**: DRY, Responsiveness, Modularity, Scalability, Security-First

---

## 📁 Root Directory Structure

```
saas-school-mgmt-system/
├── frontend/                    # React + TypeScript + Vite
├── backend/                     # Node.js + Express + TypeScript + Prisma + PostgreSQL
├── shared/                      # Shared types and utilities
├── docs/                        # Documentation
├── .github/                     # GitHub workflows and templates
├── docker-compose.yml           # Docker orchestration
├── .gitignore
├── README.md
└── package.json                 # Root package.json for workspace management
```

---

## 🎨 Frontend Structure (`frontend/`)

```
frontend/
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│
├── src/
│   ├── app/                     # App-level configuration
│   │   ├── App.tsx              # Main app component
│   │   ├── AppRoutes.tsx        # Route definitions
│   │   └── providers/           # Context providers
│   │       ├── AuthProvider.tsx
│   │       ├── ThemeProvider.tsx
│   │       └── TenantProvider.tsx
│   │
│   ├── pages/                   # Page components (route-level)
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── superuser/           # SuperUser module pages
│   │   │   ├── SuperuserOverviewPage.tsx
│   │   │   ├── SuperuserManageSchoolsPage.tsx
│   │   │   ├── SuperuserUsersPage.tsx
│   │   │   ├── SuperuserReportsPage.tsx
│   │   │   ├── SuperuserSettingsPage.tsx
│   │   │   └── SuperuserSubscriptionsPage.tsx
│   │   │
│   │   ├── admin/               # Admin module pages
│   │   │   ├── AdminOverviewPage.tsx
│   │   │   ├── AdminRoleManagementPage.tsx
│   │   │   ├── TeachersManagementPage.tsx
│   │   │   ├── StudentsManagementPage.tsx
│   │   │   ├── HODsManagementPage.tsx
│   │   │   ├── AdminConfigurationPage.tsx
│   │   │   ├── AdminExamConfigPage.tsx
│   │   │   ├── AdminInvoicePage.tsx
│   │   │   ├── AdminReportsPage.tsx
│   │   │   ├── AdminAttendancePage.tsx
│   │   │   └── AdminClassesSubjectsPage.tsx
│   │   │
│   │   ├── teacher/             # Teacher module pages
│   │   │   ├── TeacherDashboardPage.tsx
│   │   │   ├── TeacherAttendancePage.tsx
│   │   │   └── TeacherGradeEntryPage.tsx
│   │   │
│   │   ├── student/             # Student module pages
│   │   │   ├── StudentDashboardPage.tsx
│   │   │   ├── StudentAttendancePage.tsx
│   │   │   ├── StudentFeesPage.tsx
│   │   │   ├── StudentMessagesPage.tsx
│   │   │   └── StudentProfilePage.tsx
│   │   │
│   │   ├── hod/                 # HOD module pages
│   │   │   ├── HODDashboardPage.tsx
│   │   │   └── HODReportsPage.tsx
│   │   │
│   │   ├── LandingPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── components/              # Reusable UI components
│   │   ├── layout/              # Layout components
│   │   │   ├── Layout.tsx       # Main layout wrapper
│   │   │   ├── Sidebar.tsx      # Collapsible sidebar
│   │   │   ├── Header.tsx       # Top header/navbar
│   │   │   ├── Footer.tsx
│   │   │   ├── RouteMeta.tsx    # Route metadata wrapper
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── auth/                # Auth-specific components
│   │   │   ├── AuthFormLayout.tsx
│   │   │   ├── AuthInput.tsx
│   │   │   ├── AuthSelect.tsx
│   │   │   ├── AuthDatePicker.tsx
│   │   │   ├── AuthMultiSelect.tsx
│   │   │   ├── AuthSubmitButton.tsx
│   │   │   ├── AuthErrorBanner.tsx
│   │   │   ├── TenantSelector.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthModal.tsx
│   │   │
│   │   ├── admin/               # Admin-specific components
│   │   │   ├── AdminUserRegistrationModal.tsx
│   │   │   ├── UserApprovalCard.tsx
│   │   │   ├── UserProfileCard.tsx
│   │   │   ├── TeacherProfileCard.tsx
│   │   │   ├── StudentProfileCard.tsx
│   │   │   ├── HODProfileCard.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── ReportGenerator.tsx
│   │   │   └── BulkActionsToolbar.tsx
│   │   │
│   │   ├── superuser/           # SuperUser-specific components
│   │   │   ├── SchoolCard.tsx
│   │   │   ├── SchoolFormModal.tsx
│   │   │   └── PlatformStatsCard.tsx
│   │   │
│   │   ├── ui/                  # Base UI components (shadcn/ui)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── StatusBanner.tsx
│   │   │   └── ThemeToggle.tsx
│   │   │
│   │   └── shared/              # Shared/common components
│   │       ├── DataTable.tsx
│   │       ├── Pagination.tsx
│   │       ├── SearchBar.tsx
│   │       ├── FilterBar.tsx
│   │       ├── ExportButton.tsx
│   │       └── PrintButton.tsx
│   │
│   ├── modules/                 # Feature modules (DRY organization)
│   │   ├── auth/                # Auth module
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   ├── useRegister.ts
│   │   │   │   └── useAuthForm.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── superuser/           # SuperUser module
│   │   │   ├── hooks/
│   │   │   │   ├── useSchools.ts
│   │   │   │   └── usePlatformStats.ts
│   │   │   ├── services/
│   │   │   │   └── superuserService.ts
│   │   │   └── types/
│   │   │       └── superuser.types.ts
│   │   │
│   │   ├── admin/               # Admin module
│   │   │   ├── hooks/
│   │   │   │   ├── useUsers.ts
│   │   │   │   ├── useTeachers.ts
│   │   │   │   ├── useStudents.ts
│   │   │   │   ├── useHODs.ts
│   │   │   │   └── useReports.ts
│   │   │   ├── services/
│   │   │   │   ├── userService.ts
│   │   │   │   ├── teacherService.ts
│   │   │   │   ├── studentService.ts
│   │   │   │   ├── hodService.ts
│   │   │   │   └── reportService.ts
│   │   │   └── types/
│   │   │       ├── user.types.ts
│   │   │       ├── teacher.types.ts
│   │   │       ├── student.types.ts
│   │   │       └── hod.types.ts
│   │   │
│   │   ├── teacher/             # Teacher module
│   │   │   ├── hooks/
│   │   │   │   └── useTeacherData.ts
│   │   │   ├── services/
│   │   │   │   └── teacherService.ts
│   │   │   └── types/
│   │   │       └── teacher.types.ts
│   │   │
│   │   ├── student/             # Student module
│   │   │   ├── hooks/
│   │   │   │   └── useStudentData.ts
│   │   │   ├── services/
│   │   │   │   └── studentService.ts
│   │   │   └── types/
│   │   │       └── student.types.ts
│   │   │
│   │   └── hod/                 # HOD module
│   │       ├── hooks/
│   │       │   └── useHODData.ts
│   │       ├── services/
│   │       │   └── hodService.ts
│   │       └── types/
│   │           └── hod.types.ts
│   │
│   ├── lib/                     # Shared utilities and configurations
│   │   ├── api/                 # API layer
│   │   │   ├── api.ts           # Main API client (axios/fetch wrapper)
│   │   │   ├── endpoints.ts     # API endpoint constants
│   │   │   ├── interceptors.ts  # Request/response interceptors
│   │   │   └── types.ts         # API response types
│   │   │
│   │   ├── auth/                # Auth utilities
│   │   │   ├── tokenManager.ts  # Token storage/refresh
│   │   │   └── permissions.ts  # Permission checking utilities
│   │   │
│   │   ├── theme/               # Theme system
│   │   │   ├── theme.ts         # Theme configuration
│   │   │   ├── colors.ts        # Color palette definitions
│   │   │   ├── useBrand.ts      # Brand color hook
│   │   │   └── useTheme.ts      # Theme toggle hook
│   │   │
│   │   ├── rbac/                # RBAC utilities
│   │   │   ├── permissions.ts   # Permission definitions
│   │   │   ├── usePermission.ts # Permission checking hook
│   │   │   └── roleConfig.ts   # Role configurations
│   │   │
│   │   ├── validation/          # Validation utilities
│   │   │   ├── schemas/         # Zod schemas
│   │   │   │   ├── authSchema.ts
│   │   │   │   ├── userSchema.ts
│   │   │   │   ├── teacherSchema.ts
│   │   │   │   └── studentSchema.ts
│   │   │   └── validators.ts    # Validation helpers
│   │   │
│   │   ├── utils/               # General utilities
│   │   │   ├── format.ts        # Formatting utilities
│   │   │   ├── date.ts          # Date utilities
│   │   │   ├── string.ts        # String utilities
│   │   │   ├── error.ts         # Error handling
│   │   │   ├── sanitize.ts      # Sanitization
│   │   │   └── constants.ts     # Constants
│   │   │
│   │   ├── hooks/               # Shared hooks
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useAsyncFeedback.ts
│   │   │   └── useMediaQuery.ts
│   │   │
│   │   └── store/               # State management (Zustand)
│   │       ├── authStore.ts
│   │       ├── themeStore.ts
│   │       ├── tenantStore.ts
│   │       └── uiStore.ts
│   │
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── TenantContext.tsx
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts             # Re-export all types
│   │   ├── user.types.ts
│   │   ├── tenant.types.ts
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   │
│   ├── styles/                  # Global styles
│   │   ├── globals.css           # Global CSS
│   │   ├── theme.css            # Theme variables
│   │   └── tailwind.css         # Tailwind imports
│   │
│   ├── assets/                  # Static assets (images, icons)
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── __tests__/               # Frontend tests
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── utils/
│   │
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite type definitions
│
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── tailwind.config.js
```

---

## ⚙️ Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── server.ts                # Express server setup
│   ├── app.ts                   # Express app configuration
│   │
│   ├── config/                  # Configuration files
│   │   ├── database.ts          # Database connection (Prisma)
│   │   ├── env.ts               # Environment variables validation
│   │   ├── permissions.ts       # RBAC permissions definition
│   │   ├── roles.ts             # Role definitions
│   │   └── constants.ts         # Backend constants
│   │
│   ├── middleware/              # Express middleware
│   │   ├── authenticate.ts      # JWT authentication
│   │   ├── authorize.ts         # RBAC authorization
│   │   ├── tenantResolver.ts   # Tenant context resolution
│   │   ├── ensureTenantContext.ts
│   │   ├── verifyTeacherAssignment.ts
│   │   ├── validation.ts        # Request validation
│   │   ├── errorHandler.ts      # Error handling middleware
│   │   ├── logger.ts            # Logging middleware
│   │   └── rateLimiter.ts       # Rate limiting
│   │
│   ├── routes/                  # API route definitions
│   │   ├── index.ts             # Route aggregator
│   │   ├── auth.ts              # Authentication routes
│   │   ├── users.ts             # User management routes
│   │   ├── tenants.ts           # Tenant management routes
│   │   ├── teachers.ts          # Teacher routes
│   │   ├── students.ts          # Student routes
│   │   ├── superuser.ts         # SuperUser routes
│   │   ├── reports.ts            # Report generation routes
│   │   ├── health.ts             # Health check
│   │   └── adminAcademics.ts    # Admin academic routes
│   │
│   ├── controllers/             # Route controllers (business logic)
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── tenantController.ts
│   │   ├── teacherController.ts
│   │   ├── studentController.ts
│   │   ├── superuserController.ts
│   │   └── reportController.ts
│   │
│   ├── services/                # Business logic services
│   │   ├── auth/
│   │   │   ├── authService.ts
│   │   │   ├── authValidation.ts
│   │   │   └── tokenService.ts
│   │   │
│   │   ├── user/
│   │   │   ├── userService.ts
│   │   │   ├── userRegistrationService.ts
│   │   │   ├── adminUserService.ts
│   │   │   └── profileService.ts
│   │   │
│   │   ├── tenant/
│   │   │   ├── tenantService.ts
│   │   │   ├── tenantLookupService.ts
│   │   │   └── tenantManager.ts
│   │   │
│   │   ├── teacher/
│   │   │   ├── teacherService.ts
│   │   │   └── teacherAssignmentService.ts
│   │   │
│   │   ├── student/
│   │   │   ├── studentService.ts
│   │   │   └── studentEnrollmentService.ts
│   │   │
│   │   ├── superuser/
│   │   │   ├── superuserService.ts
│   │   │   └── platformMonitoringService.ts
│   │   │
│   │   ├── report/
│   │   │   ├── reportService.ts
│   │   │   ├── studentReportService.ts
│   │   │   ├── teacherReportService.ts
│   │   │   └── hodReportService.ts
│   │   │
│   │   └── shared/
│   │       └── auditLogService.ts
│   │
│   ├── lib/                     # Shared utilities
│   │   ├── db/                  # Database utilities
│   │   │   ├── pool.ts          # Database connection pool
│   │   │   └── migrations.ts   # Migration helpers
│   │   │
│   │   ├── validation/          # Validation utilities
│   │   │   ├── validators/
│   │   │   │   ├── userValidator.ts
│   │   │   │   ├── teacherValidator.ts
│   │   │   │   ├── studentValidator.ts
│   │   │   │   └── superuserValidator.ts
│   │   │   └── schemas.ts      # Zod schemas
│   │   │
│   │   ├── errors/              # Error handling
│   │   │   ├── ApiError.ts      # Custom error classes
│   │   │   ├── apiErrors.ts     # Error response utilities
│   │   │   └── errorCodes.ts   # Error code constants
│   │   │
│   │   ├── utils/               # General utilities
│   │   │   ├── profileTransformUtils.ts
│   │   │   ├── queryUtils.ts
│   │   │   ├── userUtils.ts
│   │   │   ├── dateUtils.ts
│   │   │   └── stringUtils.ts
│   │   │
│   │   └── envValidation.ts     # Environment validation
│   │
│   ├── db/                      # Database related
│   │   ├── migrations/           # SQL migrations
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_tenants.sql
│   │   │   ├── 003_add_users.sql
│   │   │   └── ...
│   │   │
│   │   ├── seeds/               # Database seeds
│   │   │   └── seed.ts
│   │   │
│   │   ├── tenantManager.ts     # Tenant schema management
│   │   └── prisma/              # Prisma schema and client
│   │       ├── schema.prisma
│   │       └── client.ts
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── user.types.ts
│   │   ├── tenant.types.ts
│   │   ├── auth.types.ts
│   │   └── api.types.ts
│   │
│   └── tests/                   # Backend tests
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── .env.example
├── .env
├── .eslintrc.json
├── .prettierrc
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## 🔄 Shared Structure (`shared/`)

```
shared/
├── types/                       # Shared TypeScript types
│   ├── index.ts                # Re-export all types
│   ├── user.types.ts           # User-related types
│   ├── tenant.types.ts         # Tenant-related types
│   ├── auth.types.ts           # Auth-related types
│   ├── api.types.ts            # API contract types
│   ├── rbac.types.ts           # RBAC types
│   └── common.types.ts         # Common utility types
│
├── constants/                   # Shared constants
│   ├── roles.ts                # Role constants
│   ├── permissions.ts           # Permission constants
│   └── status.ts                # Status constants
│
└── utils/                       # Shared utilities
    ├── validation.ts            # Shared validation
    └── formatting.ts            # Shared formatting
```

---

## 📋 Key Design Decisions

### 1. **DRY (Don't Repeat Yourself)**
- **Shared types** in `shared/types/` to avoid duplication
- **Reusable components** in `components/ui/` and `components/shared/`
- **Module-based organization** in `modules/` for feature isolation
- **Centralized services** in `lib/api/` and `services/`
- **Shared utilities** in `lib/utils/` and `shared/utils/`

### 2. **Modularity**
- **Feature modules** (`modules/auth/`, `modules/admin/`, etc.) for self-contained features
- **Separation of concerns**: pages, components, hooks, services, types
- **Clear boundaries** between frontend, backend, and shared code

### 3. **Scalability**
- **Module-based architecture** allows easy addition of new features
- **Service layer** abstraction for business logic
- **Type-safe** throughout with TypeScript
- **Database migrations** for schema evolution

### 4. **Security-First**
- **RBAC configuration** in `config/permissions.ts` and `lib/rbac/`
- **Middleware chain** for authentication, authorization, tenant resolution
- **Validation layers** at both frontend and backend
- **Error handling** centralized in middleware

### 5. **Responsiveness**
- **Layout components** in `components/layout/` with collapsible sidebar
- **Breakpoint-aware** components using `useMediaQuery` hook
- **Mobile-first** design approach with Tailwind CSS

### 6. **Theme System**
- **Theme configuration** in `lib/theme/`
- **CSS variables** in `styles/theme.css` for dynamic theming
- **Theme toggle** component and hook
- **Color contrast** ensured in theme definitions

### 7. **Multi-Tenant Architecture**
- **Tenant resolution** middleware
- **Tenant context** providers and hooks
- **Schema-per-tenant** database structure
- **Tenant-aware** services and routes

---

## 🎯 Module Organization Principles

### Frontend Modules (`src/modules/`)
Each module contains:
- **hooks/**: Custom React hooks for module-specific logic
- **services/**: API service functions
- **types/**: TypeScript types specific to the module

### Backend Services (`src/services/`)
Grouped by domain:
- **auth/**: Authentication and authorization
- **user/**: User management
- **tenant/**: Tenant management
- **teacher/**: Teacher-specific operations
- **student/**: Student-specific operations
- **superuser/**: Platform-level operations
- **report/**: Report generation

---

## 🔐 RBAC Structure

### Frontend (`src/lib/rbac/`)
- `permissions.ts`: Permission definitions and checking utilities
- `usePermission.ts`: Hook for permission-based UI rendering
- `roleConfig.ts`: Role-to-permission mappings

### Backend (`src/config/`)
- `permissions.ts`: Backend permission definitions
- `roles.ts`: Role definitions and hierarchy

### Shared (`shared/constants/`)
- `roles.ts`: Shared role constants
- `permissions.ts`: Shared permission constants

---

## 🎨 Theme System Structure

### Frontend (`src/lib/theme/`)
- `theme.ts`: Theme configuration and utilities
- `colors.ts`: Color palette definitions (light/dark)
- `useBrand.ts`: Hook for brand colors
- `useTheme.ts`: Hook for theme toggle

### Styles (`src/styles/`)
- `globals.css`: Global styles and CSS reset
- `theme.css`: CSS variables for theming
- `tailwind.css`: Tailwind imports and configuration

---

## 📱 Responsive Layout Structure

### Layout Components (`src/components/layout/`)
- `Layout.tsx`: Main layout wrapper with responsive breakpoints
- `Sidebar.tsx`: Collapsible sidebar (desktop/tablet/mobile)
- `Header.tsx`: Top navigation header
- `ProtectedRoute.tsx`: Route protection with RBAC

### Hooks (`src/lib/hooks/`)
- `useMediaQuery.ts`: Hook for responsive breakpoint detection

---

## 🚀 Next Steps

After folder structure is established:

1. **Initialize packages** (package.json, dependencies)
2. **Set up build tools** (Vite, TypeScript, ESLint, Prettier)
3. **Configure database** (Prisma schema, migrations)
4. **Set up environment variables** (.env files)
5. **Implement base components** (Layout, Sidebar, Theme)
6. **Implement authentication flow**
7. **Implement RBAC middleware**
8. **Set up API layer**

---

**Note**: This structure follows industry best practices and is designed to scale with the application. All paths are relative to their respective root directories (frontend/, backend/, shared/).

