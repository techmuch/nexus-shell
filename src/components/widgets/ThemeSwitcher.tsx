import { cn } from '../../lib/cn';

/** An option in the {@link ThemeSwitcher} segmented control. */
export interface IThemeOption<T extends string = string> {
  /** Value reported to `onChange`. Also used as the React key. */
  id: T;
  /** Short label shown on the segment. Kept terse — segments are compact. */
  label: string;
}

export const DEFAULT_THEME_OPTIONS: IThemeOption[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'gt', label: 'GT' },
];

export interface ThemeSwitcherProps<T extends string = string> {
  /** Currently selected theme id. */
  value: T;
  /** Called with the newly selected theme id. */
  onChange: (theme: T) => void;
  /**
   * Selectable themes. Defaults to Light / Dark / Georgia Tech, matching the
   * themes shipped in the library's stylesheet.
   */
  options?: IThemeOption<T>[];
  /** Extra classes merged onto the root element. */
  className?: string;
  /** Accessible label for the group. Defaults to `"Theme"`. */
  'aria-label'?: string;
}

/**
 * A compact segmented control for switching themes.
 *
 * Controlled — it renders `value` and reports changes through `onChange`, and
 * applies no classes to the document itself. For the store-backed variant that
 * also sets the theme class on `<html>`, see `ConnectedThemeSwitcher`.
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useState('light');
 * <ThemeSwitcher value={theme} onChange={setTheme} />
 * ```
 */
export const ThemeSwitcher = <T extends string = string>({
  value,
  onChange,
  options = DEFAULT_THEME_OPTIONS as IThemeOption<T>[],
  className,
  'aria-label': ariaLabel = 'Theme',
}: ThemeSwitcherProps<T>) => (
  <div
    role="radiogroup"
    aria-label={ariaLabel}
    className={cn(
      'flex items-center border border-border rounded-lg p-0.5 bg-secondary/80 select-none',
      className,
    )}
  >
    {options.map((option) => (
      <button
        key={option.id}
        role="radio"
        aria-checked={value === option.id}
        onClick={() => onChange(option.id)}
        className={cn(
          'px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-md transition-all font-mono cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring',
          value === option.id
            ? 'bg-primary text-primary-foreground shadow'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);
