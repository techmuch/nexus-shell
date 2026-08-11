import type { Meta, StoryObj } from '@storybook/react';
import { Boxes, Database, GitFork, Network } from 'lucide-react';
import { AppTitle } from './AppTitle';
import { MenuBar } from './MenuBar';

const meta = {
  title: 'Primitives/AppTitle',
  component: AppTitle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A branding lockup — icon badge, title and subtitle — sized for the `MenuBar`'s `title` slot. Purely presentational; the library supplies no default copy, so pass whatever branding your app needs.",
      },
    },
  },
} satisfies Meta<typeof AppTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Acme Studio',
    subtitle: 'Design System',
    icon: <Boxes size={16} />,
  },
};

/** Without an `icon`, the badge is omitted entirely. */
export const NoIcon: Story = {
  args: { title: 'Acme Studio', subtitle: 'Design System' },
};

/** Without a `subtitle`, it collapses to a single line. */
export const TitleOnly: Story = {
  args: { title: 'Acme Studio', icon: <Network size={16} /> },
};

/** Long text truncates rather than pushing the menu bar wider. */
export const LongText: Story = {
  args: {
    title: 'An Extremely Long Application Name That Will Not Fit',
    subtitle: 'And a subtitle that also runs on well past the available width',
    icon: <Database size={16} />,
  },
  decorators: [
    (Story) => (
      <div className="w-[280px] border border-dashed border-border p-2">
        <Story />
      </div>
    ),
  ],
};

/** In its intended context: the menu bar's `title` slot. */
export const InMenuBar: Story = {
  args: { title: 'Acme Studio' },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="h-[160px] bg-background">
      <MenuBar
        menus={{ File: [{ id: 'save', label: 'Save' }], Edit: [] }}
        title={
          <AppTitle
            title="Nexus Research"
            subtitle="Knowledge Modeler"
            icon={<GitFork size={16} />}
          />
        }
      />
    </div>
  ),
};
