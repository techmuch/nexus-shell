/**
 * Store-connected component variants.
 *
 * Every component in `components/` is pure and prop-driven. The wrappers here
 * bind those components to the shell's zustand stores and registries, so
 * `ShellLayout` — and any app that opts into the batteries-included shell — can
 * compose them without prop-drilling.
 *
 * Reach for these when you want the shell's behavior. Reach for the plain
 * components when you want control.
 */

export { ConnectedActivityBar, type ConnectedActivityBarProps } from './ConnectedActivityBar';
export { ConnectedChatPane, type ConnectedChatPaneProps } from './ConnectedChatPane';
export { ConnectedCommandPalette, type ConnectedCommandPaletteProps } from './ConnectedCommandPalette';
export { ConnectedMenuBar, type ConnectedMenuBarProps } from './ConnectedMenuBar';
export { ConnectedModal, type ConnectedModalProps } from './ConnectedModal';
export { ConnectedSidebarPane, type ConnectedSidebarPaneProps } from './ConnectedSidebarPane';
export { ConnectedStatusBar, type ConnectedStatusBarProps } from './ConnectedStatusBar';
export { ConnectedTerminalPane, type ConnectedTerminalPaneProps } from './ConnectedTerminalPane';
export { ConnectedThemeSwitcher, type ConnectedThemeSwitcherProps } from './ConnectedThemeSwitcher';
export { ConnectedUserProfile, type ConnectedUserProfileProps } from './ConnectedUserProfile';
