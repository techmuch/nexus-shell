import { useMemo, useState } from 'react';
import { File, Folder, Hash, Terminal } from 'lucide-react';
import { QuickSearch, type IQuickSearchResult } from 'nexus-shell';

const CORPUS: IQuickSearchResult[] = [
  { id: 'save', title: 'File: Save', description: 'Shortcut: ⌘S', category: 'Actions', icon: Terminal },
  { id: 'open', title: 'File: Open', description: 'Shortcut: ⌘O', category: 'Actions', icon: Terminal },
  { id: 'split', title: 'View: Split Editor', description: 'Shortcut: ⌘\\', category: 'Actions', icon: Terminal },
  { id: 'app', title: 'App.tsx', description: 'src/App.tsx', category: 'Files', icon: File },
  { id: 'main', title: 'main.tsx', description: 'src/main.tsx', category: 'Files', icon: File },
  { id: 'widgets', title: 'widgets', description: 'src/components/widgets', category: 'Files', icon: Folder },
  { id: 'n1', title: 'Should we ship v1?', description: 'Open question', category: 'Nodes', icon: Hash },
];

// #region basic
export const Basic = () => {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);

  // QuickSearch does no filtering of its own — you own matching and ranking,
  // which is what lets the same component back a remote index.
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CORPUS.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-4 max-w-sm">
      <QuickSearch
        results={results}
        categories={['Actions', 'Files', 'Nodes']}
        onQueryChange={setQuery}
        onSelect={(result) => setPicked(result.title)}
      />
      <p className="text-[13px] text-muted-foreground">
        {picked ? `Selected: ${picked}` : 'Type "s" or "file" to see grouped results.'}
      </p>
    </div>
  );
};
// #endregion

// #region categories
export const FilteredCategories = () => (
  <div className="max-w-sm">
    <QuickSearch
      results={CORPUS}
      // `categories` sets group order and doubles as a whitelist —
      // anything not listed is dropped. "Nodes" won't appear.
      categories={['Files', 'Actions']}
      onSelect={() => {}}
    />
  </div>
);
// #endregion
