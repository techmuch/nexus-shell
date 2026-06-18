import { Meta, StoryObj } from '@storybook/react';
import { CommandPalette } from '../components/widgets/CommandPalette';

declare const meta: Meta<typeof CommandPalette>;
export default meta;
type Story = StoryObj<typeof CommandPalette>;
export declare const DefaultGlobal: Story;
export declare const CustomCommands: Story;
export declare const DarkTheme: Story;
