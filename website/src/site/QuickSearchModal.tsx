import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { QuickSearch, type IQuickSearchResult } from 'nexus-shell';
import { COMPONENTS } from '@site/content/components';
import { useRouter } from '@site/lib/router';

export interface QuickSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const STATIC_GUIDES: IQuickSearchResult[] = [
  {
    id: '/docs/getting-started',
    title: 'Getting Started',
    subtitle: 'Install, theme, and build a working shell in a few minutes',
    category: 'Guides',
  },
  {
    id: '/docs/architecture',
    title: 'Architecture',
    subtitle: 'How registration works, and when to drop below the shell',
    category: 'Guides',
  },
  {
    id: '/docs/theming',
    title: 'Theming',
    subtitle: 'CSS custom properties, design tokens, and custom themes',
    category: 'Guides',
  },
  {
    id: '/showcase',
    title: 'Showcase & Examples',
    subtitle: 'Full application compositions: Dialogue Mapper, IDE Workbench, Data Inspector',
    category: 'Showcase',
  },
];

const COMPONENT_SEARCH_ITEMS: IQuickSearchResult[] = COMPONENTS.map((c) => ({
  id: `/components/${c.slug}`,
  title: c.name,
  subtitle: c.tagline,
  category: `${c.category} Components`,
}));

const ALL_SEARCH_ITEMS = [...STATIC_GUIDES, ...COMPONENT_SEARCH_ITEMS];

export const QuickSearchModal = ({ open, onClose }: QuickSearchModalProps) => {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const filteredResults = query.trim()
    ? ALL_SEARCH_ITEMS.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      })
    : ALL_SEARCH_ITEMS;

  const handleSelect = (item: IQuickSearchResult) => {
    onClose();
    navigate(item.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between px-4">
          <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            <Sparkles size={14} className="text-primary" />
            Quick Navigation
          </span>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
            ESC to close
          </span>
        </div>

        <div className="p-2">
          <QuickSearch
            query={query}
            onQueryChange={setQuery}
            results={filteredResults}
            onSelect={handleSelect}
            placeholder="Search components, guides, concepts… (e.g. Graph, Property, Theme)"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
