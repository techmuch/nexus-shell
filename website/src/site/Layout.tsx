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
  <span className="flex items-center gap-2 font-semibold tracking-tight">
    <span className="w-6 h-6 rounded-md bg-primary grid place-items-center shrink-0">
      <span className="w-2.5 h-2.5 rounded-sm bg-primary-foreground" />
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
        'block px-3 py-1.5 rounded-md text-[13px] transition-colors',
        route === to
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
      )}
    >
      {label}
      {tagline && (
        <span className="block text-[11px] text-muted-foreground/60 truncate">{tagline}</span>
      )}
    </Link>
  );

  return (
    <nav className="space-y-6" aria-label="Documentation">
      <div>
        <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Guides
        </p>
        {item('/docs/getting-started', 'Getting Started')}
        {item('/docs/architecture', 'Architecture')}
        {item('/docs/theming', 'Theming')}
        {item('/components', 'All components')}
      </div>

      {groups.map(({ category, items }) => (
        <div key={category}>
          <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            {category}
          </p>
          {items.map((c) => item(`/components/${c.slug}`, c.name))}
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
            className="lg:hidden p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link to="/" className="text-sm hover:opacity-80 transition-opacity shrink-0">
            <Wordmark />
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-[13px]" aria-label="Main">
            {NAV.slice(1).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <a
            href={STORYBOOK_URL}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <BookOpen size={14} />
            Storybook
          </a>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <Github size={16} />
          </a>

          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
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
              <div className="lg:hidden fixed inset-0 top-14 z-30 bg-background overflow-y-auto p-6">
                <Sidebar onNavigate={() => setMobileOpen(false)} />
              </div>
            )}
          </>
        )}

        <main className={cn('flex-1 min-w-0 py-10', sidebar && 'max-w-4xl')}>{children}</main>
      </div>

      <footer className="border-t border-border mt-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-muted-foreground">
          <span>MIT licensed. Built with Nexus Shell’s own components.</span>
          <div className="flex items-center gap-5">
            <Link to="/docs/getting-started" className="hover:text-foreground transition-colors">
              <span className="flex items-center gap-1.5">
                <Rocket size={13} /> Get started
              </span>
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href={STORYBOOK_URL} className="hover:text-foreground transition-colors">
              Storybook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
