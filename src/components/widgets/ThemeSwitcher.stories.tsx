import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeSwitcher } from './ThemeSwitcher';

const meta = {
  title: 'Primitives/ThemeSwitcher',
  component: ThemeSwitcher,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A compact segmented control for switching themes. Controlled: it renders `value` and reports changes through `onChange`, applying nothing to the document itself. Use `ConnectedThemeSwitcher` if you want it wired to `useThemeStore`, which also sets the `theme-*` class on `<html>` and persists the choice.',
      },
    },
  },
  argTypes: {
    value: { control: 'text', description: 'Selected theme id.' },
    onChange: { action: 'onChange' },
  },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 'light', onChange: () => {} },
};

/** Drive it from state to see the selection actually move. */
export const Interactive: Story = {
  args: { value: 'light', onChange: () => {} },
  render: function Render() {
    const [theme, setTheme] = useState('light');
    return (
      <div className="flex flex-col items-center gap-3">
        <ThemeSwitcher value={theme} onChange={setTheme} />
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-mono">{theme}</span>
        </p>
      </div>
    );
  },
};

/** `options` replaces the default set entirely — the control is not tied to the bundled themes. */
export const CustomOptions: Story = {
  args: {
    value: 'solar',
    onChange: () => {},
    options: [
      { id: 'solar', label: 'Solar' },
      { id: 'mono', label: 'Mono' },
    ],
  },
};
