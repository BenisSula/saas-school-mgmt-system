import React, { useMemo, useState } from 'react';
import { BarChart3, GraduationCap, Home, LayoutDashboard, LineChart, ShieldCheck, Wallet } from 'lucide-react';
import HomePage from './pages';
import AdminConfigurationPage from './pages/AdminConfigurationPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminRoleManagementPage from './pages/AdminRoleManagementPage';
import StudentFeesPage from './pages/StudentFeesPage';
import TeacherGradeEntryPage from './pages/TeacherGradeEntryPage';
import StudentResultsPage from './pages/StudentResultsPage';
import { Navbar, type NavigationLink } from './components/ui/Navbar';
import { Sidebar } from './components/ui/Sidebar';
import { useResponsiveSidebar } from './hooks/useResponsiveSidebar';

type ViewKey =
  | 'home'
  | 'admin-config'
  | 'admin-reports'
  | 'admin-roles'
  | 'fees'
  | 'teacher-grades'
  | 'student-results';

function App() {
  const [view, setView] = useState<ViewKey>('home');
  const { isOpen, isDesktop, toggleMobile, closeMobile, shouldShowOverlay, collapsed, toggleCollapsed } =
    useResponsiveSidebar();

  const activePage = useMemo(() => {
    switch (view) {
      case 'admin-config':
        return <AdminConfigurationPage />;
      case 'admin-reports':
        return <AdminReportsPage />;
      case 'admin-roles':
        return <AdminRoleManagementPage />;
      case 'fees':
        return <StudentFeesPage />;
      case 'teacher-grades':
        return <TeacherGradeEntryPage />;
      case 'student-results':
        return <StudentResultsPage />;
      default:
        return <HomePage />;
    }
  }, [view]);

  const navLinks: NavigationLink[] = useMemo(
    () => [
      {
        label: 'Landing',
        icon: <Home className="h-5 w-5" />,
        onSelect: () => setView('home'),
        isActive: view === 'home'
      },
      {
        label: 'Admin configuration',
        icon: <LayoutDashboard className="h-5 w-5" />,
        onSelect: () => setView('admin-config'),
        isActive: view === 'admin-config'
      },
      {
        label: 'Reports',
        icon: <BarChart3 className="h-5 w-5" />,
        onSelect: () => setView('admin-reports'),
        isActive: view === 'admin-reports'
      },
      {
        label: 'RBAC manager',
        icon: <ShieldCheck className="h-5 w-5" />,
        onSelect: () => setView('admin-roles'),
        isActive: view === 'admin-roles'
      },
      {
        label: 'Teacher grade entry',
        icon: <GraduationCap className="h-5 w-5" />,
        onSelect: () => setView('teacher-grades'),
        isActive: view === 'teacher-grades'
      },
      {
        label: 'Student results',
        icon: <LineChart className="h-5 w-5" />,
        onSelect: () => setView('student-results'),
        isActive: view === 'student-results'
      },
      {
        label: 'Student fees',
        icon: <Wallet className="h-5 w-5" />,
        onSelect: () => setView('fees'),
        isActive: view === 'fees'
      }
    ],
    [view]
  );

  const isAdminView = view !== 'home';

  return (
    <div className="min-h-screen bg-[var(--brand-surface, #0f172a)] text-[var(--brand-surface-contrast,#f1f5f9)] transition-colors duration-300">
      <Navbar
        brandName="SaaS School Portal"
        brandSubtitle="Multi-tenant school experience"
        links={navLinks}
        onToggleSidebar={toggleMobile}
        sidebarOpen={isOpen}
      />

      <div className="relative mx-auto flex w-full max-w-[1400px] gap-4 px-2 sm:px-4">
        <div
          className={`fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition-opacity sm:hidden ${
            shouldShowOverlay ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={!shouldShowOverlay}
          onClick={closeMobile}
        />
        <Sidebar
          links={navLinks}
          open={isOpen}
          onClose={closeMobile}
          collapsed={collapsed}
          onCollapsedToggle={toggleCollapsed}
          isDesktop={isDesktop}
        />
        <main
          className={`relative z-10 flex-1 py-6 ${isDesktop ? 'px-6' : 'px-2 sm:px-4'} transition-all duration-300`}
        >
          {isAdminView ? <div className="space-y-6">{activePage}</div> : activePage}
        </main>
      </div>

      {!isAdminView ? null : (
        <footer className="border-t border-[var(--brand-border)] bg-[var(--brand-surface)]/80 py-6 text-center text-xs text-[var(--brand-muted)] backdrop-blur">
          <div className="mx-auto max-w-6xl px-4">
            Built for responsive multi-tenant schools · Keyboard accessible · Powered by schema isolation
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;

