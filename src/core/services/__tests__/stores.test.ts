import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../ThemeService';
import { useSidebarStore, ISidebarPanel } from '../SidebarService';
import { useLayoutStore, defaultLayout } from '../LayoutService';
import { Search } from 'lucide-react';
import React from 'react';

// Mock component for panel testing
const DummyComponent = () => React.createElement('div', null, 'Dummy');

describe('Zustand Stores Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    
    // Reset stores to initial states using setter methods to trigger side-effects
    useThemeStore.getState().setTheme('light');
    useSidebarStore.getState().setActiveSidebar(null);
    useSidebarStore.getState().setPanels([]);
    useLayoutStore.getState().initLayout(defaultLayout, false);
    useLayoutStore.getState().setStorageKey('nexus-shell-layout');
  });

  describe('ThemeService (useThemeStore)', () => {
    it('should have initial state "light"', () => {
      const state = useThemeStore.getState();
      expect(state.theme).toBe('light');
      expect(document.documentElement.classList.contains('theme-light')).toBe(true);
    });

    it('should change theme and update DOM/localStorage', () => {
      const { setTheme } = useThemeStore.getState();
      
      setTheme('dark');
      
      expect(useThemeStore.getState().theme).toBe('dark');
      expect(localStorage.getItem('nexus-shell-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
      expect(document.documentElement.classList.contains('theme-light')).toBe(false);

      setTheme('gt');
      expect(useThemeStore.getState().theme).toBe('gt');
      expect(localStorage.getItem('nexus-shell-theme')).toBe('gt');
      expect(document.documentElement.classList.contains('theme-gt')).toBe(true);
      expect(document.documentElement.classList.contains('theme-dark')).toBe(false);
    });
  });

  describe('SidebarService (useSidebarStore)', () => {
    it('should have initial activeSidebar as null and empty panels', () => {
      const state = useSidebarStore.getState();
      expect(state.activeSidebar).toBeNull();
      expect(state.panels).toEqual([]);
    });

    it('should set active sidebar and update localStorage', () => {
      const { setActiveSidebar } = useSidebarStore.getState();
      
      setActiveSidebar('explorer');
      expect(useSidebarStore.getState().activeSidebar).toBe('explorer');
      expect(localStorage.getItem('nexus-shell-sidebar')).toBe('explorer');

      setActiveSidebar(null);
      expect(useSidebarStore.getState().activeSidebar).toBeNull();
      expect(localStorage.getItem('nexus-shell-sidebar')).toBeNull();
    });

    it('should toggle sidebar active state', () => {
      const { toggleSidebar } = useSidebarStore.getState();

      toggleSidebar('search');
      expect(useSidebarStore.getState().activeSidebar).toBe('search');
      expect(localStorage.getItem('nexus-shell-sidebar')).toBe('search');

      toggleSidebar('search');
      expect(useSidebarStore.getState().activeSidebar).toBeNull();
      expect(localStorage.getItem('nexus-shell-sidebar')).toBeNull();
    });

    it('should set panels', () => {
      const { setPanels } = useSidebarStore.getState();
      const mockPanels: ISidebarPanel[] = [
        {
          id: 'test-panel',
          label: 'Test Panel',
          icon: Search,
          component: DummyComponent
        }
      ];

      setPanels(mockPanels);
      expect(useSidebarStore.getState().panels).toEqual(mockPanels);
    });
  });

  describe('LayoutService (useLayoutStore)', () => {
    it('should have correct initial state', () => {
      const state = useLayoutStore.getState();
      expect(state.model).toBeDefined();
      expect(state.dirtyTabs.size).toBe(0);
      expect(state.storageKey).toBe('nexus-shell-layout');
      expect(state.disableLocalStorage).toBe(false);
    });

    it('should initialize layout and toggle storage disabling', () => {
      const { initLayout } = useLayoutStore.getState();
      const customLayout = {
        global: {},
        layout: {
          type: "row",
          children: [
            {
              type: "tabset",
              children: [
                { type: "tab", name: "Custom Tab", component: "custom" }
              ]
            }
          ]
        }
      };

      initLayout(customLayout, true);

      const state = useLayoutStore.getState();
      expect(state.disableLocalStorage).toBe(true);
      const layoutJson = state.model.toJson() as any;
      expect(layoutJson.layout.children[0].children[0].name).toBe("Custom Tab");
    });

    it('should track and untrack dirty tabs', () => {
      const { setTabDirty, isTabDirty } = useLayoutStore.getState();

      setTabDirty('tab-1', true);
      expect(isTabDirty('tab-1')).toBe(true);
      expect(useLayoutStore.getState().dirtyTabs.has('tab-1')).toBe(true);

      setTabDirty('tab-1', false);
      expect(isTabDirty('tab-1')).toBe(false);
      expect(useLayoutStore.getState().dirtyTabs.has('tab-1')).toBe(false);
    });

    it('should change storage key and load fallback or saved layout', () => {
      const { setStorageKey } = useLayoutStore.getState();
      const mockSavedLayout = {
        global: {},
        layout: {
          type: "row",
          children: [
            {
              type: "tabset",
              children: [
                { type: "tab", name: "Saved Tab", component: "saved" }
              ]
            }
          ]
        }
      };

      localStorage.setItem('custom-key', JSON.stringify(mockSavedLayout));

      setStorageKey('custom-key');
      const state = useLayoutStore.getState();
      expect(state.storageKey).toBe('custom-key');
      const layoutJson = state.model.toJson() as any;
      expect(layoutJson.layout.children[0].children[0].name).toBe("Saved Tab");
    });
  });
});
