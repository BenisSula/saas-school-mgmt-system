import React, { useMemo, useState } from 'react';
import HomePage from './pages';
import AdminConfigurationPage from './pages/AdminConfigurationPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminRoleManagementPage from './pages/AdminRoleManagementPage';
import StudentFeesPage from './pages/StudentFeesPage';
import TeacherGradeEntryPage from './pages/TeacherGradeEntryPage';
import StudentResultsPage from './pages/StudentResultsPage';
import MainLayout from './layouts/MainLayout';
import { Button } from './components/Button';

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

  return (
    <MainLayout>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-6">
        <Button variant={view === 'home' ? 'primary' : 'secondary'} onClick={() => setView('home')}>
          Landing
        </Button>
        <Button
          variant={view === 'admin-config' ? 'primary' : 'secondary'}
          onClick={() => setView('admin-config')}
        >
          Admin configuration
        </Button>
        <Button
          variant={view === 'admin-reports' ? 'primary' : 'secondary'}
          onClick={() => setView('admin-reports')}
        >
          Reports
        </Button>
        <Button
          variant={view === 'admin-roles' ? 'primary' : 'secondary'}
          onClick={() => setView('admin-roles')}
        >
          RBAC manager
        </Button>
        <Button
          variant={view === 'teacher-grades' ? 'primary' : 'secondary'}
          onClick={() => setView('teacher-grades')}
        >
          Teacher grade entry
        </Button>
        <Button
          variant={view === 'student-results' ? 'primary' : 'secondary'}
          onClick={() => setView('student-results')}
        >
          Student results
        </Button>
        <Button variant={view === 'fees' ? 'primary' : 'secondary'} onClick={() => setView('fees')}>
          Student fees
        </Button>
      </div>

      <div className="pt-6">{activePage}</div>
    </MainLayout>
  );
}

export default App;


