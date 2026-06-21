import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-CHKtz2QT.js";import{M as s}from"./index-CxRvCMhZ.js";import"./index-BWu4c2F4.js";import"./iframe-DMC7FgU4.js";import"./index-DlVbWVVj.js";import"./index-4adcsI43.js";import"./index-DrFu-skq.js";function r(t){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",p:"p",pre:"pre",strong:"strong",...i(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"Guides/Registry Architecture (IoC)"}),`
`,e.jsx(n.h1,{id:"-registry-driven-architecture-ioc",children:"🔌 Registry-Driven Architecture (IoC)"}),`
`,e.jsxs(n.p,{children:["Nexus Shell operates on a ",e.jsx(n.strong,{children:"decoupled, registry-driven architecture"})," (Inversion of Control). Monolithic layout containers (like ",e.jsx(n.code,{children:"ShellLayout"}),") should never directly embed custom panels, widgets, or shortcuts. Instead, features must register themselves dynamically via global registry instances."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-the-four-core-registries",children:"🚦 The Four Core Registries"}),`
`,e.jsxs(n.p,{children:[`| Registry | Purpose | Key Method |
| :--- | :--- | :--- |
| `,e.jsx(n.code,{children:"componentRegistry"})," | Binds React components to panel ID strings. | ",e.jsx(n.code,{children:"componentRegistry.register(id, component)"}),` |
| `,e.jsx(n.code,{children:"commandRegistry"})," | Declares actions, keyboard hotkeys, and accelerators. | ",e.jsx(n.code,{children:"commandRegistry.registerCommand(config)"}),` |
| `,e.jsx(n.code,{children:"menuRegistry"})," | Feeds hierarchical links into the global header MenuBar. | ",e.jsx(n.code,{children:"menuRegistry.registerMenu(menuName, item)"}),` |
| `,e.jsx(n.code,{children:"pluginRegistry"})," | Manages feature lifecycles (",e.jsx(n.code,{children:"activate"})," / ",e.jsx(n.code,{children:"deactivate"}),"). | ",e.jsx(n.code,{children:"pluginRegistry.register(plugin)"})," |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-step-by-step-implementation-guide",children:"🛠 Step-by-Step implementation Guide"}),`
`,e.jsx(n.h3,{id:"step-1-register-a-component",children:"Step 1: Register a Component"}),`
`,e.jsx(n.p,{children:"Before a component can appear in a workspace tab or side panel, it must be registered with a unique string ID."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`import { componentRegistry } from 'nexus-shell';
import MyWidget from './MyWidget';

// Register the component loader function
componentRegistry.register('my-unique-widget', () => <MyWidget />);
`})}),`
`,e.jsx(n.h3,{id:"step-2-declare-an-action-command",children:"Step 2: Declare an Action (Command)"}),`
`,e.jsxs(n.p,{children:["A command defines an executable action and optional keyboard shortcuts. Registered commands automatically populate the ",e.jsx(n.strong,{children:"Command Palette"})," (",e.jsx(n.code,{children:"Ctrl+Shift+P"}),")."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`import { commandRegistry } from 'nexus-shell';

commandRegistry.registerCommand({
  id: 'my-feature.save-data',
  label: 'Save Workspace Data',
  keybinding: 'Control+S',
  execute: () => {
    console.log('Data saved successfully!');
  }
});
`})}),`
`,e.jsx(n.h3,{id:"step-3-add-the-action-to-the-menu-bar",children:"Step 3: Add the Action to the Menu Bar"}),`
`,e.jsx(n.p,{children:"Link your registered command to a category in the top Menu Bar."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`import { menuRegistry } from 'nexus-shell';

menuRegistry.registerMenu('File', {
  id: 'menu-file.save',
  label: 'Save Workspace',
  commandId: 'my-feature.save-data',
});
`})}),`
`,e.jsx(n.h3,{id:"step-4-package-as-a-plugin-lifecycle-hook",children:"Step 4: Package as a Plugin (Lifecycle Hook)"}),`
`,e.jsx(n.p,{children:"For complex features, bundle registrations inside a plugin. This allows the system to activate and clean up registrations dynamically."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`import { IPlugin, componentRegistry, commandRegistry } from 'nexus-shell';

export const AnalyticsPlugin: IPlugin = {
  id: 'analytics-plugin',
  name: 'Analytics Dashboard',
  activate: () => {
    // 1. Register dashboard components
    componentRegistry.register('analytics-tab', () => <AnalyticsWidget />);
    
    // 2. Register command
    commandRegistry.registerCommand({
      id: 'analytics.refresh',
      label: 'Refresh Dashboard Metrics',
      execute: () => { /* Refresh metrics logic */ },
    });
  },
  deactivate: () => {
    // Perform cleanup steps if necessary
  }
};
`})})]})}function g(t={}){const{wrapper:n}={...i(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(r,{...t})}):r(t)}export{g as default};
