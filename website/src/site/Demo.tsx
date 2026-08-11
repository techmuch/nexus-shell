import { useState, type ReactNode } from 'react';
import { Code2, Eye } from 'lucide-react';
import { cn } from 'nexus-shell';
import { CodeBlock } from './CodeBlock';

export interface DemoProps {
  title: string;
  /** One or two sentences on what this example demonstrates and why. */
  description?: ReactNode;
  /** The source that produced `children`, extracted from the demo file. */
  code: string;
  /** The live example. */
  children: ReactNode;
  /**
   * Remove the preview's default padding. Use for components that are meant to
   * sit flush against an edge — bars, rails, docked panes.
   */
  flush?: boolean;
  /** Fixed preview height, as a CSS length. */
  height?: string;
}

/**
 * A live example paired with its exact source.
 *
 * The preview renders the real component from `../src`, so a demo that no
 * longer compiles against the library fails the site build rather than
 * silently documenting an API that no longer exists.
 */
export const Demo = ({
  title,
  description,
  code,
  children,
  flush = false,
  height,
}: DemoProps) => {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');

  return (
    <section className="mb-10">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        <div
          role="tablist"
          aria-label={`${title} view`}
          className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-secondary/60 shrink-0"
        >
          {(
            [
              ['preview', 'Preview', Eye],
              ['code', 'Code', Code2],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                tab === id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'preview' ? (
        <div
          style={height ? { height } : undefined}
          className={cn(
            'rounded-xl border border-border bg-background overflow-hidden',
            !flush && 'p-6',
            height && 'flex flex-col',
          )}
        >
          {children}
        </div>
      ) : (
        <CodeBlock code={code} />
      )}
    </section>
  );
};
