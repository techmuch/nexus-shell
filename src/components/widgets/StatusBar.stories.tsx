import type { Meta, StoryObj } from '@storybook/react';
import {
  Bell,
  Check,
  CircleAlert,
  GitBranch,
  Loader,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { StatusBar } from './StatusBar';

const meta = {
  title: 'Primitives/StatusBar',
  component: StatusBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A fixed-height footer with left, center and right item groups. Fully controlled — pass `widgets` and handle clicks yourself. Items with an `onClick` become keyboard-focusable buttons; items without one render as static labels.',
      },
    },
  },
  argTypes: {
    widgets: {
      description: 'Items to render, grouped by `alignment`.',
      control: 'object',
    },
    className: { control: 'text' },
  },
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default state of a freshly mounted shell: no items registered. */
export const Empty: Story = {
  args: { widgets: [] },
};

/** A representative editor status bar using all three alignment groups. */
export const Default: Story = {
  args: {
    widgets: [
      { id: 'branch', label: 'main', icon: GitBranch, alignment: 'left', onClick: () => {} },
      { id: 'sync', label: '0↓ 2↑', icon: RefreshCw, alignment: 'left', onClick: () => {} },
      { id: 'problems', label: '2 problems', icon: CircleAlert, alignment: 'center' },
      { id: 'position', label: 'Ln 42, Col 8', alignment: 'right', onClick: () => {} },
      { id: 'encoding', label: 'UTF-8', alignment: 'right' },
      { id: 'notify', label: '', icon: Bell, alignment: 'right', onClick: () => {} },
    ],
  },
};

/**
 * Items are sorted by descending `priority` within their group. Here `Second`
 * is declared first but renders last.
 */
export const Priority: Story = {
  args: {
    widgets: [
      { id: 'b', label: 'Second (priority 1)', alignment: 'left', priority: 1 },
      { id: 'a', label: 'First (priority 10)', alignment: 'left', priority: 10 },
      { id: 'c', label: 'Third (no priority)', alignment: 'left' },
    ],
  },
};

/** `className` on an item is merged onto it, so per-item accents are possible. */
export const StyledItems: Story = {
  args: {
    widgets: [
      { id: 'ok', label: 'Build passing', icon: Check, alignment: 'left', className: 'text-green-400' },
      { id: 'warn', label: '3 warnings', icon: CircleAlert, alignment: 'center', className: 'text-yellow-400' },
      { id: 'offline', label: 'Offline', icon: Wifi, alignment: 'right', className: 'text-red-400' },
    ],
  },
};

/** Icon-only items: pass an empty `label`. */
export const IconOnly: Story = {
  args: {
    widgets: [
      { id: 'sync', label: '', icon: RefreshCw, alignment: 'left', onClick: () => {} },
      { id: 'busy', label: '', icon: Loader, alignment: 'left' },
      { id: 'bell', label: '', icon: Bell, alignment: 'right', onClick: () => {} },
    ],
  },
};

/** Long content in every group, to check truncation and spacing under pressure. */
export const Crowded: Story = {
  args: {
    widgets: [
      { id: '1', label: 'feature/very-long-branch-name-here', icon: GitBranch, alignment: 'left' },
      { id: '2', label: 'Indexing workspace…', icon: Loader, alignment: 'left' },
      { id: '3', label: 'Connected to remote host', icon: Wifi, alignment: 'center' },
      { id: '4', label: 'Spaces: 2', alignment: 'right' },
      { id: '5', label: 'TypeScript React', alignment: 'right' },
      { id: '6', label: 'UTF-8', alignment: 'right' },
      { id: '7', label: 'LF', alignment: 'right' },
    ],
  },
};
