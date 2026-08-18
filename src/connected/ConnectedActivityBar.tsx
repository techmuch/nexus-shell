import { useMemo } from 'react';
import { ActivityBar, type ActivityBarProps } from '../components/widgets/ActivityBar';
import {
  useInspectorStore,
  useSidebarStore,
  type SidebarStore,
} from '../core/services/SidebarService';

export type ConnectedActivityBarProps = Omit<
  ActivityBarProps,
  'items' | 'activeId' | 'onSelect'
>;

/**
 * The shared body. Both rails derive their items from a panel registry.
 *
 * `store` is a hook passed as a prop — sound only because every call site
 * passes a module-level store of fixed identity. See `StorePane` for the same
 * note.
 */
const StoreBar = ({
  store,
  ...props
}: ConnectedActivityBarProps & { store: SidebarStore }) => {
  const panels = store((s) => s.panels);
  const activeSidebar = store((s) => s.activeSidebar);
  const toggleSidebar = store((s) => s.toggleSidebar);

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

/**
 * {@link ActivityBar} bound to `useSidebarStore`, docked left.
 *
 * Derives its items from the registered sidebar panels and toggles the active
 * panel on click — clicking the already-active item closes the sidebar.
 */
export const ConnectedActivityBar = (props: ConnectedActivityBarProps) => (
  <StoreBar {...props} store={useSidebarStore} side={props.side ?? 'left'} />
);

/**
 * {@link ActivityBar} bound to `useInspectorStore`, docked right.
 *
 * Rendered only when inspector panels are registered — an empty rail is a
 * twelve-pixel strip of nothing, and a shell that grows one the moment you
 * register a panel is easier to reason about than one you must switch on.
 *
 * It also defaults to no bottom group: settings live on the left rail, and two
 * settings buttons would be a puzzle.
 */
export const ConnectedInspectorBar = (props: ConnectedActivityBarProps) => {
  const panels = useInspectorStore((s) => s.panels);
  if (panels.length === 0) return null;

  return (
    <StoreBar
      bottomItems={[]}
      {...props}
      store={useInspectorStore}
      side={props.side ?? 'right'}
      aria-label={props['aria-label'] ?? 'Inspector Bar'}
    />
  );
};
