import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as s}from"./index-CHKtz2QT.js";import{M as d,C as i,a as t}from"./index-CgPsZv5K.js";import{D as c,a as l,L as h}from"./DialogueMappingWidget.stories-Bfr5AcYS.js";import"./index-BWu4c2F4.js";import"./iframe-C2nJl1-g.js";import"./index-CTRLWg81.js";import"./index-4adcsI43.js";import"./index-DrFu-skq.js";import"./DialogueMappingWidget-C7PHFo0O.js";import"./style-C0ueedki.js";import"./index-DoVLa59h.js";import"./IbisNode-DSdtxOJM.js";import"./ModalStoreService-BBzXUBbe.js";import"./bundle-mjs-D19diF5V.js";import"./createLucideIcon-Ct5j26lv.js";import"./folder-UZmC4nkZ.js";import"./user-DaxHjxw9.js";import"./minus-BO1cfiOZ.js";import"./check-OY72liom.js";import"./file-text-CbpRdZ9J.js";import"./plus-Ca74xhiw.js";import"./circle-help-CKitsLmE.js";import"./ContextMenu-Cvj1ARww.js";import"./FlowControlToolbar-CWq55CyQ.js";import"./rotate-ccw-meyFcNZf.js";import"./sparkles-BxCYfVEq.js";import"./DialogueMapperLibrary-Boa1P9aW.js";import"./trash-2-wHb9ogRm.js";import"./circle-alert-gxhWxiZn.js";import"./index-BSC1_hc_.js";import"./index-CSAWKFcb.js";import"./copy-phYBoYUP.js";function o(r){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(d,{of:c}),`
`,e.jsx(n.h1,{id:"-dialoguemappingwidget",children:"💬 DialogueMappingWidget"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"DialogueMappingWidget"})," is a node-based interactive canvas for IBIS (Issue-Based Information System) argumentation mapping. Powered by React Flow, it provides a comprehensive workspace where users can visually model discussions, weigh choices, and map logical flows."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-interactive-preview",children:"🎨 Interactive Preview"}),`
`,e.jsx(n.h3,{id:"dark-theme",children:"Dark Theme"}),`
`,e.jsx(i,{of:l}),`
`,e.jsx(n.h3,{id:"light-theme",children:"Light Theme"}),`
`,e.jsx(i,{of:h}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-properties",children:"📋 Properties"}),`
`,e.jsxs(n.p,{children:["Below are the props accepted by the ",e.jsx(n.code,{children:"DialogueMappingWidget"})," component:"]}),`
`,e.jsx(t,{}),`
`,e.jsxs(n.p,{children:[`| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `,e.jsx(n.code,{children:"mapId"})," | ",e.jsx(n.code,{children:"string"})," | ",e.jsx(n.strong,{children:"Required"}),` | The unique identifier of the dialog map. Used to retrieve and save state from storage. |
| `,e.jsx(n.code,{children:"defaultDragMode"})," | ",e.jsx(n.code,{children:"'pan' \\| 'select'"})," | ",e.jsx(n.code,{children:"'select'"}),` | Sets whether dragging the canvas pans the viewport or highlights multiple nodes. |
| `,e.jsx(n.code,{children:"node"})," | ",e.jsx(n.code,{children:"TabNode"})," | ",e.jsx(n.code,{children:"undefined"})," | Optional reference to the host FlexLayout ",e.jsx(n.code,{children:"TabNode"})," wrapper, providing visibility context. |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"️-keyboard-shortcuts",children:"⌨️ Keyboard Shortcuts"}),`
`,e.jsx(n.p,{children:"The canvas provides powerful built-in shortcuts for high-speed modeling:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"Q"})," or ",e.jsx(n.code,{children:"?"})]}),": Add a ",e.jsx(n.strong,{children:"Question"})," node."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"A"})," or ",e.jsx(n.code,{children:"!"})]}),": Add an ",e.jsx(n.strong,{children:"Idea"})," (Answer) node."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"P"})," or ",e.jsx(n.code,{children:"+"})]}),": Add a ",e.jsx(n.strong,{children:"Pro"})," argument node."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"C"})," or ",e.jsx(n.code,{children:"-"})]}),": Add a ",e.jsx(n.strong,{children:"Con"})," argument node."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"N"})}),": Add a ",e.jsx(n.strong,{children:"Note"})," node."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"D"})}),": Add a ",e.jsx(n.strong,{children:"Decision"})," node."]}),`
`,e.jsxs(n.li,{children:[e.jsxs(n.strong,{children:[e.jsx(n.code,{children:"Cmd + Z"})," / ",e.jsx(n.code,{children:"Ctrl + Z"})]}),": Undo the latest node positioning change."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:e.jsx(n.code,{children:"Arrow Keys"})}),": Navigate selection between nodes."]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"️-integration-example",children:"🛠️ Integration Example"}),`
`,e.jsxs(n.p,{children:["Here is how you can render the ",e.jsx(n.code,{children:"DialogueMappingWidget"})," within your application layout:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import React from 'react';
import { DialogueMappingWidget } from 'nexus-shell';

export default function AnalysisBoard() {
  return (
    <div className="theme-dark h-[600px] w-full border border-border rounded-lg overflow-hidden">
      <DialogueMappingWidget 
        mapId="cyber-defense-strategy-2026"
        defaultDragMode="select"
      />
    </div>
  );
}
`})})]})}function Z(r={}){const{wrapper:n}={...s(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(o,{...r})}):o(r)}export{Z as default};
