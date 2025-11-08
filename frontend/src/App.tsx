import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarCheck,
  GraduationCap,
  Home,
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  UserCheck,
  Wallet
} from 'lucide-react';
import { Navbar, type NavigationLink } from './components/ui/Navbar';
import { Sidebar } from './components/ui/Sidebar';
import { useResponsiveSidebar } from './hooks/useResponsiveSidebar';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import type { Role } from './lib/api';

const HomePage = lazy(() => import('./pages'));
const AdminConfigurationPage = lazy(() => import('./pages/AdminConfigurationPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AdminRoleManagementPage = lazy(() => import('./pages/AdminRoleManagementPage'));
const TeacherAttendancePage = lazy(() => import('./pages/TeacherAttendancePage'));
const StudentFeesPage = lazy(() => import('./pages/StudentFeesPage'));
const TeacherGradeEntryPage = lazy(() => import('./pages/TeacherGradeEntryPage'));
const StudentAttendancePage = lazy(() => import('./pages/StudentAttendancePage'));
const StudentResultsPage = lazy(() => import('./pages/StudentResultsPage'));

type ViewKey =
  | 'home'
  | 'admin-config'
  | 'admin-reports'
  | 'admin-roles'
  | 'fees'
  | 'teacher-grades'
  | 'teacher-attendance'
  | 'student-results'
  | 'student-attendance';

function App() {
  const [view, setView] = useState<ViewKey>('home');
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const { user, logout } = useAuth();
  const {
    isOpen,
    isDesktop,
    toggleMobile,
    closeMobile,
    shouldShowOverlay,
    collapsed,
    toggleCollapsed
  } = useResponsiveSidebar();

  useEffect(() => {
    const adminViews: ViewKey[] = ['admin-config', 'admin-reports', 'admin-roles'];
    const teacherViews: ViewKey[] = ['teacher-grades', 'teacher-attendance'];
    const studentViews: ViewKey[] = ['fees', 'student-results', 'student-attendance'];
    const roleViewMap: Record<Role, ViewKey> = {
      superadmin: 'admin-config',
      admin: 'admin-config',
      teacher: 'teacher-grades',
      student: 'student-results'
    };
    if (!user) {
      if (view !== 'home') {
        setView('home');
      }
      return;
    }
    if (
      (adminViews.includes(view) && !['admin', 'superadmin'].includes(user.role)) ||
      (teacherViews.includes(view) && !['teacher', 'admin', 'superadmin'].includes(user.role)) ||
      (studentViews.includes(view) && !['student', 'admin', 'superadmin'].includes(user.role))
    ) {
      setView(roleViewMap[user.role]);
    }
  }, [user, view]);

  const activePage = useMemo(() => {
    switch (view) {
      case 'admin-config':
        return (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminConfigurationPage />
          </ProtectedRoute>
        );
      case 'admin-reports':
        return (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminReportsPage />
          </ProtectedRoute>
        );
      case 'admin-roles':
        return (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminRoleManagementPage />
          </ProtectedRoute>
        );
      case 'fees':
        return (
          <ProtectedRoute allowedRoles={['student', 'admin', 'superadmin']}>
            <StudentFeesPage />
          </ProtectedRoute>
        );
      case 'teacher-grades':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin', 'superadmin']}>
            <TeacherGradeEntryPage />
          </ProtectedRoute>
        );
      case 'teacher-attendance':
        return (
          <ProtectedRoute allowedRoles={['teacher', 'admin', 'superadmin']}>
            <TeacherAttendancePage />
          </ProtectedRoute>
        );
      case 'student-results':
        return (
          <ProtectedRoute allowedRoles={['student', 'admin', 'superadmin']}>
            <StudentResultsPage />
          </ProtectedRoute>
        );
      case 'student-attendance':
        return (
          <ProtectedRoute allowedRoles={['student', 'admin', 'superadmin']}>
            <StudentAttendancePage />
          </ProtectedRoute>
        );
      default:
        return <HomePage mode={authMode} onModeChange={setAuthMode} />;
    }
  }, [view, authMode]);

  const navDefinitions = useMemo(
    () =>
      [
        {
          key: 'home',
          label: 'Landing',
          icon: <Home className="h-5 w-5" />,
          allowedRoles: undefined
        },
        {
          key: 'admin-config',
          label: 'Admin configuration',
          icon: <LayoutDashboard className="h-5 w-5" />,
          allowedRoles: ['admin', 'superadmin']
        },
        {
          key: 'admin-reports',
          label: 'Reports',
          icon: <BarChart3 className="h-5 w-5" />,
          allowedRoles: ['admin', 'superadmin']
        },
        {
          key: 'admin-roles',
          label: 'RBAC manager',
          icon: <ShieldCheck className="h-5 w-5" />,
          allowedRoles: ['admin', 'superadmin']
        },
        {
          key: 'teacher-grades',
          label: 'Teacher grade entry',
          icon: <GraduationCap className="h-5 w-5" />,
          allowedRoles: ['teacher', 'admin', 'superadmin']
        },
        {
          key: 'teacher-attendance',
          label: 'Attendance (Teacher)',
          icon: <UserCheck className="h-5 w-5" />,
          allowedRoles: ['teacher', 'admin', 'superadmin']
        },
        {
          key: 'student-results',
          label: 'Student results',
          icon: <LineChart className="h-5 w-5" />,
          allowedRoles: ['student', 'admin', 'superadmin']
        },
        {
          key: 'student-attendance',
          label: 'Attendance (Student)',
          icon: <CalendarCheck className="h-5 w-5" />,
          allowedRoles: ['student', 'admin', 'superadmin']
        },
        {
          key: 'fees',
          label: 'Student fees',
          icon: <Wallet className="h-5 w-5" />,
          allowedRoles: ['student', 'admin', 'superadmin']
        }
      ] as Array<{ key: ViewKey } & Omit<NavigationLink, 'onSelect' | 'isActive'>>,
    []
  );

  const navLinks: NavigationLink[] = useMemo(() => {
    return navDefinitions
      .filter((definition) => {
        if (!definition.allowedRoles) return true;
        if (!user) return false;
        return definition.allowedRoles.includes(user.role);
      })
      .map((definition) => ({
        label: definition.label,
        icon: definition.icon,
        allowedRoles: definition.allowedRoles,
        isActive: view === definition.key,
        onSelect: () => {
          setAuthMode(null);
          setView(definition.key);
        }
      }));
  }, [navDefinitions, user, view]);

  const isAdminView = view !== 'home';

  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300"
          role="status"
        >
          Loading application…
        </div>
      }
    >
      <div className="min-h-screen bg-[var(--brand-surface, #0f172a)] text-[var(--brand-surface-contrast,#f1f5f9)] transition-colors duration-300">
        <Navbar
          brandName="SaaS School Portal"
          brandSubtitle="Multi-tenant school experience"
          links={navLinks}
          onToggleSidebar={toggleMobile}
          sidebarOpen={isOpen}
          user={user}
          onLogout={logout}
          onShowAuthPanel={() => {
            setView('home');
            setAuthMode('login');
          }}
        />

        <div className="relative mx-auto flex w-full max-w-[1400px] gap-4 px-2 sm:px-4">
          <div
            className={`fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition-opacity sm:hidden ${
              shouldShowOverlay
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={!shouldShowOverlay}
            onClick={closeMobile}
          />
          {navLinks.length > 0 && (
            <Sidebar
              links={navLinks}
              open={isOpen}
              onClose={closeMobile}
              collapsed={collapsed}
              onCollapsedToggle={toggleCollapsed}
              isDesktop={isDesktop}
            />
          )}
          <main
            className={`relative z-10 flex-1 py-6 ${isDesktop ? 'px-6' : 'px-2 sm:px-4'} transition-all duration-300`}
          >
            {isAdminView ? <div className="space-y-6">{activePage}</div> : activePage}
          </main>
        </div>

        {!isAdminView ? null : (
          <footer className="border-t border-[var(--brand-border)] bg-[var(--brand-surface)]/80 py-6 text-center text-xs text-[var(--brand-muted)] backdrop-blur">
            <div className="mx-auto max-w-6xl px-4">
              Built for responsive multi-tenant schools · Keyboard accessible · Powered by schema
              isolation
            </div>
          </footer>
        )}
      </div>
    </Suspense>
  );
}

export default App;
