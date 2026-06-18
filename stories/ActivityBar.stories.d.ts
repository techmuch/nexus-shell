import { Meta, StoryObj } from '@storybook/react';
import { ActivityBar } from '../components/widgets/ActivityBar';

declare const meta: Meta<typeof ActivityBar>;
export default meta;
type Story = StoryObj<typeof ActivityBar>;
export declare const Light: Story;
export declare const Dark: Story;
export declare const CustomPanels: Story;
