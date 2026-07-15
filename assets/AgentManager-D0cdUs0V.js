import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as s}from"./index-CHKtz2QT.js";import{M as i,C as a,a as o}from"./index-CgPsZv5K.js";import{A as d,D as c}from"./AgentManager.stories-DgNpQsP_.js";import"./index-BWu4c2F4.js";import"./iframe-C2nJl1-g.js";import"./index-CTRLWg81.js";import"./index-4adcsI43.js";import"./index-DrFu-skq.js";import"./style-C0ueedki.js";import"./index-DoVLa59h.js";import"./bundle-mjs-D19diF5V.js";import"./ModalStoreService-BBzXUBbe.js";import"./plus-Ca74xhiw.js";import"./createLucideIcon-Ct5j26lv.js";import"./pen-Cb0p-aaW.js";import"./trash-2-wHb9ogRm.js";import"./save-azSZiDGr.js";import"./x-Whvjbd09.js";import"./index-BSC1_hc_.js";import"./index-CSAWKFcb.js";function r(t){const n={code:"code",h1:"h1",h2:"h2",hr:"hr",p:"p",pre:"pre",...s(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(i,{of:d}),`
`,e.jsx(n.h1,{id:"-agentmanager",children:"🤖 AgentManager"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"AgentManager"})," is a dashboard and visual flow editor for orchestrating AI agents and node-graph pipelines. Built with React Flow, it provides a comprehensive node palette (models, templates, retrievers, lambdas) allowing developers to visually construct multi-agent loops and visual workflows, customize parameter settings in an inspector drawer, and persist agent schemas."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-interactive-preview",children:"🎨 Interactive Preview"}),`
`,e.jsx(a,{of:c}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-properties",children:"📋 Properties"}),`
`,e.jsxs(n.p,{children:["Below are the props accepted by the ",e.jsx(n.code,{children:"AgentManager"})," component:"]}),`
`,e.jsx(o,{}),`
`,e.jsxs(n.p,{children:[`| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `,e.jsx(n.code,{children:"agents"})," | ",e.jsx(n.code,{children:"Agent[]"})," | ",e.jsx(n.code,{children:"[]"}),` | List of defined agents to display in the overview dashboard cards. |
| `,e.jsx(n.code,{children:"onFetchAgents"})," | ",e.jsx(n.code,{children:"() => void"})," | ",e.jsx(n.code,{children:"undefined"}),` | Callback fired when the agent list is loaded or needs to refresh. |
| `,e.jsx(n.code,{children:"onSaveAgent"})," | ",e.jsx(n.code,{children:"(agent: Partial<Agent>) => Promise<Agent \\| void>"})," | ",e.jsx(n.code,{children:"undefined"}),` | Async handler triggered when an agent is created or saved from the visual flow designer. |
| `,e.jsx(n.code,{children:"onDeleteAgent"})," | ",e.jsx(n.code,{children:"(id: string) => Promise<void>"})," | ",e.jsx(n.code,{children:"undefined"}),` | Async handler triggered when an agent is deleted from the dashboard. |
| `,e.jsx(n.code,{children:"title"})," | ",e.jsx(n.code,{children:"string"})," | ",e.jsx(n.code,{children:"'AI Agents'"}),` | Dashboard panel title header. |
| `,e.jsx(n.code,{children:"subtitle"})," | ",e.jsx(n.code,{children:"string"})," | ",e.jsx(n.code,{children:"'Manage and visually build your AI agents.'"}),` | Dashboard panel description subtitle. |
| `,e.jsx(n.code,{children:"className"})," | ",e.jsx(n.code,{children:"string"})," | ",e.jsx(n.code,{children:"undefined"})," | Custom styling class to apply to the manager outer layout. |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-data-schemas",children:"🧬 Data Schemas"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`export interface Agent {
  id: string;
  name: string;
  description: string;
  schemaJson: string; // Serialized React Flow state (nodes, edges)
}
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"️-integration-example",children:"🛠️ Integration Example"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import React, { useState } from 'react';
import { AgentManager, Agent } from 'nexus-shell';

const initialData: Agent[] = [
  {
    id: 'summarizer-agent',
    name: 'Report Summarizer',
    description: 'Polls incoming reports and outputs concise bullet points.',
    schemaJson: '{"nodes":[],"edges":[]}'
  }
];

export default function BotDeveloperSuite() {
  const [agents, setAgents] = useState<Agent[]>(initialData);

  const handleSave = async (updated: Partial<Agent>) => {
    if (updated.id) {
      setAgents(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } as Agent : a));
    }
  };

  const handleDelete = async (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="h-screen w-full">
      <AgentManager 
        agents={agents}
        onSaveAgent={handleSave}
        onDeleteAgent={handleDelete}
      />
    </div>
  );
}
`})})]})}function z(t={}){const{wrapper:n}={...s(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(r,{...t})}):r(t)}export{z as default};
