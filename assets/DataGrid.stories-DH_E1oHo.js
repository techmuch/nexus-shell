import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{D as a}from"./DataGrid-BFtmH835.js";import{r as I}from"./index-BWu4c2F4.js";import{C as M}from"./circle-check-big-DtpIkIcH.js";import{c as $}from"./createLucideIcon-Ct5j26lv.js";import{P as z}from"./play-DZLFvn0-.js";import{R as V}from"./rotate-ccw-meyFcNZf.js";import"./index-DxIfkt58.js";import"./index-DlVbWVVj.js";import"./bundle-mjs-D19diF5V.js";import"./search-7zRISiAX.js";import"./x-Whvjbd09.js";import"./loader-circle-BEMb1V6C.js";import"./chevron-up-Dmoj2g6h.js";/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=$("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]),Z={title:"Widgets/General/DataGrid",component:a,parameters:{layout:"padded"}},s=[{key:"id",header:"ID",width:"10%",sortable:!0},{key:"name",header:"Agent Name",width:"25%",sortable:!0},{key:"type",header:"Type",width:"15%",sortable:!0},{key:"status",header:"Status",width:"15%",sortable:!0,render:r=>{const n={idle:"bg-muted text-muted-foreground border-border",running:"bg-primary/15 text-primary border-primary/20 animate-pulse",failed:"bg-destructive/15 text-destructive border-destructive/20",completed:"bg-green-500/15 text-green-500 border-green-500/20"},t={idle:e.jsx(V,{size:12,className:"mr-1.5 text-muted-foreground"}),running:e.jsx(z,{size:12,className:"mr-1.5 text-primary"}),failed:e.jsx(E,{size:12,className:"mr-1.5 text-destructive"}),completed:e.jsx(M,{size:12,className:"mr-1.5 text-green-500"})};return e.jsxs("span",{className:`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${n[r]||""}`,children:[t[r],String(r).toUpperCase()]})}},{key:"uptime",header:"Uptime",width:"15%",sortable:!0,render:r=>`${Number(r).toLocaleString()}s`},{key:"accuracy",header:"Accuracy",width:"20%",sortable:!0,render:r=>`${(Number(r)*100).toFixed(1)}%`}],d=[{id:"agt-001",name:"Strategic Planner",type:"ReAct Agent",status:"running",uptime:3600,accuracy:.942},{id:"agt-002",name:"Translation Pipeline",type:"Translator",status:"idle",uptime:7200,accuracy:.985},{id:"agt-003",name:"Vulnerability Scanner",type:"Security Validator",status:"failed",uptime:120,accuracy:.45},{id:"agt-004",name:"Log Classifier",type:"Classifier",status:"completed",uptime:18e3,accuracy:.91},{id:"agt-005",name:"Risk Evaluator",type:"Critic Agent",status:"running",uptime:4200,accuracy:.897}],o={render:()=>e.jsx("div",{className:"theme-light bg-background text-foreground p-4 rounded border",children:e.jsx("div",{className:"h-96",children:e.jsx(a,{columns:s,data:d})})})},c={render:()=>e.jsx("div",{className:"theme-dark bg-background text-foreground p-4 rounded border",children:e.jsx("div",{className:"h-96",children:e.jsx(a,{columns:s,data:d})})})},i={render:()=>e.jsx("div",{className:"theme-gt bg-background text-foreground p-4 rounded border",children:e.jsx("div",{className:"h-96",children:e.jsx(a,{columns:s,data:d})})})},l={render:()=>e.jsx("div",{className:"theme-dark bg-background text-foreground p-4 rounded border",children:e.jsx("div",{className:"h-96",children:e.jsx(a,{columns:s,data:d,loading:!0})})})},m={render:()=>{const r=Array.from({length:2e3}).map((n,t)=>{const p=["idle","running","failed","completed"],g=["ReAct Agent","Translator","Security Validator","Classifier","Critic Agent"];return{id:`agt-${String(t+1).padStart(4,"0")}`,name:`Agent ${t+1}`,type:g[t%g.length],status:p[t%p.length],uptime:Math.floor(Math.random()*86400),accuracy:.5+Math.random()*.5}});return e.jsx("div",{className:"theme-dark bg-background text-foreground p-4 rounded border",children:e.jsx("div",{className:"h-96",children:e.jsx(a,{columns:s,data:r})})})}},u={render:()=>{const[r,n]=I.useState(null);return e.jsxs("div",{className:"theme-dark bg-background text-foreground p-4 rounded border flex flex-col space-y-4",children:[e.jsx("div",{className:"h-96 flex-1",children:e.jsx(a,{columns:s,data:d,onRowClick:t=>n(t),selectedRowId:r==null?void 0:r.id})}),r?e.jsxs("div",{className:"p-4 bg-muted/30 border border-border rounded-lg flex flex-col space-y-2",children:[e.jsx("h4",{className:"text-xs font-bold uppercase tracking-wider text-muted-foreground",children:"Selected Agent Inspection"}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 text-sm",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block text-xs",children:"Name:"}),e.jsx("span",{className:"font-semibold",children:r.name})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block text-xs",children:"Uptime:"}),e.jsxs("span",{children:[r.uptime.toLocaleString()," seconds"]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block text-xs",children:"Target Accuracy:"}),e.jsxs("span",{className:"font-mono font-medium",children:[(r.accuracy*100).toFixed(2),"%"]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block text-xs",children:"Type:"}),e.jsx("span",{children:r.type})]})]})]}):e.jsx("div",{className:"p-4 bg-muted/10 border border-dashed border-border rounded-lg text-center text-xs text-muted-foreground italic",children:"Click a row in the data grid to view details"})]})}};var x,h,b;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div className="theme-light bg-background text-foreground p-4 rounded border">
      <div className="h-96">
        <DataGrid columns={columns} data={sampleData} />
      </div>
    </div>
}`,...(b=(h=o.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var f,v,y;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div className="theme-dark bg-background text-foreground p-4 rounded border">
      <div className="h-96">
        <DataGrid columns={columns} data={sampleData} />
      </div>
    </div>
}`,...(y=(v=c.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var N,k,j;i.parameters={...i.parameters,docs:{...(N=i.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <div className="theme-gt bg-background text-foreground p-4 rounded border">
      <div className="h-96">
        <DataGrid columns={columns} data={sampleData} />
      </div>
    </div>
}`,...(j=(k=i.parameters)==null?void 0:k.docs)==null?void 0:j.source}}};var A,S,D;l.parameters={...l.parameters,docs:{...(A=l.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div className="theme-dark bg-background text-foreground p-4 rounded border">
      <div className="h-96">
        <DataGrid columns={columns} data={sampleData} loading />
      </div>
    </div>
}`,...(D=(S=l.parameters)==null?void 0:S.docs)==null?void 0:D.source}}};var w,C,R;m.parameters={...m.parameters,docs:{...(w=m.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const largeData: AgentRecord[] = Array.from({
      length: 2000
    }).map((_, index) => {
      const statuses: AgentRecord['status'][] = ['idle', 'running', 'failed', 'completed'];
      const types = ['ReAct Agent', 'Translator', 'Security Validator', 'Classifier', 'Critic Agent'];
      return {
        id: \`agt-\${String(index + 1).padStart(4, '0')}\`,
        name: \`Agent \${index + 1}\`,
        type: types[index % types.length],
        status: statuses[index % statuses.length],
        uptime: Math.floor(Math.random() * 86400),
        accuracy: 0.5 + Math.random() * 0.5
      };
    });
    return <div className="theme-dark bg-background text-foreground p-4 rounded border">
        <div className="h-96">
          <DataGrid columns={columns} data={largeData} />
        </div>
      </div>;
  }
}`,...(R=(C=m.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var G,L,T;u.parameters={...u.parameters,docs:{...(G=u.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => {
    const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
    return <div className="theme-dark bg-background text-foreground p-4 rounded border flex flex-col space-y-4">
        <div className="h-96 flex-1">
          <DataGrid columns={columns} data={sampleData} onRowClick={row => setSelectedAgent(row)} selectedRowId={selectedAgent?.id} />
        </div>
        
        {selectedAgent ? <div className="p-4 bg-muted/30 border border-border rounded-lg flex flex-col space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Selected Agent Inspection
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Name:</span>
                <span className="font-semibold">{selectedAgent.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Uptime:</span>
                <span>{selectedAgent.uptime.toLocaleString()} seconds</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Target Accuracy:</span>
                <span className="font-mono font-medium">{(selectedAgent.accuracy * 100).toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Type:</span>
                <span>{selectedAgent.type}</span>
              </div>
            </div>
          </div> : <div className="p-4 bg-muted/10 border border-dashed border-border rounded-lg text-center text-xs text-muted-foreground italic">
            Click a row in the data grid to view details
          </div>}
      </div>;
  }
}`,...(T=(L=u.parameters)==null?void 0:L.docs)==null?void 0:T.source}}};const ee=["Light","Dark","GeorgiaTech","Loading","LargeDataset","Interactive"];export{c as Dark,i as GeorgiaTech,u as Interactive,m as LargeDataset,o as Light,l as Loading,ee as __namedExportsOrder,Z as default};
