import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Props every field in this family accepts. */
export interface FieldProps<T> {
  /** Label shown above the control. */
  label: string;
  /** Current value. `undefined` renders as empty. */
  value: T | undefined;
  /** Called with the new value. */
  onChange?: (value: T) => void;
  /** One line under the label explaining the property. */
  description?: string;
  /**
   * Selected subjects hold different values. The control shows a placeholder
   * instead of a value, and editing applies to all of them.
   */
  mixed?: boolean;
  /** Render read-only. */
  disabled?: boolean;
  /** Validation message, shown in the destructive colour. */
  error?: string;
  /** Extra classes merged onto the field wrapper. */
  className?: string;
}

export interface FieldShellProps {
  /** Label shown above the control, or beside it when `inline`. */
  label: string;
  /** Associates the label with the control. */
  htmlFor?: string;
  /** One line under the control explaining the property. Hidden while `error` is set. */
  description?: string;
  /** Validation message, shown in the destructive colour in place of the description. */
  error?: string;
  /** Selected subjects hold different values — renders the *Mixed* marker beside the label. */
  mixed?: boolean;
  /** The control itself. */
  children: ReactNode;
  /**
   * Render the label beside the control rather than above. Suits checkboxes,
   * where a label on its own line reads as a heading for nothing.
   */
  inline?: boolean;
  /** Extra classes merged onto the field wrapper. */
  className?: string;
}

/**
 * The label, description and error frame shared by every property field.
 *
 * Exported so a bespoke field looks like the built-in ones without copying
 * their markup — which is exactly what went wrong in the examples this family
 * replaces, where the same label styling was pasted into three inspectors.
 *
 * @example
 * ```tsx
 * <FieldShell label="Opacity" description="0 to 1" htmlFor="opacity">
 *   <MyCustomSlider id="opacity" />
 * </FieldShell>
 * ```
 */
export const FieldShell = ({
  label,
  htmlFor,
  description,
  error,
  mixed,
  children,
  inline = false,
  className,
}: FieldShellProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {!inline && (
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
        {mixed && (
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">
            Mixed
          </span>
        )}
      </div>
    )}

    {inline ? (
      <div className="flex items-center gap-2">
        {children}
        <label htmlFor={htmlFor} className="text-xs text-foreground select-none">
          {label}
        </label>
        {mixed && (
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">
            Mixed
          </span>
        )}
      </div>
    ) : (
      children
    )}

    {description && !error && (
      <p className="text-[11px] text-muted-foreground/80 leading-snug">{description}</p>
    )}
    {error && <p className="text-[11px] text-destructive leading-snug">{error}</p>}
  </div>
);

/** Shared control styling, so every field lines up. */
export const CONTROL_CLASS =
  'w-full rounded-md border bg-background px-2.5 py-1.5 text-xs text-foreground ' +
  'placeholder:text-muted-foreground/60 transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const borderClass = (error?: string) =>
  error ? 'border-destructive' : 'border-border';

/** A stable id per field, so labels associate without the caller supplying one. */
export const fieldId = (label: string, suffix = '') =>
  `property-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${suffix}`;
