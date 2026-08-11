import { useMemo } from 'react';
import { ActivityBar, type ActivityBarProps } from '../components/widgets/ActivityBar';
import { useSidebarStore } from '../core/services/SidebarService';

export type ConnectedActivityBarProps = Omit<
  ActivityBarProps,
  'items' | 'activeId' | 'onSelect'
>;

/**
 * {@link ActivityBar} bound to `useSidebarStore`.
 *
 * Derives its items from the registered sidebar panels and toggles the active
 * panel on click — clicking the already-active item closes the sidebar.
 */
export const ConnectedActivityBar = (props: ConnectedActivityBarProps) => {
  const panels = useSidebarStore((s) => s.panels);
  const activeSidebar = useSidebarStore((s) => s.activeSidebar);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);

  const items = useMemo(
    () => panels.map(({ id, label, icon }) => ({ id, label, icon })),
    [panels],
  );

  return (
    <ActivityBar
      {...props}
      items={items}
      activeId={activeSidebar}
      onSelect={toggleSidebar}
    />
  );
};
