import { SidebarPane, type SidebarPaneProps } from '../components/widgets/SidebarPane';
import { paneStore } from '../core/services/PaneService';
import type { PaneSide } from '../components/widgets/SidebarPane';

export type ConnectedPaneProps = Omit<
  SidebarPaneProps,
  'title' | 'children' | 'onClose'
> & {
  /** Which edge to render. Defaults to `"left"`. */
  side?: PaneSide;
};

/**
 * {@link SidebarPane} bound to the pane store for one edge.
 *
 * Renders whichever panel is open on that edge, or nothing when the pane is
 * collapsed. Every edge resolves against its own registry, so the left pane,
 * the right pane and the bottom drawer open and close independently — a file
 * tree, an inspector and a terminal all at once is the normal case, not a
 * special one.
 *
 * There is nothing edge-specific in here. A panel decides where it lives
 * through its `side`, and this renders whatever arrived.
 *
 * @example
 * ```tsx
 * <ConnectedPane side="right" width="320px" />
 * ```
 */
export const ConnectedPane = ({ side = 'left', ...props }: ConnectedPaneProps) => {
  const store = paneStore(side);
  const activePanel = store((s) => s.activePanel);
  const panels = store((s) => s.panels);
  const setActivePanel = store((s) => s.setActivePanel);

  if (!activePanel) return null;

  const close = () => setActivePanel(null);
  const panel = panels.find((p) => p.id === activePanel);

  if (!panel) {
    return (
      <SidebarPane {...props} side={side} title={activePanel} onClose={close}>
        <div className="p-4 text-sm italic text-muted-foreground">
          Panel content not found.
        </div>
      </SidebarPane>
    );
  }

  const Component =
    typeof panel.component === 'function'
      ? (panel.component as React.ComponentType)
      : null;

  return (
    <SidebarPane {...props} side={side} title={panel.label} onClose={close}>
      {Component ? <Component /> : (panel.component as React.ReactNode)}
    </SidebarPane>
  );
};
