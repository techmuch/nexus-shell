export type ThemeType = 'light' | 'dark' | 'gt';
interface ThemeState {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}
export declare const useThemeStore: import('zustand').UseBoundStore<import('zustand').StoreApi<ThemeState>>;
export {};
