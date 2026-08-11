import { useEffect, useState, type ReactNode } from 'react';
import { BookOpen, Github, Menu, Moon, Rocket, Sun, X } from 'lucide-react';
import { cn } from 'nexus-shell';
import { Link, useRouter } from '@site/lib/router';
import { componentsByCategory } from '@site/content/components';

declare const __SITE_BASE__: string;

const GITHUB_URL = 'https://github.com/techmuch/nexus-shell';
const STORYBOOK_URL = `${__SITE_BASE__.replace(/\/$/, '')}/storybook/`;

const THEME_KEY = 'nexus-site-theme';

const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
};

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/docs/getting-started', label: 'Getting Started' },
  { to: '/docs/architecture', label: 'Architecture' },
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
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center gap-6">
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

          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium" aria-label="Main">
            {NAV.slice(1).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3.5 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <a
              href={STORYBOOK_URL}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/70 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
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
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors font-medium">
              GitHub
            </a>
            <a href={STORYBOOK_URL} className="hover:text-foreground transition-colors font-medium">
              Storybook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

