import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Files, Search, Sliders, Tags } from 'lucide-react';
import { SidebarPane } from './SidebarPane';
import { ActivityBar } from './ActivityBar';
import { TreeWidget } from './TreeWidget';
import { PropertyPanel } from '../properties/PropertyPanel';

/**
 * One pane, either edge.
 *
 * `side` is the only difference between the explorer on the left and an
 * inspector on the right. Before it existed, every application hand-rolled its
 * own `<div className="w-80 border-l …">` — nine of them in this repo alone —
 * and they all drifted apart.
 */

const meta = {
  title: 'Shell/SidebarPane',
  component: SidebarPane,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A docked side panel: titled header, optional close button, scrolling body. `side` docks it left or right; only the divider moves.\n\nFor the store-backed variants the shell composes, see `ConnectedSidebarPane` and `ConnectedInspectorPane` — the latter reads `useInspectorStore`, a separate registry, so the two sides open and close independently.',
      },
    },
  },
} satisfies Meta<typeof SidebarPane>;

export default meta;
type Story = StoryObj<typeof meta>;

const FILES = [
  { id: 'src', label: 'src', isBranch: true, depth: 0, expanded: true },
  { id: 'app', label: 'App.tsx', depth: 1 },
  { id: 'main', label: 'main.tsx', depth: 1 },
];

const SUBJECT = [{ id: 'app', name: 'App.tsx', lines: 184, tracked: true }];

const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'lines', label: 'Lines', type: 'number' as const },
  { key: 'tracked', label: 'Tracked', type: 'checkbox' as const },
];

/** The familiar left-hand pane. */
export const Left: Story = {
  args: { title: 'Explorer' },
  render: (args) => (
    <div className="flex h-[420px] bg-background">
      <SidebarPane {...args}>
        <TreeWidget data={FILES} />
      </SidebarPane>
      <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
        workspace
      </div>
    </div>
  ),
};

/** The same component, docked right. */
export const Right: Story = {
  args: { title: 'Properties', side: 'right', width: '320px' },
  render: (args) => (
    <div className="flex h-[420px] bg-background">
      <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
        workspace
      </div>
      <SidebarPane {...args}>
        <PropertyPanel subjects={SUBJECT} fields={FIELDS} />
      </SidebarPane>
    </div>
  ),
};

/**
 * Both at once, each with its own rail — which is how anyone actually works: a
 * file tree on one side, properties on the other.
 *
 * Note the active-item marker on each rail. It mirrors, so it always sits on
 * the edge facing the panel it opens.
 */
export const BothEdges: Story = {
  args: { title: 'Explorer' },
  render: () => {
    const [left, setLeft] = useState<string | null>('files');
    const [right, setRight] = useState<string | null>('properties');

    const toggle =
      (set: (v: string | null) => void, current: string | null) => (id: string) =>
        set(current === id ? null : id);

    return (
      <div className="flex h-[460px] bg-background">
        <ActivityBar
          items={[
            { id: 'files', label: 'Explorer', icon: Files },
            { id: 'search', label: 'Search', icon: Search },
          ]}
          activeId={left}
          onSelect={toggle(setLeft, left)}
        />
        {left && (
          <SidebarPane title={left === 'files' ? 'Explorer' : 'Search'} onClose={() => setLeft(null)}>
            {left === 'files' ? (
              <TreeWidget data={FILES} />
            ) : (
              <p className="p-4 text-xs text-muted-foreground">Search results…</p>
            )}
          </SidebarPane>
        )}

        <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
          workspace
        </div>

        {right && (
          <SidebarPane
            title={right === 'properties' ? 'Properties' : 'Tags'}
            side="right"
            width="300px"
            onClose={() => setRight(null)}
          >
            {right === 'properties' ? (
              <PropertyPanel subjects={SUBJECT} fields={FIELDS} />
            ) : (
              <p className="p-4 text-xs text-muted-foreground">No tags.</p>
            )}
          </SidebarPane>
        )}
        <ActivityBar
          side="right"
          items={[
            { id: 'properties', label: 'Properties', icon: Sliders },
            { id: 'tags', label: 'Tags', icon: Tags },
          ]}
          bottomItems={[]}
          activeId={right}
          onSelect={toggle(setRight, right)}
          aria-label="Inspector Bar"
        />
      </div>
    );
  },
};
