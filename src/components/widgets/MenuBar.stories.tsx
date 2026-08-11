import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MenuBar } from './MenuBar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { QuickSearch } from './QuickSearch';

const MENUS = {
  File: [
    { id: 'new', label: 'New File', keybinding: '⌘N' },
    { id: 'open', label: 'Open…', keybinding: '⌘O' },
    { id: 'save', label: 'Save', keybinding: '⌘S' },
    {
      id: 'recent',
      label: 'Open Recent',
      submenu: [
        { id: 'r1', label: 'nexus-shell' },
        { id: 'r2', label: 'design-system' },
      ],
    },
  ],
  Edit: [
    { id: 'undo', label: 'Undo', keybinding: '⌘Z' },
    { id: 'redo', label: 'Redo', keybinding: '⇧⌘Z' },
  ],
  View: [
    { id: 'terminal', label: 'Toggle Terminal', keybinding: '⌃`' },
    { id: 'sidebar', label: 'Toggle Sidebar', keybinding: '⌘B' },
  ],
};

const meta = {
  title: 'Primitives/MenuBar',
  component: MenuBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The application menu bar: hover-activated dropdowns with one level of submenus, plus slots for branding, a centre widget and right-hand actions. Presentational — menus come in as data and selections go out through `onSelect`; it reads no registry. See `ConnectedMenuBar` for the variant wired to `menuRegistry` and `commandRegistry`.\n\nNote that providing a `title` switches the bar to its taller, translucent variant.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[240px] bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MenuBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The compact bar. Hover a menu to open it. */
export const Default: Story = {
  args: { menus: MENUS },
};

/** With no menus, only the branding shows. */
export const Empty: Story = {
  args: { menus: {} },
};

/** Passing `title` switches to the taller, translucent variant. */
export const WithTitle: Story = {
  args: {
    menus: MENUS,
    title: (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-primary" />
        <span className="font-semibold text-sm">Acme Studio</span>
      </div>
    ),
  },
};

/** The `right` slot takes any node — here, a theme switcher. */
export const WithRightSlot: Story = {
  args: { menus: MENUS },
  render: function Render(args) {
    const [theme, setTheme] = useState('light');
    return (
      <MenuBar {...args} right={<ThemeSwitcher value={theme} onChange={setTheme} />} />
    );
  },
};

/**
 * The `center` slot is sized for a search field, but the bar embeds nothing
 * itself — pass `QuickSearch` or your own component.
 */
export const WithSearch: Story = {
  args: {
    menus: MENUS,
    center: <QuickSearch results={[]} onSelect={() => {}} />,
  },
};

/** All slots together: the full shell header. */
export const FullHeader: Story = {
  args: { menus: MENUS },
  render: function Render(args) {
    const [theme, setTheme] = useState('light');
    return (
      <MenuBar
        {...args}
        title={
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary" />
            <span className="font-semibold text-sm">Acme Studio</span>
          </div>
        }
        center={<QuickSearch results={[]} onSelect={() => {}} />}
        right={<ThemeSwitcher value={theme} onChange={setTheme} />}
      />
    );
  },
};
