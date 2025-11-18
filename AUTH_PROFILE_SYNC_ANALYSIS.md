# Auth & Profile Pages Sync Analysis

## Current State Analysis

### Components Used

#### Auth Forms (Login/Register)
- **Input Component**: `AuthInput` from `components/auth/fields/AuthInput`
- **Button Component**: `AuthSubmitButton` (wraps `Button` from `ui/Button`)
- **Layout**: `AuthFormLayout` - Full-screen centered layout
- **Hooks**: `useLoginForm`, `useRegisterForm`

#### Profile Pages
- **Input Component**: `Input` from `components/ui/Input`
- **Button Component**: `Button` from `components/ui/Button`
- **Layout**: `ProfileLayout` - Dashboard layout
- **Hooks**: `useProfileData`

### Key Differences

1. **Input Components**:
   - `AuthInput`: Auth-specific styling, password toggle support, larger padding
   - `Input`: General-purpose, simpler styling, used in dashboard context
   - **Issue**: Two similar components with overlapping functionality

2. **Data Structures**:
   - **Registration**: Uses `fullName` (single field)
   - **Profile**: Uses `firstName` and `lastName` (separate fields)
   - **Issue**: Inconsistent naming between registration and profile

3. **Layout Patterns**:
   - **Auth**: Full-screen centered card layout
   - **Profile**: Dashboard layout with sidebar
   - **Status**: ✅ Appropriate for different contexts

### Identified Issues

#### 1. Duplicate Input Components
- `AuthInput` and `Input` have similar functionality
- Both handle labels, errors, helper text
- Could be consolidated into a single base component with variants

#### 2. Inconsistent Field Names
- Registration uses `fullName`
- Profile uses `firstName` + `lastName`
- Backend may need transformation

#### 3. Form Validation Patterns
- Auth forms use `useAuthForm` hook with Zod validation
- Profile pages use inline validation
- Could share validation schemas

## Recommendations

### 1. Consolidate Input Components (DRY)
Create a unified `Input` component with variants:
```typescript
<Input variant="auth" /> // For auth forms
<Input variant="default" /> // For profile/dashboard
```

### 2. Standardize Field Names
- Option A: Use `fullName` everywhere (simpler)
- Option B: Use `firstName` + `lastName` everywhere (more flexible)
- Option C: Support both with transformation layer

### 3. Share Validation Logic
- Extract validation schemas to shared location
- Use same validation rules in registration and profile updates

### 4. Shared Form Utilities
- Create shared form field components
- Share error handling patterns
- Share loading states

## Current Sync Status

### ✅ What's Already Synced
- Both use `Button` from `ui/Button` (via `AuthSubmitButton`)
- Both use same theme system (CSS variables)
- Both use same error handling patterns (toast notifications)
- Both use same API client (`api.ts`)

### ⚠️ What Needs Sync
- Input components (duplicate)
- Field naming (inconsistent)
- Validation patterns (different approaches)

## Action Items

1. **High Priority**: Consolidate Input components
2. **Medium Priority**: Standardize field names
3. **Low Priority**: Share validation schemas

