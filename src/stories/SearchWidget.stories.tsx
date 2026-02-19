import type { Meta, StoryObj } from '@storybook/react';
import { SearchWidget, ISearchResult } from '../components/widgets/SearchWidget';
import { File, Folder, Code, Terminal, Globe, Settings } from 'lucide-react';
import { useState } from 'react';

const meta: Meta<typeof SearchWidget> = {
  title: 'Widgets/SearchWidget',
  component: SearchWidget,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SearchWidget>;

const mockData: ISearchResult[] = [
  { id: '1', title: 'App.tsx', description: 'src/App.tsx', icon: File, category: 'FILES' },
  { id: '2', title: 'Boot.tsx', description: 'src/core/Boot.tsx', icon: File, category: 'FILES' },
  { id: '3', title: 'registry', description: 'src/core/registry', icon: Folder, category: 'FOLDERS' },
  { id: '4', title: 'SearchWidget.tsx', description: 'src/components/widgets/SearchWidget.tsx', icon: Code, category: 'FILES' },
  { id: '5', title: 'Terminal', description: 'Built-in emulator', icon: Terminal, category: 'PLUGINS' },
  { id: '6', title: 'Network Config', description: 'Settings > Network', icon: Globe, category: 'SETTINGS' },
  { id: '7', title: 'General Settings', description: 'Global preferences', icon: Settings, category: 'SETTINGS' },
];

const suggestions = ['App.tsx', 'main.tsx', 'package.json', 'README.md', 'registry'];

export const Default: Story = {
  render: () => {
    const [results, setResults] = useState<ISearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = (q: string) => {
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      setTimeout(() => {
        const filtered = mockData.filter(item => 
          item.title.toLowerCase().includes(q.toLowerCase()) ||
          item.description?.toLowerCase().includes(q.toLowerCase())
        );
        setResults(filtered);
        setLoading(false);
      }, 500);
    };

    return (
      <div className="theme-light w-80 h-[500px] border flex flex-col shadow-xl rounded-xl overflow-hidden">
        <SearchWidget
          placeholder="Search files, settings..."
          onSearch={handleSearch}
          results={results}
          suggestions={suggestions}
          loading={loading}
          onSelect={(res) => alert(`Selected: ${res.title}`)}
        />
      </div>
    );
  }
};

export const Dark: Story = {
  render: () => (
    <div className="theme-dark w-80 h-[500px] border flex flex-col shadow-xl rounded-xl overflow-hidden">
      <SearchWidget
        onSearch={() => {}}
        results={mockData.slice(0, 3)}
        suggestions={suggestions}
        onSelect={() => {}}
      />
    </div>
  )
};

export const EmptyState: Story = {
  render: () => (
    <div className="theme-light w-80 h-[500px] border flex flex-col shadow-xl rounded-xl overflow-hidden">
      <SearchWidget
        onSearch={() => {}}
        results={[]}
        onSelect={() => {}}
      />
    </div>
  )
};
