import { StoryObj } from '@storybook/react';

declare const meta: {
    title: string;
    component: import('../../node_modules/react').FC<import('..').WargameMapProps>;
    parameters: {
        layout: string;
    };
    tags: string[];
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const Empty: Story;
