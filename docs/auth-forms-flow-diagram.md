# Login & Registration Forms - Flow Diagrams

## Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
│                    (Browser - Login Page)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1. User enters email & password
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         LoginForm.tsx                            │
│  • Email input (sanitized, lowercased)                          │
│  • Password input (masked)                                      │
│  • Client-side validation (required fields)                     │
│  • Error display                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 2. Form submission
                             │    { email, password }
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AuthContext.tsx                             │
│  • setIsLoading(true)                                           │
│  • Calls authApi.login()                                        │
│  • Validates response structure                                 │
│  • Normalizes user status                                       │
│  • Checks if user is active                                     │
│  • If active: initializes session, sets user                    │
│  • If inactive: clears session, throws error                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 3. API call
                             │    POST /auth/login
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         api.ts                                   │
│  • apiFetch('/auth/login', { method: 'POST', body })            │
│  • Error extraction (checks message, error fields)              │
│  • Returns AuthResponse (does NOT initialize session)           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 4. HTTP Request
                             │    { email, password }
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend: /auth/login                          │
│  • Rate limiting check (20 req/min)                             │
│  • Input validation (email, password required)                  │
│  • Calls authService.login()                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 5. Service call
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  authService.login()                             │
│  • Get database pool                                            │
│  • Normalize email (lowercase)                                  │
│  • Find user by email                                           │
│  • Verify password (argon2)                                     │
│  • Generate access token (JWT)                                  │
│  • Generate refresh token (JWT)                                 │
│  • Store refresh token (hashed)                                 │
│  • Record login event (non-blocking)                            │
│  • Return AuthResponse                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 6. Response
                             │    { accessToken, refreshToken, user }
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AuthContext.tsx                               │
│  • Validates response (auth, auth.user, auth.accessToken)       │
│  • Normalizes user status                                       │
│  • Checks if user is active                                     │
│  • If active:                                                    │
│    - initialiseSession(auth)                                    │
│    - setTenant(user.tenantId)                                   │
│    - setUser(user)                                              │
│  • If inactive:                                                  │
│    - clearSession()                                             │
│    - setUser(null)                                              │
│    - throw Error('Account pending/inactive')                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 7. Success/Error
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         LoginForm.tsx                            │
│  • If success: onSuccess() → navigate to dashboard              │
│  • If error: display error message                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 8. Navigation
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  • useEffect detects authenticated user                         │
│  • Navigates to role-specific dashboard                         │
└─────────────────────────────────────────────────────────────────┘
```

## Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
│                   (Browser - Register Page)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1. User enters name, email, password
                             │    (and tenant name if admin)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RegisterForm.tsx                            │
│  • Name input (sanitized)                                       │
│  • Email input (sanitized, lowercased)                          │
│  • Password input (masked, min 6 chars)                         │
│  • Tenant name input (if admin creating tenant)                 │
│  • Client-side validation                                       │
│  • Error display                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 2. Form submission
                             │    { email, password, role, tenantId/tenantName }
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AuthContext.tsx                             │
│  • setIsLoading(true)                                           │
│  • Calls authApi.register()                                     │
│  • Validates response structure                                 │
│  • Normalizes user status                                       │
│  • If active: initializes session, sets user                    │
│  • If inactive: clears session, returns response                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 3. API call
                             │    POST /auth/signup
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         api.ts                                   │
│  • apiFetch('/auth/signup', { method: 'POST', body })           │
│  • Error extraction                                             │
│  • Returns AuthResponse (does NOT initialize session)           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 4. HTTP Request
                             │    { email, password, role, tenantId, tenantName? }
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend: /auth/signup                          │
│  • Rate limiting check (20 req/min)                             │
│  • Input validation (email, password, role required)            │
│  • Calls authService.signUp()                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 5. Service call
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  authService.signUp()                            │
│  • Get database pool                                            │
│  • Normalize email (lowercase)                                  │
│  • Check if user exists                                         │
│  • Resolve tenant:                                              │
│    - Superadmin: tenantId = null                                │
│    - Admin + tenantName: Create new tenant                      │
│    - Admin + tenantId: Use existing tenant                      │
│    - Other roles: Require tenantId                              │
│  • Determine user status:                                       │
│    - Superadmin: 'active'                                       │
│    - Admin + tenantName: 'active'                               │
│    - Admin + tenantId: 'pending'                                │
│    - Other roles: 'pending'                                     │
│  • Create user (userService.createUser())                       │
│  • Generate tokens (JWT)                                        │
│  • Store refresh token                                          │
│  • Create email verification token                              │
│  • Return AuthResponse                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 6. Response
                             │    { accessToken, refreshToken, user }
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AuthContext.tsx                               │
│  • Validates response                                           │
│  • Normalizes user status                                       │
│  • If active:                                                    │
│    - initialiseSession(auth)                                    │
│    - setTenant(user.tenantId)                                   │
│    - setUser(user)                                              │
│  • If inactive:                                                  │
│    - clearSession()                                             │
│    - setUser(null)                                              │
│    - return auth (no error)                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 7. Success/Error
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RegisterForm.tsx                            │
│  • If active: onSuccess() → navigate to dashboard               │
│  • If pending: onPending() → show pending message               │
│  • If error: display error message                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 8. Navigation/Message
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RegisterPage.tsx                            │
│  • Shows success toast (if active)                              │
│  • Shows pending toast (if pending)                             │
│  • Navigates to dashboard (if active)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App.tsx
  ├── Routes
  │     ├── /auth/login → LoginPage
  │     │                     └── AuthPanel (mode="login")
  │     │                           └── LoginForm
  │     │                                 └── AuthContext.login()
  │     │                                       └── authApi.login()
  │     │                                             └── POST /auth/login
  │     │
  │     └── /auth/register → RegisterPage
  │                             └── AuthPanel (mode="register")
  │                                   └── RegisterForm
  │                                         └── AuthContext.register()
  │                                               └── authApi.register()
  │                                                     └── POST /auth/signup
  │
  └── Protected Routes
        └── /dashboard/* → ProtectedRoute
                              └── Role-specific dashboards
```

## Data Flow Diagram

```
┌──────────────┐
│  Frontend    │
│  Components  │
└──────┬───────┘
       │
       │ 1. User Input
       │    { email, password, ... }
       │
       ▼
┌──────────────┐
│  AuthContext │
│  (State Mgmt)│
└──────┬───────┘
       │
       │ 2. API Call
       │    authApi.login/register()
       │
       ▼
┌──────────────┐
│  api.ts      │
│  (API Client)│
└──────┬───────┘
       │
       │ 3. HTTP Request
       │    POST /auth/login or /auth/signup
       │
       ▼
┌──────────────┐
│  Backend API │
│  /auth/*     │
└──────┬───────┘
       │
       │ 4. Rate Limiting
       │    (20 req/min)
       │
       ▼
┌──────────────┐
│  authService │
│  (Business   │
│   Logic)     │
└──────┬───────┘
       │
       │ 5. Database Operations
       │    - Find user
       │    - Verify password
       │    - Create user (if register)
       │    - Generate tokens
       │    - Store tokens
       │
       ▼
┌──────────────┐
│  Database    │
│  (PostgreSQL)│
└──────┬───────┘
       │
       │ 6. Response
       │    { accessToken, refreshToken, user }
       │
       ▼
┌──────────────┐
│  AuthContext │
│  (Response   │
│   Handling)  │
└──────┬───────┘
       │
       │ 7. Session Initialization
       │    (if user is active)
       │
       ▼
┌──────────────┐
│  Frontend    │
│  (Navigation)│
└──────────────┘
```

## Error Flow Diagram

```
┌──────────────┐
│  User Action │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Form Submit │
└──────┬───────┘
       │
       │ Error Scenarios:
       │
       ├─► Network Error
       │   └──► api.ts: extractError()
       │       └──► AuthContext: throw Error()
       │           └──► Form: display error
       │
       ├─► Validation Error (400)
       │   └──► Backend: return 400
       │       └──► api.ts: extractError()
       │           └──► AuthContext: throw Error()
       │               └──► Form: display error
       │
       ├─► Auth Error (401)
       │   └──► Backend: return 401
       │       └──► api.ts: extractError()
       │           └──► AuthContext: throw Error()
       │               └──► Form: display "Invalid credentials"
       │
       ├─► Server Error (500)
       │   └──► Backend: return 500
       │       └──► api.ts: extractError()
       │           └──► AuthContext: throw Error()
       │               └──► Form: display error (with stack in dev)
       │
       └─► Inactive User
           └──► AuthContext: check status
               └──► If not active: clearSession(), throw Error()
                   └──► Form: display "Account pending/inactive"
```

## Session Initialization Flow

```
┌──────────────┐
│  AuthContext │
│  .login()    │
└──────┬───────┘
       │
       │ 1. Get AuthResponse
       │    { accessToken, refreshToken, user }
       │
       ▼
┌──────────────┐
│  Validate    │
│  Response    │
└──────┬───────┘
       │
       │ 2. Check structure
       │    - auth exists?
       │    - auth.user exists?
       │    - auth.accessToken exists?
       │
       ▼
┌──────────────┐
│  Normalize   │
│  User Status │
└──────┬───────┘
       │
       │ 3. Ensure status exists
       │    - Default to 'active' if missing
       │
       ▼
┌──────────────┐
│  Check Status│
└──────┬───────┘
       │
       ├─► Active? ───► Initialize Session
       │                    ├──► initialiseSession(auth)
       │                    │       ├──► Set accessToken
       │                    │       ├──► Set refreshToken
       │                    │       ├──► Set tenantId
       │                    │       └──► Schedule token refresh
       │                    ├──► setTenant(user.tenantId)
       │                    └──► setUser(user)
       │
       └─► Inactive? ──► Clear Session
                           ├──► clearSession()
                           │       ├──► Clear accessToken
                           │       ├──► Clear refreshToken
                           │       ├──► Clear tenantId
                           │       └──► Clear refresh timer
                           ├──► setUser(null)
                           └──► throw Error('Account pending/inactive')
```

---

## Key Integration Points

### 1. Frontend → Backend API
- **Endpoint:** `POST /auth/login` or `POST /auth/signup`
- **Headers:** `Content-Type: application/json`
- **Body:** `{ email, password, role?, tenantId?, tenantName? }`
- **Response:** `{ accessToken, refreshToken, expiresIn, user }`

### 2. Backend API → Database
- **Connection:** PostgreSQL pool
- **Tables:** `shared.users`, `shared.refresh_tokens`, `shared.tenants`
- **Operations:** SELECT, INSERT, UPDATE
- **Security:** Parameterized queries (SQL injection prevention)

### 3. Token Management
- **Access Token:** JWT, 15 minutes TTL
- **Refresh Token:** JWT, 7 days TTL, stored hashed in database
- **Storage:** Frontend localStorage (refresh token), memory (access token)
- **Refresh:** Automatic via `scheduleTokenRefresh()`

### 4. Error Handling
- **Frontend:** Multiple layers (Form → Context → API → Backend)
- **Backend:** Service → Route → Error Handler
- **Logging:** Console errors in dev mode, structured logging
- **User Messages:** User-friendly error messages

---

**Last Updated:** 2025-11-14

