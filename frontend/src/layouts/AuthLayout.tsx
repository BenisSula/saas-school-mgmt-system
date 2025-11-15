/**
 * Reusable Auth Layout Component
 * Provides consistent layout structure for authentication pages
 */
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { LandingHeader } from '../components/layout/LandingHeader';
import { LandingFooter } from '../components/layout/LandingFooter';
import { AuthModal } from '../components/auth/AuthModal';
import type { AuthView } from '../components/auth/AuthPanel';

export interface AuthLayoutProps {
  children?: ReactNode;
  showAuthModal?: boolean;
  defaultAuthMode?: AuthView;
}

export function AuthLayout({
  children,
  showAuthModal = false,
  defaultAuthMode = 'login'
}: AuthLayoutProps) {
  const content = children ?? <Outlet />;
  const [authOpen, setAuthOpen] = useState(showAuthModal);
  const [authMode, setAuthMode] = useState<AuthView>(defaultAuthMode);

  return (
    <div className="min-h-screen bg-[var(--brand-surface)] text-[var(--brand-surface-contrast)]">
      <LandingHeader
        onSignIn={() => {
          setAuthMode('login');
          setAuthOpen(true);
        }}
      />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">{content}</main>
      <LandingFooter />
      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}

export default AuthLayout;
