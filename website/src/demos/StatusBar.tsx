import { Bell, Check, CircleAlert, GitBranch, RefreshCw, Wifi } from 'lucide-react';
import { StatusBar } from 'nexus-shell';

// #region basic
export const Basic = () => (
  <StatusBar
    widgets={[
      { id: 'branch', label: 'main', icon: GitBranch, alignment: 'left' },
      { id: 'sync', label: '0↓ 2↑', icon: RefreshCw, alignment: 'left' },
      { id: 'problems', label: '2 problems', icon: CircleAlert, alignment: 'center' },
      { id: 'position', label: 'Ln 42, Col 8', alignment: 'right' },
      { id: 'encoding', label: 'UTF-8', alignment: 'right' },
    ]}
  />
);
// #endregion

// #region interactive
export const Interactive = () => (
  <StatusBar
    widgets={[
      {
        id: 'branch',
        label: 'main',
        icon: GitBranch,
        alignment: 'left',
        // Any item with an onClick becomes a focusable button.
        onClick: () => alert('Switch branch'),
      },
      { id: 'readonly', label: 'read-only label', alignment: 'left' },
      {
        id: 'notify',
        label: '',
        icon: Bell,
        alignment: 'right',
        onClick: () => alert('3 notifications'),
      },
    ]}
  />
);
// #endregion

// #region styled
export const Styled = () => (
  <StatusBar
    widgets={[
      {
        id: 'ok',
        label: 'Build passing',
        icon: Check,
        alignment: 'left',
        className: 'text-green-400',
      },
      {
        id: 'warn',
        label: '3 warnings',
        icon: CircleAlert,
        alignment: 'center',
        className: 'text-yellow-400',
      },
      {
        id: 'offline',
        label: 'Offline',
        icon: Wifi,
        alignment: 'right',
        className: 'text-red-400',
      },
    ]}
  />
);
// #endregion

// #region priority
export const Priority = () => (
  <StatusBar
    widgets={[
      // Declared first, rendered last — higher priority sorts earlier.
      { id: 'c', label: 'no priority', alignment: 'left' },
      { id: 'b', label: 'priority 1', alignment: 'left', priority: 1 },
      { id: 'a', label: 'priority 10', alignment: 'left', priority: 10 },
    ]}
  />
);
// #endregion
