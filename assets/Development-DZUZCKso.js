import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-CHKtz2QT.js";import{M as r}from"./index-CxRvCMhZ.js";import"./index-BWu4c2F4.js";import"./iframe-DMC7FgU4.js";import"./index-DlVbWVVj.js";import"./index-4adcsI43.js";import"./index-DrFu-skq.js";function s(t){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"Guides/Development Best Practices"}),`
`,e.jsx(n.h1,{id:"-development--extension-best-practices",children:"🛠 Development & Extension Best Practices"}),`
`,e.jsx(n.p,{children:"This guide outlines step-by-step guidelines and coding standards for developing new features, layouts, and components within the Nexus Shell ecosystem."}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-1-scoped--dom-aware-keyboard-listeners",children:"🎹 1. Scoped & DOM-Aware Keyboard Listeners"}),`
`,e.jsxs(n.p,{children:["When adding global keyboard listeners (e.g., listening to ",e.jsx(n.code,{children:"keydown"})," for hotkeys or workspace toggle switches), you must ensure they do not fire contextually if their tab is inactive or hidden."]}),`
`,e.jsx(n.h3,{id:"best-practices",children:"Best Practices:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"DOM Visibility Checks"}),": Before executing hotkey logic, check if the component container is visible in the active DOM (using ",e.jsx(n.code,{children:"offsetParent === null"})," aborts)."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Scope to Active Tab"}),": Scope hotkeys to fire only when their respective tab pane is active in the workbench."]}),`
`]}),`
`,e.jsx(n.h3,{id:"implementation-example",children:"Implementation Example:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useEffect, useRef } from 'react';

export function MyTabWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Abort if component container is unmounted or hidden
      if (!containerRef.current || containerRef.current.offsetParent === null) {
        return;
      }

      // 2. Process command hotkeys
      if (e.key === 'Delete') {
        e.preventDefault();
        console.log('Delete command triggered within active container');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <div ref={containerRef} className="h-full w-full">Content</div>;
}
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-2-tailwind-purging-safeguards",children:"🎨 2. Tailwind Purging Safeguards"}),`
`,e.jsxs(n.p,{children:["Nexus Shell integrates third-party interactive libraries (like ",e.jsx(n.code,{children:"reactflow"})," and ",e.jsx(n.code,{children:"flexlayout-react"}),"). Overriding their default styles in Tailwind requires special care to prevent selectors from being purged during build steps."]}),`
`,e.jsx(n.h3,{id:"best-practice",children:"Best Practice:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:["Place Overrides Outside ",e.jsx(n.code,{children:"@layer"})]}),": Custom styles targeting external package class names (e.g. ",e.jsx(n.code,{children:".flexlayout__layout"}),", ",e.jsx(n.code,{children:".react-flow__node"}),") must be declared ",e.jsx(n.strong,{children:"outside"})," Tailwind's ",e.jsx(n.code,{children:"@layer base"}),", ",e.jsx(n.code,{children:"@layer components"}),", or ",e.jsx(n.code,{children:"@layer utilities"})," directives in ",e.jsx(n.code,{children:"index.css"}),". This prevents them from being purged when the classes are dynamically generated at runtime."]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-3-canvas-layout-cleanliness",children:"🧹 3. Canvas Layout Cleanliness"}),`
`,e.jsxs(n.p,{children:["When embedding visual mapping canvas overlays or interactive layouts (e.g., using ",e.jsx(n.code,{children:"reactflow"})," elements):"]}),`
`,e.jsx(n.h3,{id:"best-practice-1",children:"Best Practice:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Hide Attributions"}),": Always configure canvas elements to suppress default watermarks or attribution badges to maintain a premium, branded workspace look."]}),`
`,e.jsxs(n.li,{children:["Set ",e.jsx(n.code,{children:"proOptions={{ hideAttribution: true }}"})," on ",e.jsx(n.code,{children:"<ReactFlow>"})," instances."]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-4-decoupled-zustand-state-management",children:"📦 4. Decoupled Zustand State Management"}),`
`,e.jsx(n.p,{children:"State stores must be modular and focused. Avoid massive, monolithic stores."}),`
`,e.jsx(n.h3,{id:"best-practice-2",children:"Best Practice:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"State Isolation"}),": When introducing new workstations or features, create standalone Zustand stores (e.g. ",e.jsx(n.code,{children:"useUserProfileStore"})," or ",e.jsx(n.code,{children:"useDialogueMappingStore"}),") to separate state domains."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Storage Key Configuration"}),": Extend stores that save state to ",e.jsx(n.code,{children:"localStorage"})," to accept custom storage keys, preventing layout collisions between stories or workstation tabs."]}),`
`]})]})}function p(t={}){const{wrapper:n}={...i(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}export{p as default};
