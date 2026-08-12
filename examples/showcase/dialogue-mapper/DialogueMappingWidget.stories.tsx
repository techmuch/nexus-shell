import type { Meta, StoryObj } from '@storybook/react';
import { BUNDLED_THEMES, themeClass } from '../../../src/index';
import { DialogueMappingWidget } from './DialogueMappingWidget';

/**
 * The whole mapper.
 *
 * Worth reading the source alongside this: the canvas, node placement, edge
 * routing, minimap, keyboard navigation, auto layout, palette and inspector all
 * come from the library. What the example still owns is IBIS itself — which
 * connections are legal, which key makes which kind of node, and what a node
 * card looks like.
 */

const meta: Meta<typeof DialogueMappingWidget> = {
  title: 'Examples/Dialogue Mapper/Widget',
  component: DialogueMappingWidget,
  args: { mapId: 'storybook' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Click a node to inspect it, shift-click to select several and edit them together. Arrows move focus, Tab creates a connected node, Enter edits, and the IBIS shortcut keys (`q`, `a`, `p`, `-`, `n`, `d`, `l`, `i`, `m`) add a child of the focused node.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DialogueMappingWidget>;

const Frame = ({ theme, mapId }: { theme: string; mapId: string }) => (
  <div
    className={`${themeClass(theme)} h-[640px] w-full overflow-hidden rounded-xl border border-border bg-background text-foreground`}
  >
    <DialogueMappingWidget mapId={mapId} />
  </div>
);

export const Workbench: Story = {
  render: (args) => <Frame theme="dark" mapId={args.mapId} />,
};

/** Every bundled theme, straight from the registry. */
export const Themes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {BUNDLED_THEMES.map((theme) => (
        <Frame key={theme.id} theme={theme.id} mapId={`storybook-${theme.id}`} />
      ))}
    </div>
  ),
};
