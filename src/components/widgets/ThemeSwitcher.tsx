import React from 'react';
import { useThemeStore } from '../../core/services/ThemeService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'gt', label: 'GT' },
  ] as const;

  return (
    <div 
      className={cn(
        "flex items-center border border-border rounded-lg p-0.5 bg-secondary/80 select-none",
        className
      )}
    >
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={cn(
            "px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-md transition-all font-mono cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring",
            theme === t.id
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
