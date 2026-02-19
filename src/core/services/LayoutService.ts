import { create } from 'zustand'
import { Model, IJsonModel, Actions, DockLocation } from 'flexlayout-react'

interface LayoutState {
  model: Model;
  setModel: (model: Model) => void;
  addTab: (componentName: string, title?: string) => void;
}

const defaultLayout: IJsonModel = {
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

const STORAGE_KEY = 'nexus-shell-layout';

export const useLayoutStore = create<LayoutState>((set, get) => {
  let initialModel: Model;
  try {
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      initialModel = Model.fromJson(JSON.parse(savedLayout));
    } else {
      initialModel = Model.fromJson(defaultLayout);
    }
  } catch (e) {
    console.warn("Failed to load layout from storage, using default", e);
    initialModel = Model.fromJson(defaultLayout);
  }

  return {
    model: initialModel,
    setModel: (model) => {
      set({ model });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(model.toJson()));
    },
    addTab: (componentName, title) => {
      const model = get().model;
      const activeTabset = model.getActiveTabset();
      
      let targetId = activeTabset?.getId();
      if (!targetId) {
          // Fallback or find logic
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
