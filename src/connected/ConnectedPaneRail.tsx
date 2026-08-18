import { useMemo } from 'react';
import { ActivityBar, type ActivityBarProps } from '../components/widgets/ActivityBar';
import { paneStore } from '../core/services/PaneService';
import type { PaneSide } from '../components/widgets/SidebarPane';

export type ConnectedPaneRailProps = Omit<
  ActivityBarProps,
  'items' | 'bottomItems' | 'activeId' | 'onSelect' | 'side'
> & {
  /** Which edge to render. Defaults to `"left"`. */
  side?: Exclude<PaneSide, 'bottom'>;
};

/**
 * {@link ActivityBar} bound to the pane store for one edge.
 *
 * Derives its items from the panels registered on that edge and toggles the
 * open one — clicking the already-open item closes the pane. Items with
 * `align: 'end'` go to the far group, which is how settings ends up at the
 * bottom without the rail knowing what settings is.
 *
 * Renders nothing when no panels are registered for the edge. An empty rail is
 * a twelve-pixel strip of nothing, and both edges behave the same way — the
 * left rail used to render regardless, which made the two sides subtly
 * different for no reason anyone had chosen.
 *
 * There is no bottom rail: a bottom drawer is toggled from the status bar, a
 * command or a keybinding, and a horizontal strip of icons under the workspace
 * costs more room than it earns.
 */
export const ConnectedPaneRail = ({ side = 'left', ...props }: ConnectedPaneRailProps) => {
  const store = paneStore(side);
  const panels = store((s) => s.panels);
  const activePanel = store((s) => s.activePanel);
  const togglePanel = store((s) => s.togglePanel);

  const [items, bottomItems] = useMemo(() => {
    const toItem = ({ id, label, icon }: (typeof panels)[number]) => ({ id, label, icon });
    return [
      panels.filter((p) => p.align !== 'end').map(toItem),
      panels.filter((p) => p.align === 'end').map(toItem),
    ];
  }, [panels]);

  if (panels.length === 0) return null;

  return (
    <ActivityBar
      {...props}
      side={side}
      items={items}
      bottomItems={bottomItems}
      activeId={activePanel}
      onSelect={togglePanel}
      aria-label={props['aria-label'] ?? (side === 'right' ? 'Inspector Bar' : 'Activity Bar')}
    />
  );
};
