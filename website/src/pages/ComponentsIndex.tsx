import { ArrowRight } from 'lucide-react';
import { H2, P } from '@site/site/Prose';
import { Link } from '@site/lib/router';
import { componentsByCategory } from '@site/content/components';
import { apiFor } from '@site/site/PropsTable';

const CATEGORY_BLURB: Record<string, string> = {
  Shell: 'The assembled application frame — start here.',
  Chrome: 'The bars and rails the shell surrounds your content with.',
  Data: 'Displaying lists and tables, virtualised for size.',
  Overlays: 'Dialogs and menus that render above everything else.',
  Search: 'Two shapes of search, for two places in the layout.',
  Panels: 'Docked panes for conversation and command.',
  Identity: 'Who the user is, and how the app looks to them.',
};

export const ComponentsIndex = () => {
  const groups = componentsByCategory();
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <article>
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Components</h1>
        <P className="mt-3 max-w-2xl">
          {total} components. Each page has live examples you can interact with, the exact
          source that produced them, and a props table generated from the component’s own
          types.
        </P>
        <P className="mt-3 max-w-2xl">
          Most applications should start from{' '}
          <Link to="/components/shell-layout" className="text-primary hover:underline">
            ShellLayout
          </Link>
          , which assembles all of these into a working frame. The rest are documented
          individually for when you need to embed one on its own — they are pure and
          prop-driven, with no global state or registry lookups.
        </P>
      </header>

      {groups.map(({ category, items }) => (
        <section key={category}>
          <H2>{category}</H2>
          {CATEGORY_BLURB[category] && (
            <P className="-mt-2 mb-5">{CATEGORY_BLURB[category]}</P>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((component) => {
              const api = apiFor(component.name);
              return (
                <Link
                  key={component.slug}
                  to={`/components/${component.slug}`}
                  className="group rounded-xl border border-border bg-card/40 p-4 hover:border-primary/40 hover:bg-card transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[15px] text-foreground">
                      {component.name}
                    </h3>
                    <ArrowRight
                      size={14}
                      className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                    {component.tagline}
                  </p>
                  {api && (
                    <p className="text-[11px] text-muted-foreground/50 mt-2 font-mono">
                      {api.props.length} props · {component.demos.length}{' '}
                      {component.demos.length === 1 ? 'example' : 'examples'}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </article>
  );
};
