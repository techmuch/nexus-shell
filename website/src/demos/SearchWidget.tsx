import { useState } from 'react';
import { Code, File, Folder, Settings, Terminal } from 'lucide-react';
import { SearchWidget, type ISearchResult } from 'nexus-shell';

const CORPUS: ISearchResult[] = [
  { id: '1', title: 'App.tsx', description: 'src/App.tsx', icon: File, category: 'FILE' },
  { id: '2', title: 'StatusBar.tsx', description: 'src/components/widgets', icon: File, category: 'FILE' },
  { id: '3', title: 'registry', description: 'src/core/registry', icon: Folder, category: 'FOLDER' },
  { id: '4', title: 'useThemeStore', description: 'Zustand store — theme state', icon: Code, category: 'SYMBOL' },
  { id: '5', title: 'Toggle Terminal', description: 'Command · ⌃`', icon: Terminal, category: 'ACTION' },
  { id: '6', title: 'Preferences', description: 'Open settings panel', icon: Settings, category: 'ACTION' },
];

// #region basic
export const Basic = () => {
  const [results, setResults] = useState<ISearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * `onSearch` is debounced by 300ms internally. The widget never filters
   * `results` itself, so async and remote search work the same way.
   */
  const search = (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const q = query.toLowerCase();
    // Simulate a round trip.
    window.setTimeout(() => {
      setResults(
        CORPUS.filter(
          (r) =>
            r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q),
        ),
      );
      setLoading(false);
    }, 250);
  };

  return (
    <SearchWidget
      onSearch={search}
      results={results}
      loading={loading}
      suggestions={['StatusBar', 'registry', 'theme']}
      onSelect={(result) => alert(`Open ${result.title}`)}
      placeholder="Search files and symbols…"
    />
  );
};
// #endregion
