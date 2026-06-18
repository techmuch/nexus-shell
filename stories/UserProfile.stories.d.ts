import { Meta, StoryObj } from '@storybook/react';
import { UserProfile } from '../components/widgets/UserProfile';

declare const meta: Meta<typeof UserProfile>;
export default meta;
type Story = StoryObj<typeof UserProfile>;
export declare const Default: Story;
export declare const WithAvatar: Story;
export declare const Compact: Story;
export declare const DarkTheme: Story;
export declare const FromStore: Story;
