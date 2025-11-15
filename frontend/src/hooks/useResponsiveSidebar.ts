/**
 * @deprecated Use useSidebar instead. This file is kept for backward compatibility.
 * Will be removed in a future version.
 */
import { useSidebar, type UseSidebarOptions, type UseSidebarReturn } from './useSidebar';

export type ResponsiveSidebarState = UseSidebarReturn;

export function useResponsiveSidebar(options: UseSidebarOptions = {}): ResponsiveSidebarState {
  return useSidebar(options);
}

export default useResponsiveSidebar;
