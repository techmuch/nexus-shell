import { useState, type ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import {
  CONTROL_CLASS,
  FieldShell,
  borderClass,
  fieldId,
  type FieldProps,
} from './FieldShell';

/**
 * The property fields.
 *
 * Each is an ordinary controlled component: pass `value`, get `onChange`. They
 * share a shape so {@link PropertyPanel} can render them from descriptors, but
 * every one works perfectly well on its own.
 *
 * `mixed` is the multi-selection case — several subjects hold different values.
 * A mixed field shows a placeholder rather than one subject's value, because
 * displaying one as if it were everyone's is how a multi-edit quietly flattens
 * data.
 */

const MIXED_PLACEHOLDER = 'Mixed values';

/* -------------------------------------------------------------------------- */
/* Text                                                                       */
/* -------------------------------------------------------------------------- */

export interface TextFieldProps extends FieldProps<string> {
  /** Hint shown in an empty control. Replaced by the mixed placeholder when `mixed`. */
  placeholder?: string;
  /** Input type, for the browser's own affordances. Defaults to `"text"`. */
  inputType?: 'text' | 'url' | 'email' | 'tel' | 'password';
}

/** A single-line text property. */
export const TextField = ({
  label,
  value,
  onChange,
  description,
  mixed,
  disabled,
  error,
  placeholder,
  inputType = 'text',
  className,
}: TextFieldProps) => {
  const id = fieldId(label);
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      mixed={mixed}
      className={className}
    >
      <input
        id={id}
        type={inputType}
        value={mixed ? '' : (value ?? '')}
        placeholder={mixed ? MIXED_PLACEHOLDER : placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(CONTROL_CLASS, borderClass(error))}
      />
    </FieldShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Text area                                                                  */
/* -------------------------------------------------------------------------- */

export interface TextAreaFieldProps extends FieldProps<string> {
  /** Hint shown in an empty control. Replaced by the mixed placeholder when `mixed`. */
  placeholder?: string;
  /** Visible rows. Defaults to `4`. */
  rows?: number;
}

/** A multi-line text property — notes, descriptions, evidence. */
export const TextAreaField = ({
  label,
  value,
  onChange,
  description,
  mixed,
  disabled,
  error,
  placeholder,
  rows = 4,
  className,
}: TextAreaFieldProps) => {
  const id = fieldId(label);
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      mixed={mixed}
      className={className}
    >
      <textarea
        id={id}
        rows={rows}
        value={mixed ? '' : (value ?? '')}
        placeholder={mixed ? MIXED_PLACEHOLDER : placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(CONTROL_CLASS, borderClass(error), 'resize-y leading-relaxed')}
      />
    </FieldShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

export interface ISelectOption {
  value: string;
  label: string;
  /** Render unselectable — an unavailable choice you still want visible. */
  disabled?: boolean;
}

export interface SelectFieldProps extends FieldProps<string> {
  /** The choices, in the order they should appear. */
  options: ISelectOption[];
  /** Shown as the first, unselected entry. */
  placeholder?: string;
}

/** A choice from a fixed set. */
export const SelectField = ({
  label,
  value,
  onChange,
  description,
  mixed,
  disabled,
  error,
  options,
  placeholder,
  className,
}: SelectFieldProps) => {
  const id = fieldId(label);
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      mixed={mixed}
      className={className}
    >
      <select
        id={id}
        value={mixed ? '' : (value ?? '')}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(CONTROL_CLASS, borderClass(error), 'cursor-pointer')}
      >
        {(mixed || placeholder || value === undefined) && (
          <option value="" disabled={!placeholder}>
            {mixed ? MIXED_PLACEHOLDER : (placeholder ?? '—')}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Checkbox                                                                   */
/* -------------------------------------------------------------------------- */

export type CheckboxFieldProps = FieldProps<boolean>;

/**
 * A boolean property.
 *
 * When `mixed`, the box renders indeterminate — neither on nor off — which is
 * the only honest state for a selection that disagrees.
 */
export const CheckboxField = ({
  label,
  value,
  onChange,
  description,
  mixed,
  disabled,
  error,
  className,
}: CheckboxFieldProps) => {
  const id = fieldId(label);
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      mixed={mixed}
      inline
      className={className}
    >
      <input
        id={id}
        type="checkbox"
        checked={mixed ? false : !!value}
        // The DOM property is the only way to express indeterminate; there is
        // no attribute for it.
        ref={(element) => {
          if (element) element.indeterminate = !!mixed;
        }}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-3.5 w-3.5 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
      />
    </FieldShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Number                                                                     */
/* -------------------------------------------------------------------------- */

export interface NumberFieldProps extends FieldProps<number> {
  /** Lowest accepted value. Enforced by the browser, not by this component. */
  min?: number;
  /** Highest accepted value. Enforced by the browser, not by this component. */
  max?: number;
  /** Increment for the spinner and arrow keys. */
  step?: number;
  /** Unit shown inside the control's trailing edge, e.g. `"px"`. */
  unit?: string;
  /** Hint shown in an empty control. Replaced by the mixed placeholder when `mixed`. */
  placeholder?: string;
}

/** A numeric property. */
export const NumberField = ({
  label,
  value,
  onChange,
  description,
  mixed,
  disabled,
  error,
  min,
  max,
  step,
  unit,
  placeholder,
  className,
}: NumberFieldProps) => {
  const id = fieldId(label);
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      mixed={mixed}
      className={className}
    >
      <div className="relative">
        <input
          id={id}
          type="number"
          value={mixed || value === undefined ? '' : value}
          placeholder={mixed ? MIXED_PLACEHOLDER : placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            // An empty field is not zero; report nothing rather than coercing.
            if (e.target.value === '') return;
            const next = Number(e.target.value);
            if (Number.isFinite(next)) onChange?.(next);
          }}
          className={cn(CONTROL_CLASS, borderClass(error), unit && 'pr-8')}
        />
        {unit && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </FieldShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Colour                                                                     */
/* -------------------------------------------------------------------------- */

export interface ColorFieldProps extends FieldProps<string> {
  /** Show the hex value in an editable text box beside the swatch. Default `true`. */
  showValue?: boolean;
}

/** A colour property, as a swatch plus an editable hex value. */
export const ColorField = ({
  label,
  value,
  onChange,
  description,
  mixed,
  disabled,
  error,
  showValue = true,
  className,
}: ColorFieldProps) => {
  const id = fieldId(label);
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      mixed={mixed}
      className={className}
    >
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          // A native colour input has no empty state, so mixed falls back to a
          // neutral swatch and relies on the Mixed marker to say so.
          value={mixed ? '#888888' : (value ?? '#000000')}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-7 w-10 shrink-0 cursor-pointer rounded border border-border bg-background disabled:opacity-50"
        />
        {showValue && (
          <input
            type="text"
            aria-label={`${label} value`}
            value={mixed ? '' : (value ?? '')}
            placeholder={mixed ? MIXED_PLACEHOLDER : '#000000'}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(CONTROL_CLASS, borderClass(error), 'font-mono')}
          />
        )}
      </div>
    </FieldShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Date                                                                       */
/* -------------------------------------------------------------------------- */

export interface DateFieldProps extends FieldProps<string> {
  /** Include a time component. Defaults to `false`. */
  withTime?: boolean;
  /** Earliest selectable date, in the same ISO form as `value`. */
  min?: string;
  /** Latest selectable date, in the same ISO form as `value`. */
  max?: string;
}

/**
 * A date property, as an ISO `yyyy-mm-dd` string (or `yyyy-mm-ddThh:mm` with
 * `withTime`). A string rather than a `Date` so it round-trips through JSON
 * unchanged.
 */
export const DateField = ({
  label,
  value,
  onChange,
  description,
  mixed,
  disabled,
  error,
  withTime = false,
  min,
  max,
  className,
}: DateFieldProps) => {
  const id = fieldId(label);
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      mixed={mixed}
      className={className}
    >
      <input
        id={id}
        type={withTime ? 'datetime-local' : 'date'}
        value={mixed ? '' : (value ?? '')}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(CONTROL_CLASS, borderClass(error))}
      />
    </FieldShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Tags                                                                       */
/* -------------------------------------------------------------------------- */

export interface TagFieldProps extends FieldProps<string[]> {
  /** Hint shown in the draft box. Defaults to `"Add and press Enter"`. */
  placeholder?: string;
  /** Offer these as a datalist while typing. */
  suggestions?: string[];
}

/**
 * A list-of-strings property.
 *
 * Enter or the add button commits the draft; duplicates and blanks are
 * rejected silently rather than with an error, since neither is a mistake worth
 * interrupting for.
 */
export const TagField = ({
  label,
  value,
  onChange,
  description,
  mixed,
  disabled,
  error,
  placeholder = 'Add and press Enter',
  suggestions,
  className,
}: TagFieldProps) => {
  const [draft, setDraft] = useState('');
  const id = fieldId(label);
  const tags = mixed ? [] : (value ?? []);

  const commit = () => {
    const tag = draft.trim();
    if (!tag || tags.includes(tag)) {
      setDraft('');
      return;
    }
    onChange?.([...tags, tag]);
    setDraft('');
  };

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      mixed={mixed}
      className={className}
    >
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => onChange?.(tags.filter((t) => t !== tag))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <input
          id={id}
          type="text"
          list={suggestions ? `${id}-suggestions` : undefined}
          value={draft}
          placeholder={mixed ? MIXED_PLACEHOLDER : placeholder}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            commit();
          }}
          className={cn(CONTROL_CLASS, borderClass(error))}
        />
        <button
          type="button"
          aria-label={`Add ${label}`}
          disabled={disabled || !draft.trim()}
          onClick={commit}
          className="shrink-0 rounded-md border border-border px-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
        >
          <Plus size={13} />
        </button>
      </div>

      {suggestions && (
        <datalist id={`${id}-suggestions`}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </FieldShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Static                                                                     */
/* -------------------------------------------------------------------------- */

export interface StaticFieldProps extends Omit<FieldProps<ReactNode>, 'onChange'> {
  /** Render in a monospaced face — ids, hashes, coordinates. */
  mono?: boolean;
}

/**
 * A read-only property: an id, a timestamp, a computed total.
 *
 * Present because inspectors are full of values worth showing and not worth
 * editing, and a disabled text input reads as "you may not edit this yet"
 * rather than "this is derived".
 */
export const StaticField = ({
  label,
  value,
  description,
  mixed,
  mono = false,
  className,
}: StaticFieldProps) => (
  <FieldShell label={label} description={description} mixed={mixed} className={className}>
    <p
      className={cn(
        'break-words text-xs text-foreground',
        mono && 'font-mono text-[11px]',
        (mixed || value === undefined || value === '') && 'text-muted-foreground/60',
      )}
    >
      {mixed ? MIXED_PLACEHOLDER : ((value as ReactNode) ?? '—')}
    </p>
  </FieldShell>
);
