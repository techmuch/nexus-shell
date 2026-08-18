import { useEffect, useState, type ReactNode } from 'react';
import { BookOpen, Github, Menu, Moon, Palette, Rocket, Search, Sun, X } from 'lucide-react';
import { BUNDLED_THEMES, cn } from 'nexus-shell';
import { Link, useRouter } from '@site/lib/router';
import { componentsByCategory } from '@site/content/components';
import { QuickSearchModal } from '@site/site/QuickSearchModal';

declare const __SITE_BASE__: string;

const GITHUB_URL = 'https://github.com/techmuch/nexus-shell';
const STORYBOOK_URL = `${__SITE_BASE__.replace(/\/$/, '')}/storybook/`;

const THEME_KEY = 'nexus-site-theme';

const useTheme = () => {
  const [theme, setTheme] = useState<string>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || 'dark';
  });

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, setTheme, toggle };
};

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/docs/getting-started', label: 'Getting Started' },
  { to: '/docs/architecture', label: 'Architecture' },
  { to: '/showcase', label: 'Showcase' },
  { to: '/components', label: 'Components' },
];

const Wordmark = () => (
  <span className="flex items-center gap-2.5 font-bold tracking-tight text-foreground text-base">
    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 grid place-items-center shrink-0 shadow-sm shadow-primary/20">
      <span className="w-3 h-3 rounded-sm bg-primary-foreground/90" />
    </span>
    Nexus Shell
  </span>
);

/** Sidebar shown on documentation and component pages. */
const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { route } = useRouter();
  const groups = componentsByCategory();

  const item = (to: string, label: string, tagline?: string) => (
    <Link
      key={to}
      to={to}
      onClick={onNavigate}
      className={cn(
        'block px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200',
        route === to
          ? 'bg-primary/15 text-primary shadow-xs font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
      )}
    >
      {label}
      {tagline && (
        <span className="block text-[11px] text-muted-foreground/70 truncate mt-0.5">{tagline}</span>
      )}
    </Link>
  );

  return (
    <nav className="space-y-6" aria-label="Documentation">
      <div>
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          Guides
        </p>
        <div className="space-y-1">
          {item('/docs/getting-started', 'Getting Started')}
          {item('/docs/architecture', 'Architecture')}
          {item('/docs/theming', 'Theming')}
          {item('/showcase', 'Showcase & Examples')}
          {item('/components', 'All components')}
        </div>
      </div>

      {groups.map(({ category, items }) => (
        <div key={category}>
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            {category}
          </p>
          <div className="space-y-1">
            {items.map((c) => item(`/components/${c.slug}`, c.name))}
          </div>
        </div>
      ))}
    </nav>
  );
};

export const Layout = ({
  children,
  sidebar = true,
}: {
  children: ReactNode;
  sidebar?: boolean;
}) => {
  const { theme, setTheme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
            className="lg:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="hover:opacity-90 transition-opacity shrink-0">
            <Wordmark />
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium" aria-label="Main">
            {NAV.slice(1).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1 max-w-sm ml-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/70 bg-card/40 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Search size={14} className="text-primary" />
                <span className="hidden sm:inline">Search docs & components…</span>
                <span className="sm:hidden">Search…</span>
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-muted border border-border text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Multi-theme selector */}
            <div className="relative flex items-center gap-1 px-2 py-1 rounded-lg border border-border/70 bg-card/40 text-xs">
              <Palette size={14} className="text-primary shrink-0" />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                aria-label="Theme selector"
                className="bg-transparent text-xs text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer font-medium pr-1"
              >
                {BUNDLED_THEMES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-card text-foreground">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <a
              href={STORYBOOK_URL}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/70 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
            >
              <BookOpen size={14} className="text-primary" />
              Storybook
            </a>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <Github size={18} />
            </a>

            <button
              type="button"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-400" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex gap-10">
        {sidebar && (
          <>
            <aside className="hidden lg:block w-56 shrink-0 py-10">
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                <Sidebar />
              </div>
            </aside>

            {mobileOpen && (
              <div className="lg:hidden fixed inset-0 top-16 z-30 bg-background/95 backdrop-blur-lg overflow-y-auto p-6">
                <Sidebar onNavigate={() => setMobileOpen(false)} />
              </div>
            )}
          </>
        )}

        <main className={cn('flex-1 min-w-0 py-10', sidebar && 'max-w-4xl')}>{children}</main>
      </div>

      <footer className="border-t border-border/80 bg-muted/10 mt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <span className="font-normal">MIT licensed. Built with Nexus Shell’s own components.</span>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/docs/getting-started" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5 font-medium">
              <Rocket size={14} className="text-primary" />
              <span>Get started</span>
            </Link>
            <Link to="/showcase" className="hover:text-foreground transition-colors font-medium">
              Showcase
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors font-medium">
              GitHub
            </a>
            <a href={STORYBOOK_URL} className="hover:text-foreground transition-colors font-medium">
              Storybook
            </a>
          </div>
        </div>
      </footer>

      {/* Global QuickSearch modal */}
      <QuickSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
