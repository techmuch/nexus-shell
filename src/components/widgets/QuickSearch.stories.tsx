import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { File, Folder, Hash, Terminal } from 'lucide-react';
import { QuickSearch, type IQuickSearchResult } from './QuickSearch';

const CORPUS: IQuickSearchResult[] = [
  { id: 'save', title: 'File: Save', description: 'Shortcut: ⌘S', category: 'Actions', icon: Terminal },
  { id: 'open', title: 'File: Open', description: 'Shortcut: ⌘O', category: 'Actions', icon: Terminal },
  { id: 'split', title: 'View: Split Editor', description: 'Shortcut: ⌘\\', category: 'Actions', icon: Terminal },
  { id: 'app', title: 'App.tsx', description: 'src/App.tsx', category: 'Files', icon: File },
  { id: 'main', title: 'main.tsx', description: 'src/main.tsx', category: 'Files', icon: File },
  { id: 'widgets', title: 'widgets', description: 'src/components/widgets', category: 'Files', icon: Folder },
  { id: 'n1', title: 'Should we ship v1?', description: 'Open question', category: 'Nodes', icon: Hash },
];

const meta = {
  title: 'Primitives/QuickSearch',
  component: QuickSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A compact search field with a grouped results dropdown, sized to sit inside a `MenuBar`. It does no filtering — results are pushed in via `results`, so matching, ranking and async loading stay yours. Arrow keys move the highlight across groups, Enter selects, Escape closes.\n\nFor the full-height sidebar equivalent, see `SearchWidget`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[420px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuickSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type anything — results are static here, so the dropdown always shows the full corpus. */
export const Default: Story = {
  args: { results: CORPUS, onSelect: () => {} },
};

/** Type to filter for real. This is what wiring `onQueryChange` back to `results` looks like. */
export const Interactive: Story = {
  args: { results: [], onSelect: () => {} },
  render: function Render() {
    const [query, setQuery] = useState('');
    const [picked, setPicked] = useState<string | null>(null);

    const results = useMemo(() => {
      if (!query.trim()) return [];
      const q = query.toLowerCase();
      return CORPUS.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q),
      );
    }, [query]);

    return (
      <div className="space-y-4">
        <QuickSearch
          results={results}
          categories={['Actions', 'Files', 'Nodes']}
          onQueryChange={setQuery}
          onSelect={(r) => setPicked(r.title)}
        />
        <p className="text-xs text-muted-foreground">
          {picked ? `Selected: ${picked}` : 'Nothing selected.'}
        </p>
      </div>
    );
  },
};

/** `categories` sets group order and doubles as a whitelist — `Nodes` is dropped here. */
export const FilteredCategories: Story = {
  args: {
    results: CORPUS,
    categories: ['Files', 'Actions'],
    onSelect: () => {},
  },
};

/** The empty state, shown once a query is typed but nothing matches. */
export const NoResults: Story = {
  args: { results: [], onSelect: () => {} },
};
