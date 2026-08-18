import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Files, Search, Sliders, Tags } from 'lucide-react';
import { SidebarPane } from './SidebarPane';
import { ActivityBar } from './ActivityBar';
import { TreeWidget } from './TreeWidget';
import { PropertyPanel } from '../properties/PropertyPanel';

/**
 * One pane, three edges.
 *
 * `side` is the only difference between the explorer on the left, an inspector
 * on the right and a terminal drawer along the bottom. Before it existed, every
 * application hand-rolled its own `<div className="w-80 border-l …">` — nine of
 * them in this repo alone — and they all drifted apart.
 */

const meta = {
  title: 'Shell/SidebarPane',
  component: SidebarPane,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A docked side panel: titled header, optional close button, scrolling body. `side` docks it `left`, `right` or `bottom`; only the divider and the sizing axis move.\n\nFor the store-backed variant the shell composes, see `ConnectedPane` — one component for every edge, since each edge keeps its own registry and its own open panel.',
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

/**
 * All three edges. Each keeps its own open panel, so an explorer, an inspector
 * and a drawer are showing at once — the normal way to work, not a special
 * case.
 *
 * The bottom pane sits inside the workspace column rather than spanning the
 * window, so it never pushes the side panes around.
 */
export const AllThreeEdges: Story = {
  args: { title: 'Explorer' },
  render: () => (
    <div className="flex h-[520px] bg-background">
      <SidebarPane title="Explorer" width="220px" onClose={() => {}}>
        <TreeWidget data={FILES} />
      </SidebarPane>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
          workspace
        </div>
        <SidebarPane title="Terminal" side="bottom" height="160px" onClose={() => {}}>
          <pre className="p-3 font-mono text-[11px] text-muted-foreground">
            $ npm test{'\n'}363 passed
          </pre>
        </SidebarPane>
      </div>

      <SidebarPane title="Properties" side="right" width="260px" onClose={() => {}}>
        <PropertyPanel subjects={SUBJECT} fields={FIELDS} />
      </SidebarPane>
    </div>
  ),
};
