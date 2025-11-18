# Component Documentation

This document provides comprehensive documentation for all frontend components in the SaaS School Management System.

## Table of Contents

- [UI Components](#ui-components)
- [Layout Components](#layout-components)
- [Auth Components](#auth-components)
- [Admin Components](#admin-components)
- [Chart Components](#chart-components)
- [Profile Components](#profile-components)
- [Protected Route](#protected-route)

---

## UI Components

### Button (`src/components/ui/Button.tsx`)

A reusable button component with multiple variants and sizes.

**Props:**
- `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`
- `size`: `'sm' | 'md' | 'lg'`
- `disabled`: `boolean`
- `loading`: `boolean`
- `children`: `ReactNode`
- `onClick`: `() => void`
- `type`: `'button' | 'submit' | 'reset'`

**Usage:**
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

### Input (`src/components/ui/Input.tsx`)

A styled input field component with error handling.

**Props:**
- `type`: `string` (HTML input types)
- `label`: `string`
- `error`: `string | undefined`
- `required`: `boolean`
- `placeholder`: `string`
- `value`: `string`
- `onChange`: `(e: ChangeEvent<HTMLInputElement>) => void`

**Usage:**
```tsx
<Input
  type="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>
```

### Modal (`src/components/ui/Modal.tsx`)

A reusable modal dialog component.

**Props:**
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `title`: `string`
- `children`: `ReactNode`
- `size`: `'sm' | 'md' | 'lg' | 'xl'`

**Usage:**
```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action">
  <p>Are you sure?</p>
</Modal>
```

### Table (`src/components/ui/Table.tsx`)

A data table component with sorting and pagination support.

**Props:**
- `columns`: `ColumnDef[]`
- `data`: `any[]`
- `onRowClick`: `(row: any) => void` (optional)
- `loading`: `boolean`

**Usage:**
```tsx
<Table
  columns={columns}
  data={students}
  onRowClick={(row) => navigate(`/students/${row.id}`)}
/>
```

### Select (`src/components/ui/Select.tsx`)

A styled select dropdown component.

**Props:**
- `options`: `Array<{ value: string; label: string }>`
- `value`: `string`
- `onChange`: `(value: string) => void`
- `label`: `string`
- `placeholder`: `string`

**Usage:**
```tsx
<Select
  label="Role"
  options={roleOptions}
  value={selectedRole}
  onChange={setSelectedRole}
/>
```

### Card (`src/components/ui/Card.tsx`)

A container component for grouping related content.

**Props:**
- `title`: `string` (optional)
- `children`: `ReactNode`
- `className`: `string` (optional)

**Usage:**
```tsx
<Card title="Student Information">
  <p>Content here</p>
</Card>
```

### StatusBadge (`src/components/ui/StatusBadge.tsx`)

A badge component for displaying status indicators.

**Props:**
- `status`: `'active' | 'pending' | 'suspended' | 'inactive'`
- `children`: `ReactNode`

**Usage:**
```tsx
<StatusBadge status="active">Active</StatusBadge>
```

### Sidebar (`src/components/ui/Sidebar.tsx`)

A collapsible sidebar navigation component.

**Props:**
- `links`: `SidebarLink[]`
- `isCollapsed`: `boolean`
- `onToggleCollapse`: `() => void`
- `currentPath`: `string`

**Usage:**
```tsx
<Sidebar
  links={sidebarLinks}
  isCollapsed={isCollapsed}
  onToggleCollapse={toggleCollapse}
  currentPath={location.pathname}
/>
```

### Navbar (`src/components/ui/Navbar.tsx`)

Top navigation bar component.

**Props:**
- `user`: `User | null`
- `onLogout`: `() => void`
- `brandName`: `string`

**Usage:**
```tsx
<Navbar user={user} onLogout={handleLogout} brandName="School Portal" />
```

### BrandProvider (`src/components/ui/BrandProvider.tsx`)

Context provider for tenant branding configuration.

**Props:**
- `children`: `ReactNode`

**Exports:**
- `useBrand()`: Hook to access branding configuration

**Usage:**
```tsx
<BrandProvider>
  <App />
</BrandProvider>

// In component:
const { primaryColor, logoUrl, refresh } = useBrand();
```

### ThemeToggle (`src/components/ui/ThemeToggle.tsx`)

Toggle component for switching between light and dark themes.

**Props:**
- `className`: `string` (optional)

**Usage:**
```tsx
<ThemeToggle />
```

### AvatarDropdown (`src/components/ui/AvatarDropdown.tsx`)

Dropdown menu component for user avatar with profile/logout options.

**Props:**
- `user`: `User`
- `onLogout`: `() => void`
- `onProfileClick`: `() => void`

**Usage:**
```tsx
<AvatarDropdown
  user={user}
  onLogout={handleLogout}
  onProfileClick={() => navigate('/profile')}
/>
```

### DashboardSkeleton (`src/components/ui/DashboardSkeleton.tsx`)

Loading skeleton component for dashboard pages.

**Props:**
- `variant`: `'default' | 'table' | 'form'`

**Usage:**
```tsx
<DashboardSkeleton variant="table" />
```

### SearchBar (`src/components/ui/SearchBar.tsx`)

Search input component with debouncing.

**Props:**
- `onSearch`: `(query: string) => void`
- `placeholder`: `string`
- `debounceMs`: `number` (default: 300)

**Usage:**
```tsx
<SearchBar
  onSearch={handleSearch}
  placeholder="Search students..."
/>
```

### Notifications (`src/components/ui/Notifications.tsx`)

Notification toast component using Sonner.

**Usage:**
```tsx
import { toast } from 'sonner';

toast.success('Operation successful');
toast.error('Operation failed');
```

---

## Layout Components

### LandingShell (`src/layouts/LandingShell.tsx`)

Layout wrapper for public/marketing pages.

**Features:**
- Landing header with navigation
- Footer
- No authentication required

**Usage:**
```tsx
<Route path="/" element={<LandingShell />}>
  <Route index element={<HomePage />} />
</Route>
```

### AdminShell (`src/layouts/AdminShell.tsx`)

Layout wrapper for authenticated dashboard pages.

**Props:**
- `user`: `User | null`
- `onLogout`: `() => void`
- `children`: `ReactNode`

**Features:**
- Dashboard header with branding
- Collapsible sidebar
- Theme toggle
- Avatar dropdown

**Usage:**
```tsx
<AdminShell user={user} onLogout={handleLogout}>
  <Outlet />
</AdminShell>
```

### DashboardHeader (`src/components/layout/DashboardHeader.tsx`)

Header component for dashboard pages.

**Props:**
- `title`: `string`
- `description`: `string` (optional)
- `user`: `User | null`
- `onLogout`: `() => void`

**Usage:**
```tsx
<DashboardHeader
  title="Student Management"
  description="Manage all students"
  user={user}
  onLogout={handleLogout}
/>
```

### RouteMeta (`src/components/layout/RouteMeta.tsx`)

Component for setting page metadata (title, description).

**Props:**
- `title`: `string`
- `description`: `string` (optional)
- `children`: `ReactNode`

**Usage:**
```tsx
<RouteMeta title="Dashboard" description="Overview of your school">
  <DashboardContent />
</RouteMeta>
```

### LandingHeader (`src/components/layout/LandingHeader.tsx`)

Header component for landing pages.

**Props:**
- `onLoginClick`: `() => void`
- `onRegisterClick`: `() => void`

**Usage:**
```tsx
<LandingHeader
  onLoginClick={() => navigate('/auth/login')}
  onRegisterClick={() => navigate('/auth/register')}
/>
```

### LandingFooter (`src/components/layout/LandingFooter.tsx`)

Footer component for landing pages.

**Usage:**
```tsx
<LandingFooter />
```

---

## Auth Components

### LoginForm (`src/components/auth/LoginForm.tsx`)

Login form component with validation.

**Props:**
- `onSuccess`: `() => void`
- `onError`: `(error: string) => void`

**Usage:**
```tsx
<LoginForm
  onSuccess={() => navigate('/dashboard')}
  onError={(error) => toast.error(error)}
/>
```

### RegisterForm (`src/components/auth/RegisterForm.tsx`)

Registration form component with role selection.

**Props:**
- `onSuccess`: `() => void`
- `onError`: `(error: string) => void`

**Usage:**
```tsx
<RegisterForm
  onSuccess={() => toast.success('Registration successful')}
  onError={(error) => toast.error(error)}
/>
```

### AuthModal (`src/components/auth/AuthModal.tsx`)

Modal wrapper for authentication forms.

**Props:**
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `mode`: `'login' | 'register'`

**Usage:**
```tsx
<AuthModal
  isOpen={showAuth}
  onClose={() => setShowAuth(false)}
  mode="login"
/>
```

### AuthPanel (`src/components/auth/AuthPanel.tsx`)

Panel component for authentication UI.

**Props:**
- `mode`: `'login' | 'register'`
- `onModeChange`: `(mode: 'login' | 'register') => void`

**Usage:**
```tsx
<AuthPanel
  mode={authMode}
  onModeChange={setAuthMode}
/>
```

### AuthFormLayout (`src/components/auth/layout/AuthFormLayout.tsx`)

Layout wrapper for authentication forms.

**Props:**
- `title`: `string`
- `subtitle`: `string`
- `children`: `ReactNode`

**Usage:**
```tsx
<AuthFormLayout title="Login" subtitle="Welcome back">
  <LoginForm />
</AuthFormLayout>
```

### Auth Input Components

Located in `src/components/auth/fields/`:

- **AuthInput**: Styled input for auth forms
- **AuthSelect**: Styled select for auth forms
- **AuthMultiSelect**: Multi-select component
- **AuthDatePicker**: Date picker component
- **AuthSubmitButton**: Submit button with loading state
- **AuthErrorBanner**: Error message display
- **AuthSuccessBanner**: Success message display
- **TenantSelector**: Component for selecting tenant during registration

---

## Admin Components

### ManagementPageLayout (`src/components/admin/ManagementPageLayout.tsx`)

Layout component for admin management pages.

**Props:**
- `title`: `string`
- `description`: `string`
- `actions`: `ReactNode` (optional)
- `children`: `ReactNode`

**Usage:**
```tsx
<ManagementPageLayout
  title="Students"
  description="Manage all students"
  actions={<Button>Add Student</Button>}
>
  <StudentsTable />
</ManagementPageLayout>
```

### PaginatedTable (`src/components/admin/PaginatedTable.tsx`)

Table component with built-in pagination.

**Props:**
- `columns`: `ColumnDef[]`
- `data`: `any[]`
- `totalCount`: `number`
- `page`: `number`
- `pageSize`: `number`
- `onPageChange`: `(page: number) => void`
- `onPageSizeChange`: `(size: number) => void`

**Usage:**
```tsx
<PaginatedTable
  columns={columns}
  data={students}
  totalCount={total}
  page={currentPage}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

### FilterSection (`src/components/admin/FilterSection.tsx`)

Filter UI component for admin pages.

**Props:**
- `filters`: `FilterConfig[]`
- `onFilterChange`: `(filters: Record<string, any>) => void`
- `onReset`: `() => void`

**Usage:**
```tsx
<FilterSection
  filters={filterConfigs}
  onFilterChange={handleFilterChange}
  onReset={resetFilters}
/>
```

### ExportButtons (`src/components/admin/ExportButtons.tsx`)

Export functionality component.

**Props:**
- `onExportCSV`: `() => void`
- `onExportPDF`: `() => void`
- `disabled`: `boolean`

**Usage:**
```tsx
<ExportButtons
  onExportCSV={handleCSVExport}
  onExportPDF={handlePDFExport}
/>
```

### AdminUserRegistrationModal (`src/components/admin/AdminUserRegistrationModal.tsx`)

Modal for admin to register new users.

**Props:**
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `onSuccess`: `() => void`

**Usage:**
```tsx
<AdminUserRegistrationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={refreshUsers}
/>
```

---

## Chart Components

### BarChart (`src/components/charts/BarChart.tsx`)

Bar chart component using Chart.js or similar.

**Props:**
- `data`: `ChartData`
- `options`: `ChartOptions`
- `title`: `string` (optional)

**Usage:**
```tsx
<BarChart
  data={chartData}
  options={chartOptions}
  title="Attendance by Class"
/>
```

### LineChart (`src/components/charts/LineChart.tsx`)

Line chart component.

**Props:**
- `data`: `ChartData`
- `options`: `ChartOptions`
- `title`: `string` (optional)

**Usage:**
```tsx
<LineChart
  data={trendData}
  options={chartOptions}
  title="Performance Trends"
/>
```

### PieChart (`src/components/charts/PieChart.tsx`)

Pie chart component.

**Props:**
- `data`: `ChartData`
- `options`: `ChartOptions`
- `title`: `string` (optional)

**Usage:**
```tsx
<PieChart
  data={distributionData}
  options={chartOptions}
  title="Grade Distribution"
/>
```

### StatCard (`src/components/charts/StatCard.tsx`)

Card component for displaying statistics.

**Props:**
- `title`: `string`
- `value`: `string | number`
- `change`: `number` (optional, percentage change)
- `icon`: `ReactNode` (optional)

**Usage:**
```tsx
<StatCard
  title="Total Students"
  value={150}
  change={5.2}
  icon={<Users />}
/>
```

---

## Profile Components

### ProfileLayout (`src/components/profile/ProfileLayout.tsx`)

Layout component for profile pages.

**Props:**
- `children`: `ReactNode`
- `tabs`: `TabConfig[]`

**Usage:**
```tsx
<ProfileLayout tabs={profileTabs}>
  <ProfileContent />
</ProfileLayout>
```

### ProfileSection (`src/components/profile/ProfileSection.tsx`)

Section component within profile pages.

**Props:**
- `title`: `string`
- `children`: `ReactNode`

**Usage:**
```tsx
<ProfileSection title="Personal Information">
  <ProfileForm />
</ProfileSection>
```

### ActivityHistory (`src/components/profile/ActivityHistory.tsx`)

Component for displaying user activity history.

**Props:**
- `userId`: `string`
- `limit`: `number` (optional)

**Usage:**
```tsx
<ActivityHistory userId={user.id} limit={10} />
```

### AuditLogs (`src/components/profile/AuditLogs.tsx`)

Component for displaying audit logs.

**Props:**
- `userId`: `string`
- `filters`: `AuditFilters` (optional)

**Usage:**
```tsx
<AuditLogs userId={user.id} filters={{ action: 'login' }} />
```

### FileUploads (`src/components/profile/FileUploads.tsx`)

File upload component for profile.

**Props:**
- `onUpload`: `(file: File) => Promise<void>`
- `acceptedTypes`: `string[]`
- `maxSize`: `number` (bytes)

**Usage:**
```tsx
<FileUploads
  onUpload={handleFileUpload}
  acceptedTypes={['image/jpeg', 'image/png']}
  maxSize={5 * 1024 * 1024}
/>
```

---

## Protected Route

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)

Route protection component with role-based access control.

**Props:**
- `allowedRoles`: `Role[]` (optional)
- `requiredPermissions`: `Permission[]` (optional)
- `fallback`: `ReactNode` (rendered if access denied)
- `loadingFallback`: `ReactNode` (rendered while checking auth)
- `children`: `ReactNode`

**Usage:**
```tsx
<ProtectedRoute
  allowedRoles={['admin', 'superadmin']}
  requiredPermissions={['users:manage']}
  fallback={<Navigate to="/not-authorized" />}
>
  <AdminPage />
</ProtectedRoute>
```

---

## Component Best Practices

1. **Props Interface**: Always define TypeScript interfaces for component props
2. **Error Handling**: Use error boundaries and display user-friendly error messages
3. **Loading States**: Show loading indicators during async operations
4. **Accessibility**: Use semantic HTML and ARIA attributes
5. **Responsive Design**: Ensure components work on mobile and desktop
6. **Theme Support**: Use CSS variables for theming via BrandProvider
7. **Performance**: Use React.memo for expensive components
8. **Testing**: Write unit tests for all components

---

## Component Testing

All components should have corresponding test files in `src/__tests__/` or `src/components/**/__tests__/`.

Example test structure:
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

