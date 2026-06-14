import { create } from 'zustand'
import { Model, IJsonModel, Actions, DockLocation } from 'flexlayout-react'

interface LayoutState {
  model: Model;
  dirtyTabs: Set<string>; // Set of tab IDs with unsaved changes
  storageKey: string;     // The currently active localStorage key
  setModel: (model: Model) => void;
  setStorageKey: (key: string, fallbackLayout?: IJsonModel) => void;
  addTab: (componentName: string, title?: string) => void;
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
        weight: 22,
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
        weight: 56,
        children: [
          {
            type: "tab",
            name: "Dialogue Map",
            component: "dialogue-map",
            config: {
              hideInternalLibrary: true,
              hideInternalInspector: true
            }
          }
        ]
      },
      {
        type: "tabset",
        weight: 22,
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

export const useLayoutStore = create<LayoutState>((set, get) => {
  let initialModel: Model;
  
  if (typeof window !== 'undefined') {
    try {
      const savedLayout = localStorage.getItem(DEFAULT_STORAGE_KEY);
      if (savedLayout) {
        initialModel = Model.fromJson(JSON.parse(savedLayout));
      } else {
        initialModel = Model.fromJson(defaultLayout);
      }
    } catch (e) {
      console.warn("Failed to load layout from storage, using default", e);
      initialModel = Model.fromJson(defaultLayout);
    }
  } else {
    initialModel = Model.fromJson(defaultLayout);
  }

  return {
    model: initialModel,
    dirtyTabs: new Set<string>(),
    storageKey: DEFAULT_STORAGE_KEY,
    setModel: (model) => {
      set({ model });
      const key = get().storageKey;
      if (typeof window !== 'undefined') {
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
            model = Model.fromJson(JSON.parse(saved));
          } else {
            model = Model.fromJson(fallbackLayout || defaultLayout);
          }
        } catch (e) {
          console.warn("Failed to load layout from storage for key", key, e);
          model = Model.fromJson(fallbackLayout || defaultLayout);
        }
      } else {
        model = Model.fromJson(fallbackLayout || defaultLayout);
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
    addTab: (componentName, title) => {
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
  
      if (targetId) {
          model.doAction(
              Actions.addNode(
                  { type: "tab", component: componentName, name: title || componentName },
                  targetId,
                  DockLocation.CENTER,
                  -1
              )
          );
      }
    }
  }
})
