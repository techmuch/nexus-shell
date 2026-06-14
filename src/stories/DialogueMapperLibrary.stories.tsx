import type { Meta, StoryObj } from '@storybook/react';
import { DialogueMapperLibrary } from '../components/widgets/DialogueMapperLibrary';
import { useThemeStore } from '../core/services/ThemeService';

const meta: Meta<typeof DialogueMapperLibrary> = {
  title: 'Widgets/DialogueMapperLibrary',
  component: DialogueMapperLibrary,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DialogueMapperLibrary>;

export const Interactive: Story = {
  render: () => {
    // Dynamically follows the global workstation theme store if changed
    const theme = useThemeStore((state) => state.theme);
    
    return (
      <div className={`theme-${theme} h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl`}>
        <DialogueMapperLibrary
          onAddNode={(type) => console.log(`Clicked to add node of type: ${type}`)}
          onClose={() => console.log('Close clicked')}
          onDragStart={(e, type) => {
            console.log(`Drag started for node type: ${type}`);
            e.dataTransfer.setData('application/reactflow', type);
          }}
        />
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center font-sans">
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Active Theme: {theme}
          </span>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Drag items from the library sidebar, or click on them to trigger the callback.
          </p>
        </div>
      </div>
    );
  },
};

export const LightTheme: Story = {
  render: () => (
    <div className="theme-light h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl">
      <DialogueMapperLibrary
        onAddNode={(type) => console.log(`Clicked to add: ${type}`)}
        onClose={() => console.log('Closed')}
        onDragStart={(e, type) => {
          e.dataTransfer.setData('application/reactflow', type);
        }}
      />
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center font-sans w-64 bg-background">
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Light Theme
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Palette color contrasts optimized for soft text on white/gray.
        </p>
      </div>
    </div>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <div className="theme-dark h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl">
      <DialogueMapperLibrary
        onAddNode={(type) => console.log(`Clicked to add: ${type}`)}
        onClose={() => console.log('Closed')}
        onDragStart={(e, type) => {
          e.dataTransfer.setData('application/reactflow', type);
        }}
      />
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center font-sans w-64 bg-background">
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Dark Theme
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Palette color contrasts optimized for soft glow colors on dark gray.
        </p>
      </div>
    </div>
  ),
};

export const GeorgiaTechTheme: Story = {
  render: () => (
    <div className="theme-gt h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl">
      <DialogueMapperLibrary
        onAddNode={(type) => console.log(`Clicked to add: ${type}`)}
        onClose={() => console.log('Closed')}
        onDragStart={(e, type) => {
          e.dataTransfer.setData('application/reactflow', type);
        }}
      />
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center font-sans w-64 bg-background">
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Georgia Tech Theme
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Palette color contrasts optimized for GT gold and black layout colors.
        </p>
      </div>
    </div>
  ),
};
