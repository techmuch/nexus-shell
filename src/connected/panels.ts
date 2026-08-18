import { MessageCircle, Settings, Terminal } from 'lucide-react';
import {
  CHAT_PANEL_ID,
  SETTINGS_PANEL_ID,
  TERMINAL_PANEL_ID,
  type IPanel,
} from '../core/services/PaneService';
import { ConnectedChatPane } from './ConnectedChatPane';
import { ConnectedSettingsPanel } from './ConnectedSettingsPanel';
import { ConnectedTerminalPane } from './ConnectedTerminalPane';

/**
 * Ready-made panel descriptors for the shell's own pieces.
 *
 * Chat, terminal and settings were each nailed into a fixed place — chat on the
 * right, terminal along the bottom, settings behind a reserved panel id the
 * pane special-cased. They are now ordinary registrations with no privileges,
 * so they go wherever you put them:
 *
 * ```tsx
 * initializeShell({
 *   panels: [
 *     { id: 'files', label: 'Explorer', icon: Files, component: FileTree },
 *     chatPanel({ side: 'right' }),
 *     terminalPanel({ side: 'bottom' }),
 *     settingsPanel(),
 *   ],
 * });
 * ```
 *
 * Each takes overrides, so the id, label, icon or side can change without
 * rebuilding the descriptor by hand.
 */

/** The chat pane, as a registerable panel. */
export const chatPanel = (overrides: Partial<IPanel> = {}): IPanel => ({
  id: CHAT_PANEL_ID,
  label: 'Chat',
  icon: MessageCircle,
  component: ConnectedChatPane,
  ...overrides,
});

/** The terminal, as a registerable panel. */
export const terminalPanel = (overrides: Partial<IPanel> = {}): IPanel => ({
  id: TERMINAL_PANEL_ID,
  label: 'Terminal',
  icon: Terminal,
  component: ConnectedTerminalPane,
  ...overrides,
});

/**
 * The theme picker, as a registerable panel.
 *
 * `align: 'end'` pins it to the far group of its rail, which is where a
 * settings icon conventionally sits — and is now the only reason it ends up
 * there, rather than the pane knowing the string `"settings"`.
 */
export const settingsPanel = (overrides: Partial<IPanel> = {}): IPanel => ({
  id: SETTINGS_PANEL_ID,
  label: 'Settings',
  icon: Settings,
  component: ConnectedSettingsPanel,
  align: 'end',
  ...overrides,
});
