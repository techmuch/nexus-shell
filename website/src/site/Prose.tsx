import type { ReactNode } from 'react';
import { cn } from 'nexus-shell';

/** Render inline `code` spans and **bold** runs in plain-text copy. */
export const inline = (text: string): ReactNode[] =>
  text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="font-mono text-[0.9em] px-1 py-0.5 rounded bg-muted text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });

export const P = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <p className={cn('text-[15px] leading-relaxed text-muted-foreground', className)}>
    {children}
  </p>
);

export const Paragraphs = ({ items }: { items: string[] }) => (
  <div className="space-y-4">
    {items.map((text, i) => (
      <P key={i}>{inline(text)}</P>
    ))}
  </div>
);

export const H2 = ({ id, children }: { id?: string; children: ReactNode }) => (
  <h2
    id={id}
    className="text-xl font-semibold tracking-tight text-foreground mt-14 mb-4 scroll-mt-24"
  >
    {children}
  </h2>
);

export const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="text-base font-semibold tracking-tight text-foreground mt-8 mb-3">
    {children}
  </h3>
);

export const Callout = ({
  title,
  children,
  tone = 'info',
}: {
  title: string;
  children: ReactNode;
  tone?: 'info' | 'warn';
}) => (
  <aside
    className={cn(
      'rounded-xl border p-4 my-6',
      tone === 'warn'
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-primary/25 bg-primary/5',
    )}
  >
    <p className="text-[13px] font-semibold text-foreground mb-1.5">{title}</p>
    <div className="text-[14px] leading-relaxed text-muted-foreground">{children}</div>
  </aside>
);
