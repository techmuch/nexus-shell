import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r as o}from"./index-BWu4c2F4.js";import{I as E,E as A,W as y,R as C,a as T,M as W}from"./ExecutionOverlay-D99DsoQe.js";import"./bundle-mjs-D19diF5V.js";import"./plus-Ca74xhiw.js";import"./createLucideIcon-Ct5j26lv.js";import"./ModalStoreService-CIxOHiHK.js";import"./index-BXm_c4be.js";import"./index-DlVbWVVj.js";import"./FlowControlToolbar-gOO_hePN.js";import"./rotate-ccw-meyFcNZf.js";import"./circle-CK_NQa3A.js";import"./trash-2-wHb9ogRm.js";import"./copy-phYBoYUP.js";import"./x-Whvjbd09.js";import"./check-OY72liom.js";import"./index-CiWQbf3J.js";import"./play-DZLFvn0-.js";const Z={title:"Compositions/MockupReviewerLayout",parameters:{layout:"fullscreen"}},l={render:()=>{const[t,s]=o.useState("select"),[r,n]=o.useState("#ef4444"),[d,a]=o.useState(null),[M,m]=o.useState(!1),[R,p]=o.useState(0);return e.jsxs("div",{className:"theme-dark bg-background text-foreground h-screen flex flex-col p-4 overflow-hidden font-sans select-none",children:[e.jsxs("header",{className:"mb-3 shrink-0 flex items-center justify-between border-b pb-2 border-border/80",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-sm font-extrabold text-primary uppercase tracking-widest font-mono",children:"Nexus Workbench Dashboard"}),e.jsx("p",{className:"text-[11px] text-muted-foreground",children:"Recomposed Layout showing all mockup reviewer components in a unified command center"})]}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("span",{className:"text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold font-mono",children:"ACTIVE STATE SYNCED"})})]}),e.jsxs("div",{className:"flex-1 grid grid-cols-12 gap-3 min-h-0 relative",children:[e.jsxs("div",{className:"col-span-4 border border-border/80 rounded-xl bg-card/25 flex flex-col overflow-hidden shadow-lg",children:[e.jsxs("div",{className:"p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0",children:[e.jsx("span",{className:"text-xs font-bold uppercase tracking-wider text-primary font-mono",children:"1. Workflow transitions graph"}),e.jsx("span",{className:"text-[10px] text-muted-foreground/80 font-medium",children:"Double-click nodes to review"})]}),e.jsx("div",{className:"flex-1 relative",children:e.jsx(y,{setActiveTab:()=>{}})})]}),e.jsxs("div",{className:"col-span-5 border border-border/80 rounded-xl bg-card/25 flex flex-col overflow-hidden shadow-lg",children:[e.jsxs("div",{className:"p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0",children:[e.jsx("span",{className:"text-xs font-bold uppercase tracking-wider text-accent font-mono",children:"2. Mockup Canvas & Annotation Viewport"}),e.jsx("span",{className:"text-[10px] text-muted-foreground/80 font-medium",children:"Draw markup and comments"})]}),e.jsxs("div",{className:"flex-1 flex overflow-hidden min-h-0",children:[e.jsx(C,{}),e.jsxs("div",{className:"flex-1 flex flex-col min-w-0 overflow-hidden",children:[e.jsx(T,{tool:t,setTool:s,color:r,setColor:n,selectedAnnotationId:d,setSelectedAnnotationId:a}),e.jsx(W,{tool:t,color:r,selectedAnnotationId:d,setSelectedAnnotationId:a})]})]})]}),e.jsxs("div",{className:"col-span-3 border border-border/80 rounded-xl bg-card/25 flex flex-col overflow-hidden shadow-lg",children:[e.jsxs("div",{className:"p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0",children:[e.jsx("span",{className:"text-xs font-bold uppercase tracking-wider text-foreground/90 font-mono",children:"3. Co-Pilot Compiler Workspace"}),e.jsx("span",{className:"text-[10px] text-muted-foreground/80 font-medium",children:"AI code-generation planner"})]}),e.jsx("div",{className:"flex-1 flex flex-col overflow-hidden",children:e.jsx(E,{setIsExecuting:m,setExecutionStep:p})})]}),e.jsx(A,{isExecuting:M,setIsExecuting:m,executionStep:R,setExecutionStep:p})]})]})}},i={render:()=>e.jsx("div",{className:"theme-dark bg-background text-foreground h-screen flex flex-col p-4",children:e.jsxs("div",{className:"flex-1 border border-border rounded-xl bg-card/40 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"p-3 border-b border-border bg-muted/25 font-bold text-xs uppercase tracking-wider font-mono",children:"Isolated Component: WorkflowMapper"}),e.jsx("div",{className:"flex-1 relative",children:e.jsx(y,{setActiveTab:()=>{}})})]})})},c={render:()=>{const[t,s]=o.useState("pen"),[r,n]=o.useState("#ef4444"),[d,a]=o.useState(null);return e.jsx("div",{className:"theme-dark bg-background text-foreground h-screen flex flex-col p-4",children:e.jsxs("div",{className:"flex-1 border border-border rounded-xl bg-card/40 flex flex-col overflow-hidden",children:[e.jsxs("div",{className:"p-3 border-b border-border bg-muted/25 font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-between",children:[e.jsx("span",{children:"Isolated Layout: Sidebar + Toolbar + Drawing Canvas"}),e.jsxs("span",{className:"text-[10px] text-muted-foreground/80 font-normal",children:["Active Tool: ",t.toUpperCase()]})]}),e.jsxs("div",{className:"flex-1 flex overflow-hidden min-h-0",children:[e.jsx(C,{}),e.jsxs("div",{className:"flex-1 flex flex-col min-w-0 overflow-hidden",children:[e.jsx(T,{tool:t,setTool:s,color:r,setColor:n,selectedAnnotationId:d,setSelectedAnnotationId:a}),e.jsx(W,{tool:t,color:r,selectedAnnotationId:d,setSelectedAnnotationId:a})]})]})]})})}},x={render:()=>{const[t,s]=o.useState(!1),[r,n]=o.useState(0);return e.jsxs("div",{className:"theme-dark bg-background text-foreground h-screen flex flex-col p-4 relative",children:[e.jsxs("div",{className:"flex-1 border border-border rounded-xl bg-card/40 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"p-3 border-b border-border bg-muted/25 font-bold text-xs uppercase tracking-wider font-mono",children:"Isolated Component: ImplementationPlanWorkspace"}),e.jsx("div",{className:"flex-1 flex flex-col overflow-hidden",children:e.jsx(E,{setIsExecuting:s,setExecutionStep:n})})]}),e.jsx(A,{isExecuting:t,setIsExecuting:s,executionStep:r,setExecutionStep:n})]})}};var f,u,b;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => {
    const [tool, setTool] = useState<'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser'>('select');
    const [color, setColor] = useState<string>('#ef4444');
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStep, setExecutionStep] = useState(0);
    return <div className="theme-dark bg-background text-foreground h-screen flex flex-col p-4 overflow-hidden font-sans select-none">
        <header className="mb-3 shrink-0 flex items-center justify-between border-b pb-2 border-border/80">
          <div>
            <h1 className="text-sm font-extrabold text-primary uppercase tracking-widest font-mono">Nexus Workbench Dashboard</h1>
            <p className="text-[11px] text-muted-foreground">Recomposed Layout showing all mockup reviewer components in a unified command center</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold font-mono">
              ACTIVE STATE SYNCED
            </span>
          </div>
        </header>

        {/* Master Workspace Grid */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 relative">
          {/* Left Panel: Workflow Mapper (React Flow canvas) */}
          <div className="col-span-4 border border-border/80 rounded-xl bg-card/25 flex flex-col overflow-hidden shadow-lg">
            <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">1. Workflow transitions graph</span>
              <span className="text-[10px] text-muted-foreground/80 font-medium">Double-click nodes to review</span>
            </div>
            <div className="flex-1 relative">
              <WorkflowMapper setActiveTab={() => {}} />
            </div>
          </div>

          {/* Middle Panel: Mockup Reviewer (Sidebar, Toolbar, Viewport) */}
          <div className="col-span-5 border border-border/80 rounded-xl bg-card/25 flex flex-col overflow-hidden shadow-lg">
            <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-accent font-mono">2. Mockup Canvas & Annotation Viewport</span>
              <span className="text-[10px] text-muted-foreground/80 font-medium">Draw markup and comments</span>
            </div>
            <div className="flex-1 flex overflow-hidden min-h-0">
              <ReviewSidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <ReviewToolbar tool={tool} setTool={setTool} color={color} setColor={setColor} selectedAnnotationId={selectedAnnotationId} setSelectedAnnotationId={setSelectedAnnotationId} />
                <MockupReviewWorkspace tool={tool} color={color} selectedAnnotationId={selectedAnnotationId} setSelectedAnnotationId={setSelectedAnnotationId} />
              </div>
            </div>
          </div>

          {/* Right Panel: Implementation Plan compiler and editor */}
          <div className="col-span-3 border border-border/80 rounded-xl bg-card/25 flex flex-col overflow-hidden shadow-lg">
            <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/90 font-mono">3. Co-Pilot Compiler Workspace</span>
              <span className="text-[10px] text-muted-foreground/80 font-medium">AI code-generation planner</span>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <ImplementationPlanWorkspace setIsExecuting={setIsExecuting} setExecutionStep={setExecutionStep} />
            </div>
          </div>

          {/* Execution overlay inside layout workspace container */}
          <ExecutionOverlay isExecuting={isExecuting} setIsExecuting={setIsExecuting} executionStep={executionStep} setExecutionStep={setExecutionStep} />
        </div>
      </div>;
  }
}`,...(b=(u=l.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var v,g,h;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <div className="theme-dark bg-background text-foreground h-screen flex flex-col p-4">
      <div className="flex-1 border border-border rounded-xl bg-card/40 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/25 font-bold text-xs uppercase tracking-wider font-mono">
          Isolated Component: WorkflowMapper
        </div>
        <div className="flex-1 relative">
          <WorkflowMapper setActiveTab={() => {}} />
        </div>
      </div>
    </div>
}`,...(h=(g=i.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var w,N,k;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const [tool, setTool] = useState<'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'comment' | 'eraser'>('pen');
    const [color, setColor] = useState<string>('#ef4444');
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    return <div className="theme-dark bg-background text-foreground h-screen flex flex-col p-4">
        <div className="flex-1 border border-border rounded-xl bg-card/40 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/25 font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-between">
            <span>Isolated Layout: Sidebar + Toolbar + Drawing Canvas</span>
            <span className="text-[10px] text-muted-foreground/80 font-normal">Active Tool: {tool.toUpperCase()}</span>
          </div>
          <div className="flex-1 flex overflow-hidden min-h-0">
            <ReviewSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <ReviewToolbar tool={tool} setTool={setTool} color={color} setColor={setColor} selectedAnnotationId={selectedAnnotationId} setSelectedAnnotationId={setSelectedAnnotationId} />
              <MockupReviewWorkspace tool={tool} color={color} selectedAnnotationId={selectedAnnotationId} setSelectedAnnotationId={setSelectedAnnotationId} />
            </div>
          </div>
        </div>
      </div>;
  }
}`,...(k=(N=c.parameters)==null?void 0:N.docs)==null?void 0:k.source}}};var S,j,I;x.parameters={...x.parameters,docs:{...(S=x.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => {
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStep, setExecutionStep] = useState(0);
    return <div className="theme-dark bg-background text-foreground h-screen flex flex-col p-4 relative">
        <div className="flex-1 border border-border rounded-xl bg-card/40 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/25 font-bold text-xs uppercase tracking-wider font-mono">
            Isolated Component: ImplementationPlanWorkspace
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <ImplementationPlanWorkspace setIsExecuting={setIsExecuting} setExecutionStep={setExecutionStep} />
          </div>
        </div>

        <ExecutionOverlay isExecuting={isExecuting} setIsExecuting={setIsExecuting} executionStep={executionStep} setExecutionStep={setExecutionStep} />
      </div>;
  }
}`,...(I=(j=x.parameters)==null?void 0:j.docs)==null?void 0:I.source}}};const $=["MasterCompositeDashboard","WorkflowMapperStory","MockupReviewerCanvasStory","ImplementationPlanStory"];export{x as ImplementationPlanStory,l as MasterCompositeDashboard,c as MockupReviewerCanvasStory,i as WorkflowMapperStory,$ as __namedExportsOrder,Z as default};
