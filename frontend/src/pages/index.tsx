import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import MainLayout from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../lib/api';
import { sanitizeIdentifier, sanitizeText } from '../lib/sanitize';

const ROLE_OPTIONS: Array<{ label: string; value: Role }> = [
  { label: 'Student', value: 'student' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'Admin', value: 'admin' }
];

interface HomePageProps {
  mode: 'login' | 'register' | null;
  onModeChange: (mode: 'login' | 'register' | null) => void;
}

function HomePage({ mode, onModeChange }: HomePageProps) {
  const { user, login, register, isLoading } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    role: 'teacher' as Role,
    tenantId: ''
  });

  useEffect(() => {
    if (user) {
      onModeChange(null);
    }
  }, [user, onModeChange]);

  return (
    <MainLayout>
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Multi-tenant SaaS School Management Portal
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Manage attendance, exams, fees, and dashboards across tenants with schema-per-tenant
          isolation and secure onboarding workflows.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => onModeChange('register')}>Create tenant user</Button>
          <Button variant="ghost" onClick={() => onModeChange('login')}>
            Access dashboard
          </Button>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <article className="space-y-6 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/70 p-6 shadow-lg">
          <h2 className="text-left text-2xl font-semibold text-white">
            Why schools choose this portal
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2">
            {[
              {
                title: 'RBAC & Auth',
                description:
                  'Role-scoped dashboards and audit-ready authentication across Students, Teachers, Admins, and SuperAdmins.'
              },
              {
                title: 'Schema-per-Tenant Postgres',
                description:
                  'Automated provisioning, quotas, and safe migrations across dozens of schools.'
              },
              {
                title: 'Observability-first',
                description:
                  'Health checks, audit logs, and QA pipelines so releases stay reliable.'
              },
              {
                title: 'Composable Frontend',
                description:
                  'Tailwind-driven UI components ready for tenant branding and rapid iteration.'
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-white/10 bg-white/5 p-4 text-left"
              >
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
              </div>
            ))}
          </dl>
        </article>

        <article className="space-y-4 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/70 p-6 shadow-xl">
          <header className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {mode === 'register' ? 'Create a tenant user' : 'Secure login'}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={`text-xs font-medium uppercase tracking-wide ${
                  mode !== 'register' ? 'text-white' : 'text-slate-500'
                }`}
                onClick={() => onModeChange('login')}
              >
                Sign in
              </button>
              <span className="text-slate-600">/</span>
              <button
                type="button"
                className={`text-xs font-medium uppercase tracking-wide ${
                  mode === 'register' ? 'text-white' : 'text-slate-500'
                }`}
                onClick={() => onModeChange('register')}
              >
                Register
              </button>
            </div>
          </header>

          {mode === 'register' ? (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!registerForm.tenantId && registerForm.role !== 'superadmin') {
                  toast.error('Provide a tenant identifier for non-superadmin roles.');
                  return;
                }
                try {
                  await register({
                    email: registerForm.email,
                    password: registerForm.password,
                    role: registerForm.role,
                    tenantId: registerForm.role === 'superadmin' ? undefined : registerForm.tenantId
                  });
                  toast.success('Registration successful. Welcome aboard.');
                } catch (error) {
                  toast.error((error as Error).message);
                }
              }}
            >
              <Input
                label="Work email"
                type="email"
                required
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((state) => ({
                    ...state,
                    email: sanitizeText(event.target.value).toLowerCase()
                  }))
                }
              />
              <Input
                label="Password"
                type="password"
                required
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((state) => ({ ...state, password: event.target.value }))
                }
              />
              <Select
                label="Role"
                options={ROLE_OPTIONS}
                value={registerForm.role}
                onChange={(event) =>
                  setRegisterForm((state) => ({
                    ...state,
                    role: event.target.value as Role
                  }))
                }
              />
              {registerForm.role !== 'superadmin' ? (
                <Input
                  label="Tenant ID"
                  placeholder="tenant_alpha"
                  required
                  value={registerForm.tenantId}
                  onChange={(event) =>
                    setRegisterForm((state) => ({
                      ...state,
                      tenantId: sanitizeIdentifier(event.target.value)
                    }))
                  }
                />
              ) : null}
              <Button type="submit" loading={isLoading}>
                Create account
              </Button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await login({ email: loginForm.email, password: loginForm.password });
                  toast.success('Signed in successfully.');
                } catch (error) {
                  toast.error((error as Error).message);
                }
              }}
            >
              <Input
                label="Email"
                type="email"
                required
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((state) => ({
                    ...state,
                    email: sanitizeText(event.target.value).toLowerCase()
                  }))
                }
              />
              <Input
                label="Password"
                type="password"
                required
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((state) => ({ ...state, password: event.target.value }))
                }
              />
              <Button type="submit" loading={isLoading}>
                Sign in
              </Button>
            </form>
          )}
        </article>
      </section>
    </MainLayout>
  );
}

export default HomePage;
