import { GraduationCap, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

/** A theme choice offered by {@link SettingsPanel}. */
export interface ISettingsThemeOption<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

export const DEFAULT_SETTINGS_THEMES: ISettingsThemeOption[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'gt', label: 'Georgia Tech', icon: GraduationCap },
];

export interface SettingsPanelProps<T extends string = string> {
  /** Currently selected theme id. */
  theme: T;
  /** Called with the newly selected theme id. */
  onThemeChange: (theme: T) => void;
  /** Theme choices to offer. Defaults to the three bundled themes. */
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
