import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{M as n}from"./MenuBar-CEolhWlz.js";import{i as c}from"./Boot-Co2_YgEP.js";import{c as r}from"./CommandRegistry-CX-_p1NY.js";import{u as m}from"./ComponentRegistry-DNDRz-Ll.js";import{r as u}from"./index-BWu4c2F4.js";import{c as g}from"./index-BXm_c4be.js";import"./LayoutService-CkFabNV-.js";import"./index-DlVbWVVj.js";import"./terminal-C5zE9Rg5.js";import"./createLucideIcon-Ct5j26lv.js";import"./file-text-CbpRdZ9J.js";import"./map-DgzPSx_z.js";import"./minus-BO1cfiOZ.js";import"./link-BvjYbVHw.js";import"./circle-help-CKitsLmE.js";import"./search-7zRISiAX.js";import"./x-Whvjbd09.js";import"./folder-UZmC4nkZ.js";import"./file-BM7Uy7FP.js";import"./SidebarService-yEaXw_BA.js";import"./ChatService-D_YOCviS.js";import"./ThemeService-BISFY8C-.js";import"./StatusBarService-DqlWWm1Q.js";import"./TerminalService-CUYaH6IJ.js";import"./ModalStoreService-D5ASpUPT.js";import"./TreeWidget-BAjp4Q8l.js";import"./index-DxIfkt58.js";import"./bundle-mjs-D19diF5V.js";import"./ContextMenu-Cvj1ARww.js";import"./plus-Ca74xhiw.js";import"./trash-2-wHb9ogRm.js";import"./DataGrid-BFtmH835.js";import"./loader-circle-BEMb1V6C.js";import"./chevron-up-Dmoj2g6h.js";import"./MockupReviewWidget-hlMxyrzp.js";import"./ExecutionOverlay-CjJTJ6i5.js";import"./message-square-qBHjt7M5.js";import"./FlowControlToolbar-CWq55CyQ.js";import"./rotate-ccw-meyFcNZf.js";import"./sparkles-BxCYfVEq.js";import"./circle-CK_NQa3A.js";import"./copy-phYBoYUP.js";import"./check-OY72liom.js";import"./style-D_hB0MQy.js";import"./index-BDXIJOco.js";import"./index-C9sIvhNO.js";import"./play-DZLFvn0-.js";import"./git-fork-DGrEV6Yb.js";import"./DialogueMappingWidget-DraTnCAP.js";import"./IbisNode-BHdOi-47.js";import"./user-DaxHjxw9.js";import"./DialogueMapperLibrary-Boa1P9aW.js";import"./circle-alert-gxhWxiZn.js";import"./bell-C8_jCsGv.js";const he={title:"Widgets/Shell/MenuBarSearch",component:n,parameters:{layout:"fullscreen"}},t={render:()=>(u.useEffect(()=>{c(),r.registerCommand({id:"story.clear-cache",label:"Clear Application Cache",keybinding:"Control+Alt+C",execute:()=>alert("Cache cleared!")}),r.registerCommand({id:"story.export-pdf",label:"Export Current Map to PDF",keybinding:"Control+Shift+E",execute:()=>alert("Exporting to PDF...")}),m.setState({nodes:[{id:"proj-1",label:"Nexus Project Alpha",type:"folder",isOpen:!0,children:[{id:"file-1",label:"system_design.map",type:"file"},{id:"file-2",label:"requirements.txt",type:"file"},{id:"file-3",label:"architecture_diagram.png",type:"file"}]},{id:"proj-2",label:"Shared Resources",type:"folder",isOpen:!0,children:[{id:"file-4",label:"reference_guide.pdf",type:"file"},{id:"file-5",label:"meeting_notes.map",type:"file"}]}]});const d=g(()=>({nodes:[{id:"node-q1",position:{x:100,y:100},data:{id:"node-q1",type:"question",title:"How should we handle auth?",description:"We need to decide between OAuth2 and Passkeys.",timestamp:"2026-06-23 08:00"}},{id:"node-i1",position:{x:300,y:100},data:{id:"node-i1",type:"idea",title:"Adopt Passkeys natively",description:"Allows secure passwordless authentication.",timestamp:"2026-06-23 08:05"}},{id:"node-pro1",position:{x:500,y:100},data:{id:"node-pro1",type:"pro",title:"Excellent UX and high security",description:"Zero passwords, simple biometric access.",timestamp:"2026-06-23 08:10"}},{id:"node-con1",position:{x:500,y:250},data:{id:"node-con1",type:"con",title:"Requires modern browser support",description:"May not be available on older machines.",timestamp:"2026-06-23 08:12"}}],setSelectedNodeId:o=>{alert(`Selected active dialogue node: ${o}`)}}));return window.useDialogueMappingStore=d,window.reactFlowInstance={setCenter:(o,l,p)=>{alert(`Panning ReactFlow viewport to center: x=${o}, y=${l} (zoom=${p.zoom})`)}},()=>{delete window.useDialogueMappingStore,delete window.reactFlowInstance}},[]),e.jsxs("div",{className:"theme-dark bg-background text-foreground h-screen p-4",children:[e.jsx("div",{className:"border border-border rounded-lg overflow-hidden shadow-2xl",children:e.jsx(n,{})}),e.jsxs("div",{className:"mt-8 max-w-xl mx-auto p-6 bg-card border rounded-lg shadow text-sm space-y-4",children:[e.jsx("h2",{className:"font-semibold text-lg text-primary",children:"Interactive Search Demo Instructions"}),e.jsxs("p",{className:"text-muted-foreground leading-relaxed",children:["Click on the ",e.jsx("strong",{children:"Search..."})," input inside the menubar above and try searching for:"]}),e.jsxs("ul",{className:"list-disc pl-5 space-y-1.5 text-xs font-mono",children:[e.jsxs("li",{children:[e.jsx("strong",{children:'"auth"'})," or ",e.jsx("strong",{children:'"passkeys"'})," to find active dialogue nodes on the canvas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:'"map"'})," or ",e.jsx("strong",{children:'"notes"'})," to find files from the workspace explorer."]}),e.jsxs("li",{children:[e.jsx("strong",{children:'"clear"'})," or ",e.jsx("strong",{children:'"pdf"'})," to find executable registry commands."]})]}),e.jsxs("p",{className:"text-[11px] text-muted-foreground/80 italic",children:["Tip: Use ",e.jsx("kbd",{className:"bg-muted px-1 border rounded",children:"↑"})," ",e.jsx("kbd",{className:"bg-muted px-1 border rounded",children:"↓"})," arrow keys to navigate and ",e.jsx("kbd",{className:"bg-muted px-1 border rounded",children:"Enter"})," to select."]})]})]}))};var i,a,s;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => {
    useEffect(() => {
      // 1. Initialize core
      initializeShell();

      // 2. Prepopulate commands in registry
      commandRegistry.registerCommand({
        id: 'story.clear-cache',
        label: 'Clear Application Cache',
        keybinding: 'Control+Alt+C',
        execute: () => alert('Cache cleared!')
      });
      commandRegistry.registerCommand({
        id: 'story.export-pdf',
        label: 'Export Current Map to PDF',
        keybinding: 'Control+Shift+E',
        execute: () => alert('Exporting to PDF...')
      });

      // 3. Seed useFileStore with mock files
      useFileStore.setState({
        nodes: [{
          id: 'proj-1',
          label: 'Nexus Project Alpha',
          type: 'folder',
          isOpen: true,
          children: [{
            id: 'file-1',
            label: 'system_design.map',
            type: 'file'
          }, {
            id: 'file-2',
            label: 'requirements.txt',
            type: 'file'
          }, {
            id: 'file-3',
            label: 'architecture_diagram.png',
            type: 'file'
          }]
        }, {
          id: 'proj-2',
          label: 'Shared Resources',
          type: 'folder',
          isOpen: true,
          children: [{
            id: 'file-4',
            label: 'reference_guide.pdf',
            type: 'file'
          }, {
            id: 'file-5',
            label: 'meeting_notes.map',
            type: 'file'
          }]
        }]
      });

      // 4. Mock the window.useDialogueMappingStore to simulate active dialogue map nodes
      const mockStore = create(() => ({
        nodes: [{
          id: 'node-q1',
          position: {
            x: 100,
            y: 100
          },
          data: {
            id: 'node-q1',
            type: 'question',
            title: 'How should we handle auth?',
            description: 'We need to decide between OAuth2 and Passkeys.',
            timestamp: '2026-06-23 08:00'
          }
        }, {
          id: 'node-i1',
          position: {
            x: 300,
            y: 100
          },
          data: {
            id: 'node-i1',
            type: 'idea',
            title: 'Adopt Passkeys natively',
            description: 'Allows secure passwordless authentication.',
            timestamp: '2026-06-23 08:05'
          }
        }, {
          id: 'node-pro1',
          position: {
            x: 500,
            y: 100
          },
          data: {
            id: 'node-pro1',
            type: 'pro',
            title: 'Excellent UX and high security',
            description: 'Zero passwords, simple biometric access.',
            timestamp: '2026-06-23 08:10'
          }
        }, {
          id: 'node-con1',
          position: {
            x: 500,
            y: 250
          },
          data: {
            id: 'node-con1',
            type: 'con',
            title: 'Requires modern browser support',
            description: 'May not be available on older machines.',
            timestamp: '2026-06-23 08:12'
          }
        }],
        setSelectedNodeId: (id: string | null) => {
          alert(\`Selected active dialogue node: \${id}\`);
        }
      }));

      // Set it on window
      (window as any).useDialogueMappingStore = mockStore;

      // Mock reactFlowInstance
      (window as any).reactFlowInstance = {
        setCenter: (x: number, y: number, options: any) => {
          alert(\`Panning ReactFlow viewport to center: x=\${x}, y=\${y} (zoom=\${options.zoom})\`);
        }
      };
      return () => {
        delete (window as any).useDialogueMappingStore;
        delete (window as any).reactFlowInstance;
      };
    }, []);
    return <div className="theme-dark bg-background text-foreground h-screen p-4">
        <div className="border border-border rounded-lg overflow-hidden shadow-2xl">
          <MenuBar />
        </div>
        
        <div className="mt-8 max-w-xl mx-auto p-6 bg-card border rounded-lg shadow text-sm space-y-4">
          <h2 className="font-semibold text-lg text-primary">Interactive Search Demo Instructions</h2>
          <p className="text-muted-foreground leading-relaxed">
            Click on the <strong>Search...</strong> input inside the menubar above and try searching for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs font-mono">
            <li><strong>"auth"</strong> or <strong>"passkeys"</strong> to find active dialogue nodes on the canvas.</li>
            <li><strong>"map"</strong> or <strong>"notes"</strong> to find files from the workspace explorer.</li>
            <li><strong>"clear"</strong> or <strong>"pdf"</strong> to find executable registry commands.</li>
          </ul>
          <p className="text-[11px] text-muted-foreground/80 italic">
            Tip: Use <kbd className="bg-muted px-1 border rounded">↑</kbd> <kbd className="bg-muted px-1 border rounded">↓</kbd> arrow keys to navigate and <kbd className="bg-muted px-1 border rounded">Enter</kbd> to select.
          </p>
        </div>
      </div>;
  }
}`,...(s=(a=t.parameters)==null?void 0:a.docs)==null?void 0:s.source}}};const ye=["InteractiveSearchDemo"];export{t as InteractiveSearchDemo,ye as __namedExportsOrder,he as default};
