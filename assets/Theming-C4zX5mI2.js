import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as s}from"./index-CHKtz2QT.js";import{M as o}from"./index-DC8Z6mbQ.js";import"./index-BWu4c2F4.js";import"./iframe-CzrOGmt2.js";import"./index-DlVbWVVj.js";import"./index-4adcsI43.js";import"./index-DrFu-skq.js";function t(r){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...s(),...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{title:"Guides/Theming & Styling"}),`
`,e.jsx(n.h1,{id:"-theming--styling-guidelines",children:"🎨 Theming & Styling Guidelines"}),`
`,e.jsxs(n.p,{children:["Nexus Shell uses a ",e.jsx(n.strong,{children:"theme-adaptive design system"})," driven entirely by CSS custom properties (variables) combined with Tailwind CSS. Instead of hardcoding background or text colors, all components reference semantic token variables."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-the-core-design-tokens",children:"🏛 The Core Design Tokens"}),`
`,e.jsxs(n.p,{children:["All styles map to CSS custom properties defined in ",e.jsx(n.code,{children:"index.css"}),". The main variables you should use and extend include:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-css",children:`:root {
  --background: 0 0% 100%;       /* Main app background */
  --foreground: 240 10% 3.9%;    /* Default text color */
  --card: 0 0% 100%;             /* Card panels */
  --card-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;       /* Primary action buttons */
  --primary-foreground: 0 0% 98%;
  --accent: 240 4.8% 95.9%;      /* Hover / Active selection highlight */
  --accent-foreground: 240 5.9% 10%;
  --border: 240 5.9% 90%;        /* Layout borders and lines */
  --ring: 240 5.9% 10%;          /* Accessibility focus indicator ring */
}
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-built-in-themes",children:"🌗 Built-in Themes"}),`
`,e.jsx(n.p,{children:"Nexus Shell ships with three production-ready themes. To apply a theme, wrap your workstation container in the corresponding class name:"}),`
`,e.jsxs(n.p,{children:[`| Theme Class | Name | Contrast Target | Description |
| :--- | :--- | :--- | :--- |
| `,e.jsx(n.code,{children:"theme-light"}),` | Light Theme | Standard AA | Clean, light gray workbench optimized for bright environments. |
| `,e.jsx(n.code,{children:"theme-dark"})," | Dark Theme | High Contrast | Soft dark theme. Avoids pure white text (",e.jsx(n.code,{children:"hsl(240, 5%, 85%)"}),`) to prevent glare and reduce eye strain. |
| `,e.jsx(n.code,{children:"theme-gt"})," | Georgia Tech Theme | Specialized Gold/Blue | Gold primary accents (",e.jsx(n.code,{children:"hsl(45, 100%, 46%)"}),") matched with deep navy accents. |"]}),`
`,e.jsx(n.h3,{id:"usage-example",children:"Usage Example"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`export default function App() {
  return (
    // Wrap the top-level container in your desired theme class
    <div className="theme-dark min-h-screen bg-background text-foreground">
      <ShellLayout />
    </div>
  );
}
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-best-practices-for-custom-themes",children:"🛠 Best Practices for Custom Themes"}),`
`,e.jsx(n.p,{children:"To create your own theme:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Define a custom theme class selector (e.g., ",e.jsx(n.code,{children:".theme-forest"}),")."]}),`
`,e.jsx(n.li,{children:"Override the HSL color tokens."}),`
`,e.jsxs(n.li,{children:["Make sure background and foreground colors satisfy the target ",e.jsx(n.strong,{children:"4.5:1"})," contrast ratio (WCAG AA) for standard text."]}),`
`]}),`
`,e.jsx(n.h3,{id:"example-stylesheet",children:"Example Stylesheet:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-css",children:`.theme-forest {
  --background: 140 30% 12%;
  --foreground: 140 10% 90%;
  --card: 140 25% 15%;
  --card-foreground: 140 10% 95%;
  --primary: 142 76% 36%;
  --primary-foreground: 0 0% 100%;
  --accent: 140 20% 25%;
  --accent-foreground: 142 76% 36%;
  --border: 140 20% 20%;
  --ring: 142 76% 36%;
}
`})})]})}function g(r={}){const{wrapper:n}={...s(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(t,{...r})}):t(r)}export{g as default};
