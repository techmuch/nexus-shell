import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Contrast, Sun } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';

const meta = {
  title: 'Primitives/SettingsPanel',
  component: SettingsPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Sidebar body for the Settings panel. Split out of `SidebarPane` so the pane stays a generic container — pass this, or your own component, as the sidebar\'s children.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] bg-muted">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { theme: 'light', onThemeChange: () => {} },
};

export const Interactive: Story = {
  args: { theme: 'light', onThemeChange: () => {} },
  render: function Render() {
    const [theme, setTheme] = useState('dark');
    return <SettingsPanel theme={theme} onThemeChange={setTheme} />;
  },
};

/** Supply your own themes when the app ships more than the bundled three. */
export const CustomThemes: Story = {
  args: {
    theme: 'daylight',
    onThemeChange: () => {},
    themes: [
      { id: 'daylight', label: 'Daylight', icon: Sun },
      { id: 'contrast', label: 'High Contrast', icon: Contrast },
    ],
  },
};
