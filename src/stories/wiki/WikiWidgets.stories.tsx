import type { Meta, StoryObj } from '@storybook/react';

import { WikiNavigator } from '../../components/widgets/wiki/WikiNavigator';
import { WikiEditor } from '../../components/widgets/wiki/WikiEditor';
import { WikiHistorySidebar } from '../../components/widgets/wiki/WikiHistorySidebar';
import { AiCoWriterWorkspace } from '../../components/widgets/wiki/AiCoWriterWorkspace';
import { WikiChatWidget } from '../../components/widgets/wiki/WikiChatWidget';
import { SemanticLinkMapper } from '../../components/widgets/wiki/SemanticLinkMapper';

const meta: Meta = {
  title: 'Widgets/Wiki Modules',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[600px] border border-[var(--border)] rounded-md overflow-hidden flex flex-col">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Navigator: Story = {
  render: () => <WikiNavigator />,
};

export const Editor: Story = {
  render: () => (
    <div className="w-[800px] h-[600px] flex">
      <WikiEditor />
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-[800px] h-[600px] border border-[var(--border)] rounded-md overflow-hidden flex flex-col">
        <Story />
      </div>
    ),
  ],
};

export const HistorySidebar: Story = {
  render: () => <WikiHistorySidebar />,
};

export const AiCoWriter: Story = {
  render: () => <AiCoWriterWorkspace />,
};

export const SemanticChat: Story = {
  render: () => <WikiChatWidget />,
};

export const LinkMapper: Story = {
  render: () => (
    <div className="w-[800px] h-[600px] flex">
      <SemanticLinkMapper />
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-[800px] h-[600px] border border-[var(--border)] rounded-md overflow-hidden flex flex-col">
        <Story />
      </div>
    ),
  ],
};
