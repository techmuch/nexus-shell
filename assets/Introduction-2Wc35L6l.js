import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as t}from"./index-CHKtz2QT.js";import{M as r}from"./index-CnKZG90S.js";import"./index-BWu4c2F4.js";import"./iframe-Bnc4HxF8.js";import"./index-DlVbWVVj.js";import"./index-4adcsI43.js";import"./index-DrFu-skq.js";function i(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...t(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"Introduction"}),`
`,e.jsx(n.h1,{id:"-nexus-shell-component-library--workbench",children:"🚀 Nexus Shell Component Library & Workbench"}),`
`,e.jsxs(n.p,{children:["Welcome to the documentation site for ",e.jsx(n.strong,{children:"Nexus Shell"}),", a professional-grade React/TypeScript design system and composite workstation library."]}),`
`,e.jsxs(n.p,{children:["This library is built with a ",e.jsx(n.strong,{children:"decoupled, registry-driven architecture"})," (Inversion of Control) and features theme-adaptive styling driven entirely by CSS custom properties and Tailwind CSS."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-installation--setup",children:"📦 Installation & Setup"}),`
`,e.jsx(n.p,{children:"Install the package via npm:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`npm install nexus-shell
`})}),`
`,e.jsxs(n.p,{children:["Import the global design system styles in your entry file (e.g., ",e.jsx(n.code,{children:"main.tsx"})," or ",e.jsx(n.code,{children:"index.ts"}),"):"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`import 'nexus-shell/style.css';
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-color-ontologies--theming",children:"🎨 Color Ontologies & Theming"}),`
`,e.jsx(n.p,{children:"Nexus Shell comes out of the box with three main semantic themes:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Light Theme"})," (",e.jsx(n.code,{children:"theme-light"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Dark Theme"})," (",e.jsx(n.code,{children:"theme-dark"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Georgia Tech Theme"})," (",e.jsx(n.code,{children:"theme-gt"}),")"]}),`
`]}),`
`,e.jsx(n.p,{children:"To activate a theme, wrap your workspace (or document root) in the corresponding class name:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-html",children:`<div className="theme-dark bg-background text-foreground">
  <!-- Content here -->
</div>
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-project-structure-taxonomy",children:"🛠 Project Structure Taxonomy"}),`
`,e.jsx(n.p,{children:"Our Storybook documentation is organized into three main namespaces to help you find what you need:"}),`
`,e.jsxs(n.h3,{id:"1-compositions",children:["1. ",e.jsx(n.code,{children:"Compositions/"})]}),`
`,e.jsx(n.p,{children:"These are full layouts that combine multiple widgets into complete workspaces."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"ShellLayout"}),": The master IDE/workbench wrapper containing menu bars, terminals, chat panels, and customizable FlexLayout tabs."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"DialogueMappingShell"}),": A complete standalone workstation page designed for IBIS argumentation modeling."]}),`
`]}),`
`,e.jsxs(n.h3,{id:"2-widgetsshell",children:["2. ",e.jsx(n.code,{children:"Widgets/Shell/"})]}),`
`,e.jsx(n.p,{children:"Core infrastructure controls that frame the IDE/workbench layout."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"MenuBar"}),": The top-header links and menus."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"StatusBar"}),": The bottom panel displaying connection statuses, git branches, and action toggles."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"ActivityBar & SidebarPane"}),": Left expandable panel indicators."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"UserProfile"}),": Decoupled account utility widget with local image uploads and inline edits."]}),`
`]}),`
`,e.jsxs(n.h3,{id:"3-widgetsdialoguemapper",children:["3. ",e.jsx(n.code,{children:"Widgets/DialogueMapper/"})]}),`
`,e.jsx(n.p,{children:"The specialized widget ecosystem for IBIS decision modeling."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"DialogueMappingWidget"}),": The React Flow graph canvas."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"DialogueMapperLibrary"}),": The palette containing the IBIS node templates (Questions, Ideas, Pro/Con arguments)."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"ArgumentInspector"}),": The side panel for viewing and modifying node logical states."]}),`
`]}),`
`,e.jsxs(n.h3,{id:"4-widgetsgeneral",children:["4. ",e.jsx(n.code,{children:"Widgets/General/"})]}),`
`,e.jsx(n.p,{children:"Other generic, reusable UI widgets."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"DataGrid"}),": A premium virtualization table."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"TreeWidget"}),": Explorer directory files lists."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"WargameMap"}),": A hexagonal grid gaming canvas."]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-getting-started-with-compositions",children:"🚀 Getting Started with Compositions"}),`
`,e.jsxs(n.p,{children:["To instantiate a complete workbench workspace with custom tabs and menus, import the ",e.jsx(n.code,{children:"ShellLayout"})," component:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { ShellLayout, UserProfile, ThemeSwitcher } from 'nexus-shell';

function App() {
  return (
    <ShellLayout
      title={<div className="font-bold text-sm">Custom Workspace</div>}
      rightMenuBarContent={
        <div className="flex items-center space-x-3">
          <ThemeSwitcher />
          <UserProfile showName={false} />
        </div>
      }
    />
  );
}
`})})]})}function p(s={}){const{wrapper:n}={...t(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{p as default};
