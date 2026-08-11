import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from 'nexus-shell';
import { TOKEN_CLASS, tokenize } from '@site/lib/highlight';

export interface CodeBlockProps {
  code: string;
  /** Shown in the header strip, e.g. a filename or `bash`. */
  label?: string;
  className?: string;
}

export const CodeBlock = ({ code, label, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is unavailable over plain http and in some browsers; the
      // code is selectable either way, so failing quietly is fine.
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border border-border bg-card/60 overflow-hidden group',
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 h-9 border-b border-border/60 bg-muted/40">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label ?? 'tsx'}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed font-mono">
        <code>
          {tokenize(code).map((token, i) => (
            <span key={i} className={TOKEN_CLASS[token.kind]}>
              {token.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};
