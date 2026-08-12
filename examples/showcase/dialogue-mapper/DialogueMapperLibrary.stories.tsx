import type { Meta, StoryObj } from '@storybook/react';
import { BUNDLED_THEMES, themeClass } from '../../../src/index';
import { DialogueMapperLibrary } from './DialogueMapperLibrary';
import { useThemeStore } from '../../../src/core/services/ThemeService';

const meta: Meta<typeof DialogueMapperLibrary> = {
  title: 'Examples/Dialogue Mapper/Library',
  component: DialogueMapperLibrary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The IBIS node library. Drag-and-drop, keyboard activation and orientation all come from `NodePalette` — what is left here is the nine IBIS types, their icons and their shortcut keys.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DialogueMapperLibrary>;

const Frame = ({ theme, note }: { theme: string; note: string }) => (
  <div
    className={`${themeClass(theme)} flex h-[600px] overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-xl`}
  >
    <DialogueMapperLibrary
      onAddNode={(type) => console.log(`Clicked to add node of type: ${type}`)}
    />
    <div className="flex w-64 flex-1 flex-col items-center justify-center p-6 text-center font-sans">
      <span className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {theme}
      </span>
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{note}</p>
    </div>
  </div>
);

/** Follows whichever theme the workbench is currently using. */
export const Interactive: Story = {
  render: () => {
    const theme = useThemeStore((state) => state.theme);
    return (
      <Frame
        theme={theme}
        note="Drag an entry onto a canvas, or click one to add it at the centre. With a node selected, the shortcut key adds a connected child instead."
      />
    );
  },
};

/**
 * Every bundled theme, generated from the theme registry — so a new theme
 * appears here without anyone remembering to add a story.
 */
export const Themes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {BUNDLED_THEMES.map((theme) => (
        <Frame key={theme.id} theme={theme.id} note={theme.description} />
      ))}
    </div>
  ),
};
