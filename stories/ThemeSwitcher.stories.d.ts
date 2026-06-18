import { Meta, StoryObj } from '@storybook/react';
import { ThemeSwitcher } from '../components/widgets/ThemeSwitcher';

declare const meta: Meta<typeof ThemeSwitcher>;
export default meta;
type Story = StoryObj<typeof ThemeSwitcher>;
export declare const Interactive: Story;
export declare const StaticLight: Story;
export declare const StaticDark: Story;
export declare const StaticGeorgiaTech: Story;
