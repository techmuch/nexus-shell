import { createElement } from 'react';
import { ArrowLeft, ArrowRight, FileCode2 } from 'lucide-react';
import { CodeBlock } from '@site/site/CodeBlock';
import { Demo } from '@site/site/Demo';
import { H2, Paragraphs } from '@site/site/Prose';
import { PropsTable, apiFor } from '@site/site/PropsTable';
import { Link } from '@site/lib/router';
import { demoModule, demoSource } from '@site/lib/source';
import { COMPONENTS, componentBySlug } from '@site/content/components';

const GITHUB_BLOB = 'https://github.com/techmuch/nexus-shell/blob/main';

export const ComponentPage = ({ slug }: { slug: string }) => {
  const entry = componentBySlug(slug);

  if (!entry) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-3">Component not found</h1>
        <Link to="/components" className="text-primary hover:underline">
          Back to all components
        </Link>
      </div>
    );
  }

  const api = apiFor(entry.name);
  const module = demoModule(entry.demoFile);

  const index = COMPONENTS.findIndex((c) => c.slug === slug);
  const prev = COMPONENTS[index - 1];
  const next = COMPONENTS[index + 1];

  /** The component's own JSDoc, minus the `@example` block shown separately. */
  const description = api?.description ?? '';

  return (
    <article>
      <header className="mb-10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
          {entry.category}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{entry.name}</h1>
        <p className="text-lg text-muted-foreground mt-2">{entry.tagline}</p>

        {api && (
          <a
            href={`${GITHUB_BLOB}/${api.file}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-[12px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileCode2 size={13} />
            {api.file}
          </a>
        )}
      </header>

      {description && (
        <div className="mb-8">
          <Paragraphs items={description.split('\n\n').filter(Boolean)} />
        </div>
      )}

      {entry.notes && entry.notes.length > 0 && (
        <div className="mb-10 rounded-xl border border-border bg-muted/25 p-5">
          <Paragraphs items={entry.notes} />
        </div>
      )}

      <div className="mb-4">
        <CodeBlock label="import" code={`import { ${entry.name} } from 'nexus-shell';`} />
      </div>

      <H2 id="examples">Examples</H2>

      {entry.demos.map((demo) => {
        const Component = module[demo.export];
        const code = demoSource(entry.demoFile, demo.region ?? demo.export);

        return (
          <Demo
            key={demo.export}
            title={demo.title}
            description={demo.description}
            code={code}
            flush={demo.flush}
            height={demo.height}
          >
            {Component ? (
              createElement(Component)
            ) : (
              <p className="text-sm text-destructive">
                Demo “{demo.export}” is not exported from {entry.demoFile}.tsx
              </p>
            )}
          </Demo>
        );
      })}

      <H2 id="props">Props</H2>
      <PropsTable component={entry.name} />

      {api?.example && (
        <>
          <H2 id="usage">Typical usage</H2>
          <CodeBlock code={api.example} />
        </>
      )}

      <nav className="mt-16 pt-8 border-t border-border flex items-center justify-between gap-4">
        {prev ? (
          <Link
            to={`/components/${prev.slug}`}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            <span>
              <span className="block text-[11px] uppercase tracking-widest opacity-60">
                Previous
              </span>
              {prev.name}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next && (
          <Link
            to={`/components/${next.slug}`}
            className="group flex items-center gap-2 text-sm text-right text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>
              <span className="block text-[11px] uppercase tracking-widest opacity-60">Next</span>
              {next.name}
            </span>
            <ArrowRight size={14} />
          </Link>
        )}
      </nav>
    </article>
  );
};
