import type { AriaAttributes } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import type { AuthUser } from '../../lib/api';
import { ThemeToggleWithTooltip } from '../ui/ThemeToggleWithTooltip';
import { useBrand } from '../ui/BrandProvider';
import { AvatarDropdown } from '../ui/AvatarDropdown';
import { SearchBar } from '../ui/SearchBar';
import { Notifications } from '../ui/Notifications';
import { useDashboardRouteMeta } from '../../context/DashboardRouteContext';

export interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  user: AuthUser | null;
  onLogout: () => void;
}

export function DashboardHeader({
  onToggleSidebar,
  sidebarOpen,
  user,
  onLogout
}: DashboardHeaderProps) {
  const { tokens } = useBrand();
  const brandInitials = 'SS';
  const toggleAria = sidebarOpen
    ? ({ 'aria-expanded': 'true' as const } satisfies AriaAttributes)
    : ({ 'aria-expanded': 'false' as const } satisfies AriaAttributes);
  const { title, titleId } = useDashboardRouteMeta();

  return (
    <motion.header
      className="sticky top-0 z-40 border-b border-[var(--brand-border)] bg-[var(--brand-surface)]/85 backdrop-blur"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="mx-auto flex h-16 w-full items-center gap-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-[var(--brand-surface-contrast)] transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)] lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
            {...toggleAria}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold uppercase text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`
              }}
              initial={{ scale: 0.9, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              aria-hidden="true"
            >
              {brandInitials}
            </motion.div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[var(--brand-surface-contrast)]">
                SaaS School Portal
              </p>
              <p className="text-xs text-[var(--brand-muted)]">Multi-tenant school experience</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center gap-4">
          <div className="hidden w-full max-w-md md:block">
            <SearchBar
              placeholder="Search dashboard..."
              onSearch={(query) => {
                // TODO: Implement search functionality
                console.log('Search:', query);
              }}
            />
          </div>
          {title && (
            <h1
              id={titleId}
              className="line-clamp-1 text-center text-sm font-semibold text-[var(--brand-surface-contrast)] md:hidden lg:text-base"
            >
              {title}
            </h1>
          )}
          {!title && (
            <span className="sr-only md:hidden" id={titleId}>
              Dashboard
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Notifications
            notifications={[]}
            onNotificationClick={(notification) => {
              // TODO: Implement notification click handler
              console.log('Notification clicked:', notification);
            }}
            onMarkAllRead={() => {
              // TODO: Implement mark all read
              console.log('Mark all read');
            }}
          />
          <ThemeToggleWithTooltip />
          <AvatarDropdown user={user} onLogout={onLogout} />
        </div>
      </div>
    </motion.header>
  );
}

export default DashboardHeader;
