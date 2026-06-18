import type { Meta, StoryObj } from '@storybook/react';
import { ThemeSwitcher } from '../components/widgets/ThemeSwitcher';
import { useThemeStore } from '../core/services/ThemeService';

const meta: Meta<typeof ThemeSwitcher> = {
  title: 'Widgets/Shell/ThemeSwitcher',
  component: ThemeSwitcher,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ThemeSwitcher>;

const InteractiveThemeSwitcherWrapper = () => {
  const theme = useThemeStore((state) => state.theme);
  
  return (
    <div className={`theme-${theme} p-8 rounded-xl border border-border bg-background text-foreground transition-all duration-300 w-[300px] flex flex-col items-center gap-4`}>
      <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
        Active Theme: {theme}
      </span>
      <ThemeSwitcher />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveThemeSwitcherWrapper />,
};

export const StaticLight: Story = {
  render: () => (
    <div className="theme-light p-8 rounded-xl border border-border bg-background text-foreground w-[300px] flex flex-col items-center gap-4">
      <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
        Light Preview
      </span>
      <ThemeSwitcher />
    </div>
  ),
};

export const StaticDark: Story = {
  render: () => (
    <div className="theme-dark p-8 rounded-xl border border-border bg-background text-foreground w-[300px] flex flex-col items-center gap-4">
      <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
        Dark Preview
      </span>
      <ThemeSwitcher />
    </div>
  ),
};

export const StaticGeorgiaTech: Story = {
  render: () => (
    <div className="theme-gt p-8 rounded-xl border border-border bg-background text-foreground w-[300px] flex flex-col items-center gap-4">
      <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
        GT Preview
      </span>
      <ThemeSwitcher />
    </div>
  ),
};
