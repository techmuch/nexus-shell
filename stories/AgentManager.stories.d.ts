import { StoryObj } from '@storybook/react';

declare const meta: {
    title: string;
    component: import('../../node_modules/react').FC<import('..').AgentManagerProps>;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {
        onFetchAgents: {
            action: string;
        };
        onSaveAgent: {
            action: string;
        };
        onDeleteAgent: {
            action: string;
        };
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Empty: Story;
