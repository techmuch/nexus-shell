import { create } from 'zustand'
import { Model, IJsonModel, Actions, DockLocation } from 'flexlayout-react'

interface LayoutState {
  model: Model;
  dirtyTabs: Set<string>; // Set of tab IDs with unsaved changes
  storageKey: string;     // The currently active localStorage key
  disableLocalStorage: boolean;
  initLayout: (json: any, disableStorage?: boolean) => void;
  setModel: (model: Model) => void;
  setStorageKey: (key: string, fallbackLayout?: IJsonModel) => void;
  addTab: (componentName: string, title?: string, overrideConfig?: Record<string, any>) => void;
  setTabDirty: (tabId: string, dirty: boolean) => void;
  isTabDirty: (tabId: string) => boolean;
}

export const defaultLayout: IJsonModel = {
  global: { tabEnableClose: true, tabSetEnableMaximize: false, tabSetEnableDivide: true },
  borders: [
     {
       type: "border",
       location: "left",
       children: []
     }
  ],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 50,
        children: [
          {
            type: "tab",
            name: "Welcome",
            component: "welcome"
          }
        ]
      }
    ]
  }
}

export const dialogueMappingLayoutJson: IJsonModel = {
  global: { tabEnableClose: true, tabSetEnableMaximize: false, tabSetEnableDivide: true },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 20,
        children: [
          {
            type: "tab",
            name: "Node Library",
            component: "dialogue-library"
          }
        ]
      },
      {
        type: "tabset",
        weight: 60,
        children: [
          {
            type: "tab",
            name: "Dialogue Map",
            component: "dialogue-map",
            config: { hideInternalLibrary: true, hideInternalInspector: true }
          }
        ]
      },
      {
        type: "tabset",
        weight: 20,
        children: [
          {
            type: "tab",
            name: "Argument Inspector",
            component: "argument-inspector"
          }
        ]
      }
    ]
  }
}

export const dialogueMapperMenus = {
  'File': [
    { id: 'file.import', label: 'Import Map...', commandId: 'nexus.new-tab' },
    { id: 'file.export', label: 'Export Map...', commandId: 'nexus.new-tab' }
  ],
  'Edit': [
    { id: 'edit.undo', label: 'Undo Layout', commandId: 'nexus.new-tab' },
    { id: 'edit.cut', label: 'Cut Selected', commandId: 'nexus.new-tab' },
    { id: 'edit.copy', label: 'Copy Selected', commandId: 'nexus.new-tab' },
    { id: 'edit.paste', label: 'Paste Clipboard', commandId: 'nexus.new-tab' }
  ],
  'Layout': [
    { id: 'layout.vertical', label: 'Vertical Tree Layout', commandId: 'nexus.new-tab' },
    { id: 'layout.horizontal', label: 'Horizontal Flow Layout', commandId: 'nexus.new-tab' },
    { id: 'layout.grid', label: 'Grid Clean Layout', commandId: 'nexus.new-tab' }
  ],
  'Argumentation': [
    { id: 'arg.validate', label: 'Validate Logic Tree', commandId: 'nexus.new-tab' }
  ],
  'Help': [
    { id: 'help.docs', label: 'Documentation', commandId: 'nexus.new-tab' }
  ]
}

const DEFAULT_STORAGE_KEY = 'nexus-shell-layout';

/**
 * A model from JSON, with empty borders hidden.
 *
 * The default layout has a left border for tabs to be docked into, and with
 * nothing docked it still drew a 30px blank strip down the edge of every app.
 * Auto-hide removes it while it is empty; a tab dragged to the edge docks as
 * before. Applied to stored layouts too, since those carry the border and
 * not the setting — an app that wants the strip says so with
 * `borderEnableAutoHide: false`.
 */
export const layoutFromJson = (json: IJsonModel): Model =>
  Model.fromJson({ ...json, global: { borderEnableAutoHide: true, ...(json.global ?? {}) } });

export const useLayoutStore = create<LayoutState>((set, get) => {
  let initialModel: Model;
  
  if (typeof window !== 'undefined') {
    try {
      const savedLayout = localStorage.getItem(DEFAULT_STORAGE_KEY);
      if (savedLayout) {
        const json = JSON.parse(savedLayout);
        initialModel = layoutFromJson(json);

        // V1 Migration: Purge old standalone dialogue-mapper sidebars
        const componentsToRemove = new Set(['dialogue-library', 'argument-inspector']);
        const nodesToRemove: string[] = [];
        initialModel.visitNodes((n) => {
          if (n.getType() === 'tab') {
            const tabNode = n as import('flexlayout-react').TabNode;
            if (componentsToRemove.has(tabNode.getComponent() as string)) {
              nodesToRemove.push(tabNode.getId());
            }
          }
        });
        
        nodesToRemove.forEach((id) => {
          initialModel.doAction(Actions.deleteTab(id));
        });
      } else {
        initialModel = layoutFromJson(defaultLayout);
      }
    } catch (e) {
      console.warn("Failed to load layout from storage, using default", e);
      initialModel = layoutFromJson(defaultLayout);
    }
  } else {
    initialModel = layoutFromJson(defaultLayout);
  }

  return {
    model: initialModel,
    dirtyTabs: new Set<string>(),
    storageKey: DEFAULT_STORAGE_KEY,
    disableLocalStorage: false,
    initLayout: (json, disableStorage) => {
      let modelToUse: Model;
      if (json && Object.keys(json).length > 0) {
        try {
          modelToUse = layoutFromJson(json);
        } catch (e) {
          console.warn("Failed to parse init layout json, using default", e);
          modelToUse = layoutFromJson(defaultLayout);
        }
      } else {
        modelToUse = layoutFromJson(defaultLayout);
      }
      set({ model: modelToUse, disableLocalStorage: disableStorage || false });
    },
    setModel: (model) => {
      set({ model });
      const key = get().storageKey;
      if (typeof window !== 'undefined' && !get().disableLocalStorage) {
        try {
          localStorage.setItem(key, JSON.stringify(model.toJson()));
        } catch (e) {
          console.error("Failed to save layout to storage", e);
        }
      }
    },
    setStorageKey: (key, fallbackLayout) => {
      let model: Model;
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem(key);
          if (saved) {
            model = layoutFromJson(JSON.parse(saved));
          } else {
            model = layoutFromJson(fallbackLayout || defaultLayout);
          }
        } catch (e) {
          console.warn("Failed to load layout from storage for key", key, e);
          model = layoutFromJson(fallbackLayout || defaultLayout);
        }
      } else {
        model = layoutFromJson(fallbackLayout || defaultLayout);
      }
      set({ storageKey: key, model });
    },
    setTabDirty: (tabId, dirty) => {
      set((state) => {
        const newDirtyTabs = new Set(state.dirtyTabs);
        if (dirty) {
          newDirtyTabs.add(tabId);
        } else {
          newDirtyTabs.delete(tabId);
        }
        return { dirtyTabs: newDirtyTabs };
      });
    },
    isTabDirty: (tabId) => get().dirtyTabs.has(tabId),
    addTab: (componentName, title, overrideConfig) => {
      const model = get().model;
      const activeTabset = model.getActiveTabset();
      
      let targetId = activeTabset?.getId();
      if (!targetId) {
        try {
          const firstTabSet = model.getFirstTabSet();
          targetId = firstTabSet?.getId();
        } catch (e) {
          console.warn("Failed to get first tabset fallback", e);
        }
      }

      // Base config is empty. standalone views should show internal components
      const baseConfig = {};
      const config: Record<string, any> = { ...baseConfig, ...overrideConfig };

      // Prevent duplicate generic singleton tabs (Dashboard, Docs)
      if (['nexus-dashboard', 'nexus-docs'].includes(componentName)) {
        let existingTabId: string | null = null;
        model.visitNodes((n) => {
          if (n.getType() === 'tab') {
            const tabNode = n as import('flexlayout-react').TabNode;
            if (tabNode.getComponent() === componentName) {
              existingTabId = tabNode.getId();
            }
          }
        });

        if (existingTabId) {
          model.doAction(Actions.selectTab(existingTabId));
          return;
        }
      }

      // Prevent duplicate map tabs
      if (config.mapId) {
        let existingTabId: string | null = null;
        model.visitNodes((n) => {
          if (n.getType() === 'tab') {
            const tabNode = n as import('flexlayout-react').TabNode;
            if (tabNode.getConfig()?.mapId === config.mapId) {
              existingTabId = tabNode.getId();
            }
          }
        });

        if (existingTabId) {
          model.doAction(Actions.selectTab(existingTabId));
          return;
        }
      }

      // Prevent duplicate project properties tabs
      if (config.projectId) {
        let existingTabId: string | null = null;
        model.visitNodes((n) => {
          if (n.getType() === 'tab') {
            const tabNode = n as import('flexlayout-react').TabNode;
            if (tabNode.getConfig()?.projectId === config.projectId) {
              existingTabId = tabNode.getId();
            }
          }
        });

        if (existingTabId) {
          model.doAction(Actions.selectTab(existingTabId));
          return;
        }
      }
  
      if (targetId) {
          model.doAction(
              Actions.addNode(
                  { type: "tab", component: componentName, name: title || componentName, config },
                  targetId,
                  DockLocation.CENTER,
                  -1
              )
          );
      }
    }
  }
});
