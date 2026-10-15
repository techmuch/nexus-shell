// @vitest-environment node
import { describe, expect, it } from 'vitest';

/**
 * Every store is created at module scope, so importing one runs its
 * initialiser. With no `window`, `document` or `localStorage` — server-side
 * rendering, or a test that has not set up jsdom — that must not throw.
 */
describe('importing the stores without a DOM', () => {
  it('does not throw, and starts from defaults', async () => {
    expect(typeof window).toBe('undefined');

    const { useThemeStore } = await import('../../core/services/ThemeService');
    const { useUserProfileStore } = await import('../../core/services/UserProfileService');
    const { useLayoutStore } = await import('../../core/services/LayoutService');
    const { paneStore } = await import('../../core/services/PaneService');

    expect(useThemeStore.getState().theme).toBe('light');
    expect(useUserProfileStore.getState().name).toBe('Guest');
    expect(useLayoutStore.getState().model).toBeDefined();
    expect(paneStore('left').getState().activePanel).toBeNull();

    // Writes are no-ops rather than errors.
    expect(() => useThemeStore.getState().setTheme('dark')).not.toThrow();
    expect(() => useUserProfileStore.getState().updateProfile({ name: 'x' })).not.toThrow();
    expect(() => useLayoutStore.getState().addTab('desk')).not.toThrow();
  });
});
