import { useCallback, useEffect, useMemo, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 1024px)';
const SIDEBAR_COLLAPSED_KEY = 'saas-sidebar-collapsed';

export interface ResponsiveSidebarState {
  isOpen: boolean;
  isDesktop: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
  shouldShowOverlay: boolean;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

function readCollapsedPref(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  return stored === 'true';
}

export function useResponsiveSidebar(initialOpen = false): ResponsiveSidebarState {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return false;
    }
    return window.matchMedia(DESKTOP_QUERY).matches;
  });
  const [menuOpen, setMenuOpen] = useState<boolean>(initialOpen);
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsedPref());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(DESKTOP_QUERY);
    const updateFromQuery = (desktop: boolean) => {
      setIsDesktop(desktop);
      if (desktop) {
        setMenuOpen(true);
        setCollapsed(readCollapsedPref());
      } else {
        setMenuOpen(false);
        setCollapsed(false);
      }
    };

    updateFromQuery(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => updateFromQuery(event.matches);
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, []);

  const toggleMobile = useCallback(() => {
    if (isDesktop) return;
    setMenuOpen((prev) => !prev);
  }, [isDesktop]);

  const closeMobile = useCallback(() => {
    if (isDesktop) return;
    setMenuOpen(false);
  }, [isDesktop]);

  const toggleCollapsed = useCallback(() => {
    if (!isDesktop) return;
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      }
      return next;
    });
  }, [isDesktop]);

  const isOpen = useMemo(() => (isDesktop ? true : menuOpen), [isDesktop, menuOpen]);
  const shouldShowOverlay = !isDesktop && isOpen;

  return {
    isOpen,
    isDesktop,
    toggleMobile,
    closeMobile,
    shouldShowOverlay,
    collapsed,
    toggleCollapsed
  };
}

export default useResponsiveSidebar;

