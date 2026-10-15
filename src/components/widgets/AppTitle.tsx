import React from 'react';
import { cn } from '../../lib/cn';

export interface AppTitleProps {
  /** Primary line. Rendered uppercase in a mono face unless told otherwise. */
  title: string;
  /** Secondary line beneath the title. Omit to render a single line. */
  subtitle?: string;
  /**
   * Element shown in the leading badge, typically a 16px `lucide-react` icon.
   * Omit to render no badge at all.
   */
  icon?: React.ReactNode;
  /**
   * `'upper'` (default) renders the title in capitals; `'none'` keeps it as
   * written — for names whose casing is the brand (`InboxQL`, `iOS`).
   */
  casing?: 'upper' | 'none';
  /** Render the title in the monospace face. Defaults to `true`. */
  mono?: boolean;
  /** Extra classes merged onto the root element. */
  className?: string;
}

/**
 * A branding lockup — icon badge, title and subtitle — sized for the
 * {@link MenuBar}'s `title` slot.
 *
 * Purely presentational. Pass whatever branding your app needs; the library
 * supplies no default copy.
 *
 * @example
 * ```tsx
 * <MenuBar
 *   title={<AppTitle title="Acme Studio" subtitle="Design System" icon={<Boxes size={16} />} />}
 * />
 * ```
 */
export const AppTitle = ({
  title,
  subtitle,
  icon,
  casing = 'upper',
  mono = true,
  className,
}: AppTitleProps) => (
  <div className={cn('flex items-center space-x-3 select-none', className)}>
    {icon && (
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-inner shrink-0">
        {icon}
      </div>
    )}
    <div className="min-w-0">
      <h1
        className={cn(
          'text-xs font-black text-foreground truncate',
          casing === 'upper' && 'uppercase tracking-wider',
          mono && 'font-mono',
        )}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-[9px] text-muted-foreground font-semibold truncate">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);
