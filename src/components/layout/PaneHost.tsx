import { createContext, useContext, type ReactNode } from 'react';

/**
 * What a component can learn about the thing hosting it.
 *
 * A pane, a dockable tab and a bare `<div>` give a component very different
 * surroundings, and the difference that matters is whether a title bar has
 * already been drawn. Without this, a chat pane inside a `SidebarPane` renders
 * two headers and two close buttons.
 */
export interface IPaneHost {
  /**
   * The host already draws a title bar and a close affordance, so a hosted
   * component should not draw its own.
   */
  chrome: boolean;
  /** Where the host sits, when it knows. Useful for choosing a layout. */
  placement?: 'left' | 'right' | 'bottom' | 'tab';
}

const PaneHostContext = createContext<IPaneHost | null>(null);

/**
 * Read the surrounding host, or `null` when there isn't one.
 *
 * Prefer {@link useHostChrome}, which folds in an explicit prop.
 */
export const usePaneHost = (): IPaneHost | null => useContext(PaneHostContext);

/**
 * Whether this component should draw its own title bar.
 *
 * The host provides the *default*; an explicit prop always wins. That ordering
 * is deliberate — auto-detection keeps the common case free of configuration,
 * but a component that can only be told implicitly is one you cannot unit-test
 * without building a host around it, and cannot force when the detection is
 * wrong.
 *
 * @param explicit The component's own `chrome` prop, if the caller set one.
 */
export const useHostChrome = (explicit?: boolean): boolean => {
  const host = usePaneHost();
  if (explicit !== undefined) return explicit;
  return !host?.chrome;
};

export interface PaneHostProviderProps extends IPaneHost {
  /** Everything that should see this host. */
  children: ReactNode;
}

/**
 * Declare that everything inside is hosted.
 *
 * `SidebarPane` and the shell's tab factory do this for you. Wrap your own
 * container in it if you draw a title bar and want hosted components to defer.
 *
 * @example
 * ```tsx
 * <PaneHostProvider chrome placement="bottom">
 *   <MyTitleBar />
 *   <ConnectedTerminalPane />
 * </PaneHostProvider>
 * ```
 */
export const PaneHostProvider = ({
  children,
  ...host
}: PaneHostProviderProps) => (
  <PaneHostContext.Provider value={host}>{children}</PaneHostContext.Provider>
);
