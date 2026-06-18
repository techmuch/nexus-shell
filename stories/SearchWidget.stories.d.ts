import { Meta, StoryObj } from '@storybook/react';
import { SearchWidget } from '../components/widgets/SearchWidget';

declare const meta: Meta<typeof SearchWidget>;
export default meta;
type Story = StoryObj<typeof SearchWidget>;
export declare const Default: Story;
export declare const Dark: Story;
export declare const EmptyState: Story;
