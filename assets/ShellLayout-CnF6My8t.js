import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-CHKtz2QT.js";import{M as r,C as a,a as s}from"./index-CgPsZv5K.js";import{S as p,D as l}from"./ShellLayout.stories-CXaegwjs.js";import"./index-BWu4c2F4.js";import"./iframe-C2nJl1-g.js";import"./index-CTRLWg81.js";import"./index-4adcsI43.js";import"./index-DrFu-skq.js";import"./LayoutService-CTDo5xdj.js";import"./index-DoVLa59h.js";/* empty css                         */import"./MenuBar-DUoJpf2M.js";import"./ComponentRegistry-CrTMOqvj.js";import"./CommandRegistry-CX-_p1NY.js";import"./terminal-C5zE9Rg5.js";import"./createLucideIcon-Ct5j26lv.js";import"./file-text-CbpRdZ9J.js";import"./map-DgzPSx_z.js";import"./minus-BO1cfiOZ.js";import"./link-BvjYbVHw.js";import"./circle-help-CKitsLmE.js";import"./search-7zRISiAX.js";import"./x-Whvjbd09.js";import"./folder-UZmC4nkZ.js";import"./file-BM7Uy7FP.js";import"./StatusBar-B2sNiR8-.js";import"./StatusBarService-DSlFO_D9.js";import"./bundle-mjs-D19diF5V.js";import"./ActivityBar-Da3SHpV0.js";import"./SidebarService-DAfivAtX.js";import"./settings-ByHv1jwo.js";import"./SidebarPane-XMBw8aar.js";import"./ThemeService-CbKNVEQF.js";import"./ChatPane-CTlKOG1I.js";import"./ChatService-B23CmFdz.js";import"./user-DaxHjxw9.js";import"./send-D98jqded.js";import"./TerminalPane-CxnZHlBG.js";import"./TerminalService-D9kUAMKC.js";import"./chevron-up-Dmoj2g6h.js";import"./ModalStoreService-BBzXUBbe.js";import"./Boot-F92mRWnQ.js";import"./TreeWidget-SqRxI-CQ.js";import"./index-DooRJaoy.js";import"./ContextMenu-Cvj1ARww.js";import"./plus-Ca74xhiw.js";import"./trash-2-wHb9ogRm.js";import"./DataGrid-C50jr4J3.js";import"./loader-circle-BEMb1V6C.js";import"./MockupReviewWidget-GZqLMBbl.js";import"./ExecutionOverlay-By3TeQWK.js";import"./message-square-qBHjt7M5.js";import"./FlowControlToolbar-CWq55CyQ.js";import"./rotate-ccw-meyFcNZf.js";import"./sparkles-BxCYfVEq.js";import"./circle-CK_NQa3A.js";import"./copy-phYBoYUP.js";import"./check-OY72liom.js";import"./style-C0ueedki.js";import"./index-BSC1_hc_.js";import"./index-CSAWKFcb.js";import"./play-DZLFvn0-.js";import"./git-fork-DGrEV6Yb.js";import"./DialogueMappingWidget-C7PHFo0O.js";import"./IbisNode-DSdtxOJM.js";import"./DialogueMapperLibrary-Boa1P9aW.js";import"./circle-alert-gxhWxiZn.js";import"./bell-C8_jCsGv.js";import"./UserProfile-CdRhhQEo.js";import"./pen-Cb0p-aaW.js";import"./NexusWorkspaceTitle-Cw6bT8_-.js";import"./ThemeSwitcher-Ciyol8U8.js";import"./home-n2-TUYy2.js";import"./info-XMsdAaXM.js";function o(n){const t={code:"code",h1:"h1",h2:"h2",hr:"hr",p:"p",pre:"pre",...i(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{of:p}),`
`,e.jsx(t.h1,{id:"️-shelllayout",children:"🖥️ ShellLayout"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"ShellLayout"})," is the master application layout container and IDE-like workbench for Nexus Shell. It provides a modular, dockable tab interface powered by ",e.jsx(t.code,{children:"flexlayout-react"}),", wrapped with key workspace features like a MenuBar, StatusBar, ActivityBar, Sidebars, Terminal, and Chat panels."]}),`
`,e.jsx(t.p,{children:"It implements Inversion of Control (IoC), accepting dynamic configuration via properties and automatically bootstrapping the global registries."}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"-interactive-preview",children:"🎨 Interactive Preview"}),`
`,e.jsx(a,{of:l}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"-properties",children:"📋 Properties"}),`
`,e.jsxs(t.p,{children:["Below are the props accepted by the ",e.jsx(t.code,{children:"ShellLayout"})," component:"]}),`
`,e.jsx(s,{}),`
`,e.jsxs(t.p,{children:[`| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `,e.jsx(t.code,{children:"title"})," | ",e.jsx(t.code,{children:"React.ReactNode"})," | ",e.jsx(t.code,{children:"undefined"}),` | Title or branding elements to display on the top-left of the MenuBar. |
| `,e.jsx(t.code,{children:"rightMenuBarContent"})," | ",e.jsx(t.code,{children:"React.ReactNode"})," | ",e.jsx(t.code,{children:"undefined"}),` | Custom widgets or profile components placed on the top-right of the MenuBar. |
| `,e.jsx(t.code,{children:"panels"})," | ",e.jsx(t.code,{children:"ISidebarPanel[]"})," | ",e.jsx(t.code,{children:"undefined"}),` | Panels to register in the collapsible left Sidebar. |
| `,e.jsx(t.code,{children:"slashCommands"})," | ",e.jsx(t.code,{children:"ISlashCommand[]"})," | ",e.jsx(t.code,{children:"undefined"}),` | Custom commands to register into the Chat Pane CLI input context. |
| `,e.jsx(t.code,{children:"menuConfig"})," | ",e.jsx(t.code,{children:"Record<string, IMenuItem[]>"})," | ",e.jsx(t.code,{children:"undefined"}),` | Map of menu titles to lists of action items in the top MenuBar. |
| `,e.jsx(t.code,{children:"statusBarConfig"})," | ",e.jsx(t.code,{children:"IStatusBarWidget[]"})," | ",e.jsx(t.code,{children:"undefined"}),` | Custom indicators and buttons aligned in the footer StatusBar. |
| `,e.jsx(t.code,{children:"layoutModel"})," | ",e.jsx(t.code,{children:"Model"})," | ",e.jsx(t.code,{children:"useLayoutStore().model"})," | Optional pre-configured ",e.jsx(t.code,{children:"flexlayout-react"})," model instance for custom layouts. |"]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(t.h2,{id:"️-integration-example",children:"🛠️ Integration Example"}),`
`,e.jsxs(t.p,{children:["Here is how you can initialize the ",e.jsx(t.code,{children:"ShellLayout"})," with custom Sidebar panels, custom Menu commands, and a customized Status Bar:"]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-tsx",children:`import React from 'react';
import { ShellLayout, UserProfile, ThemeSwitcher } from 'nexus-shell';
import { Home, Settings, Info } from 'lucide-react';

const myPanels = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    component: () => <div className="p-4">Overview Dashboard</div>
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    component: () => <div className="p-4">App Settings</div>
  }
];

const myMenus = {
  'File': [
    { id: 'file.new', label: 'New Project', commandId: 'project.new' },
    { id: 'file.sep', label: '---' },
    { id: 'file.exit', label: 'Exit Application', commandId: 'app.exit' }
  ],
  'Help': [
    { id: 'help.about', label: 'About', commandId: 'app.about' }
  ]
};

export default function WorkspaceApp() {
  return (
    <ShellLayout
      title={<span className="font-bold text-primary">Nexus Workbench</span>}
      panels={myPanels}
      menuConfig={myMenus}
      rightMenuBarContent={
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          <UserProfile showName={false} />
        </div>
      }
      statusBarConfig={[
        {
          id: 'status-info',
          label: 'System OK',
          icon: Info,
          alignment: 'left'
        }
      ]}
    />
  );
}
`})})]})}function De(n={}){const{wrapper:t}={...i(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}export{De as default};
