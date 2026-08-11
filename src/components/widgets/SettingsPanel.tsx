import { GraduationCap, Moon, Palette, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { BUNDLED_THEMES } from '../../lib/themes';

/** A theme choice offered by {@link SettingsPanel}. */
export interface ISettingsThemeOption<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

/** Icons for the bundled themes; anything unlisted falls back to a palette. */
const THEME_ICONS: Record<string, LucideIcon> = {
  light: Sun,
  dark: Moon,
  gt: GraduationCap,
  tamu: GraduationCap,
};

/**
 * The themes bundled in the library stylesheet, with their full labels.
 * Derived from the theme registry, so a new bundled theme appears here without
 * a code change.
 */
export const DEFAULT_SETTINGS_THEMES: ISettingsThemeOption[] = BUNDLED_THEMES.map((t) => ({
  id: t.id,
  label: t.label,
  icon: THEME_ICONS[t.id] ?? Palette,
}));

export interface SettingsPanelProps<T extends string = string> {
  /** Currently selected theme id. */
  theme: T;
  /** Called with the newly selected theme id. */
  onThemeChange: (theme: T) => void;
  /** Theme choices to offer. Defaults to every bundled theme. */
  themes?: ISettingsThemeOption<T>[];
  /** Extra classes merged onto the root element. */
  className?: string;
}

/**
 * Sidebar body for the Settings panel: a vertical list of theme choices.
 *
 * Split out of {@link SidebarPane} so the pane stays a generic container. Pass
 * this (or your own component) as the sidebar's `children`.
 *
 * @example
 * ```tsx
 * <SidebarPane title="Settings" onClose={close}>
 *   <SettingsPanel theme={theme} onThemeChange={setTheme} />
 * </SidebarPane>
 * ```
 */
export const SettingsPanel = <T extends string = string>({
  theme,
  onThemeChange,
  themes = DEFAULT_SETTINGS_THEMES as ISettingsThemeOption<T>[],
  className,
}: SettingsPanelProps<T>) => (
  <div className={cn('p-4 space-y-6', className)}>
    <section>
      <h3 className="text-[11px] font-bold text-muted-foreground uppercase mb-3">
        Theme
      </h3>
      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid grid-cols-1 gap-2"
      >
        {themes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={theme === id}
            onClick={() => onThemeChange(id)}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-md border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring',
              theme === id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-accent border-border',
            )}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  </div>
);
