# Login & Registration Sync Fixes

## Issues Found and Fixed

### 1. **Double Session Initialization** ✅ FIXED
**Problem:** 
- `authApi.login()` was calling `initialiseSession()` 
- Then `AuthContext.login()` was also calling `initialiseSession()`
- This caused double initialization and potential race conditions

**Fix:**
- Removed `initialiseSession()` calls from `authApi.login()` and `authApi.register()`
- Let `AuthContext` handle session initialization after status validation
- This ensures proper flow: API call → Status check → Session init

### 2. **Error Handling Improvements** ✅ FIXED
**Problem:**
- Error extraction was too simplistic
- Didn't handle all error response formats
- Missing error logging for debugging

**Fix:**
- Enhanced `extractError()` to check multiple error message locations (`message`, `error`)
- Added error logging in dev mode
- Improved error handling in LoginForm and RegisterForm
- Added response validation in AuthContext

### 3. **Response Validation** ✅ ADDED
**Problem:**
- No validation of API response structure
- Could fail silently if response was malformed

**Fix:**
- Added response validation in `AuthContext.login()` and `AuthContext.register()`
- Checks for required fields: `auth`, `auth.user`, `auth.accessToken`
- Throws descriptive error if response is invalid

### 4. **Better Error Messages** ✅ IMPROVED
**Problem:**
- Generic error messages didn't help debugging
- No context about what failed

**Fix:**
- Added console.error logging at each layer:
  - `[LoginForm]` - Form-level errors
  - `[AuthContext]` - Context-level errors
  - `[api]` - API-level errors
- Better error message extraction from various response formats

## Data Flow (Fixed)

### Login Flow:
1. **LoginForm** → Calls `AuthContext.login()`
2. **AuthContext** → Calls `authApi.login()` (no session init)
3. **authApi** → Makes API call to `/auth/login`
4. **Backend** → Returns `AuthResponse` with user data
5. **AuthContext** → Validates response structure
6. **AuthContext** → Normalizes user and checks status
7. **AuthContext** → If active: initializes session, sets user state
8. **AuthContext** → If inactive: clears session, throws error
9. **LoginForm** → Shows error message to user

### Registration Flow:
1. **RegisterForm** → Calls `AuthContext.register()`
2. **AuthContext** → Calls `authApi.register()` (no session init)
3. **authApi** → Makes API call to `/auth/signup`
4. **Backend** → Returns `AuthResponse` with user data
5. **AuthContext** → Validates response structure
6. **AuthContext** → Normalizes user and checks status
7. **AuthContext** → If active: initializes session, sets user state
8. **AuthContext** → If inactive: clears session, returns response (no error)
9. **RegisterForm** → Handles pending status appropriately

## Backend-Frontend Contract

### Request Format:
```typescript
// Login
POST /auth/login
{
  email: string;
  password: string;
}

// Registration
POST /auth/signup
{
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'hod' | 'admin' | 'superadmin';
  tenantId?: string;
  tenantName?: string; // Only for admin creating new tenant
}
```

### Response Format:
```typescript
// Success (200/201)
{
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    role: Role;
    tenantId: string | null;
    isVerified: boolean;
    status: 'pending' | 'active' | 'suspended' | 'rejected';
  }
}

// Error (400/401/500)
{
  message: string;
  // In dev mode:
  error?: string;
  stack?: string;
  diagnostics?: LoginDiagnostics;
}
```

## Testing Checklist

- [ ] Login with valid credentials → Should succeed
- [ ] Login with invalid credentials → Should show "Invalid credentials"
- [ ] Login with pending account → Should show "Account pending admin approval"
- [ ] Login with suspended account → Should show "Account inactive"
- [ ] Registration with valid data → Should succeed or show pending message
- [ ] Registration with existing email → Should show "User already exists"
- [ ] Network error → Should show connection error message
- [ ] Server error (500) → Should show error message (with details in dev mode)

## Debugging

If login/registration still fails:

1. **Check Browser Console:**
   - Look for `[LoginForm]`, `[AuthContext]`, or `[api]` prefixed errors
   - Check Network tab for actual API response

2. **Check Backend Console:**
   - Look for `[auth]` prefixed errors
   - Check for diagnostic information in error responses

3. **Check Network Tab:**
   - Verify request payload format
   - Check response status code
   - Inspect response body for error details

4. **Verify API Base URL:**
   - Check `VITE_API_BASE_URL` environment variable
   - Default: `http://127.0.0.1:3001`

