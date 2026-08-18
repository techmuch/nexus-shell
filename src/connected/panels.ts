import { MessageCircle, Terminal } from 'lucide-react';
import {
  CHAT_PANEL_ID,
  TERMINAL_PANEL_ID,
  type ISidebarPanel,
} from '../core/services/SidebarService';
import { ConnectedChatPane } from './ConnectedChatPane';
import { ConnectedTerminalPane } from './ConnectedTerminalPane';

/**
 * Ready-made panel descriptors for the shell's own pieces.
 *
 * Chat and terminal used to be nailed into fixed slots — chat on the right,
 * terminal along the bottom — and there was no way to put them anywhere else.
 * They are now ordinary registrations, so they go wherever you register them:
 *
 * ```tsx
 * initializeShell({
 *   panels: [terminalPanel()],            // left rail
 *   inspectorPanels: [chatPanel()],       // right rail
 * });
 *
 * // …or as a dockable tab, alongside everything else:
 * componentRegistry.register('terminal', ConnectedTerminalPane);
 * useLayoutStore.getState().addTab('terminal', 'Terminal');
 * ```
 *
 * Each takes overrides, so the id, label or icon can be changed without
 * rebuilding the descriptor by hand.
 */

/** The chat pane, as a registerable panel. */
export const chatPanel = (overrides: Partial<ISidebarPanel> = {}): ISidebarPanel => ({
  id: CHAT_PANEL_ID,
  label: 'Chat',
  icon: MessageCircle,
  component: ConnectedChatPane,
  ...overrides,
});

/** The terminal, as a registerable panel. */
export const terminalPanel = (overrides: Partial<ISidebarPanel> = {}): ISidebarPanel => ({
  id: TERMINAL_PANEL_ID,
  label: 'Terminal',
  icon: Terminal,
  component: ConnectedTerminalPane,
  ...overrides,
});

export { CHAT_PANEL_ID, TERMINAL_PANEL_ID };
