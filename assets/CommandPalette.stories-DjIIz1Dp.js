import{j as t}from"./jsx-runtime-BjG_zV1W.js";import{r as a}from"./index-BWu4c2F4.js";import{c as L}from"./StatusBarService-Cuc5oBPr.js";import{t as P,c as I}from"./bundle-mjs-D19diF5V.js";import{S as K}from"./search-BK6gW7Ez.js";import{i as z}from"./Boot-7UxZIKBv.js";import"./index-B2XhonKX.js";import"./with-selector-DCNUnGNr.js";import"./createLucideIcon-Ct5j26lv.js";import"./index-DlVbWVVj.js";import"./SidebarService-E_CB6iOX.js";import"./ChatService-moaT5vZu.js";import"./ThemeService-HNgL0KqX.js";import"./TerminalService-dKYBXmN1.js";import"./TreeWidget-DE8TlC9p.js";import"./index-DxIfkt58.js";import"./ContextMenu-BqZrHCx1.js";import"./folder-UZmC4nkZ.js";import"./file-BM7Uy7FP.js";import"./plus-Ca74xhiw.js";import"./trash-2-wHb9ogRm.js";import"./DataGrid-Nb2IFS2e.js";import"./x-Whvjbd09.js";import"./chevron-up-Dmoj2g6h.js";import"./MockupReviewWidget-DZhmHysg.js";import"./ExecutionOverlay-C_pQ0C81.js";import"./FlowControlToolbar-BFmOShZw.js";import"./rotate-ccw-meyFcNZf.js";import"./circle-CK_NQa3A.js";import"./copy-phYBoYUP.js";import"./check-OY72liom.js";import"./style-X7yiBvB1.js";import"./index-Cx8-z_gx.js";import"./play-DZLFvn0-.js";import"./git-fork-DGrEV6Yb.js";import"./download-u1JR2nuf.js";import"./DialogueMappingWidget-fWgfTPGh.js";import"./IbisNode-B3Nn9kEu.js";import"./user-DaxHjxw9.js";import"./minus-BhXvTaxs.js";import"./DialogueMapperLibrary-DmE9GRkx.js";import"./bell-C8_jCsGv.js";import"./terminal-C5zE9Rg5.js";function y(...o){return P(I(o))}const m=({commands:o,forcedOpen:n=!1})=>{const[x,d]=a.useState(n),[l,g]=a.useState(""),[f,i]=a.useState(0),h=a.useRef(null),s=(o||L.getCommands()).filter(e=>e.label.toLowerCase().includes(l.toLowerCase())||e.id.toLowerCase().includes(l.toLowerCase()));a.useEffect(()=>{d(n)},[n]),a.useEffect(()=>{const e=r=>{(r.metaKey||r.ctrlKey)&&r.shiftKey&&r.key.toLowerCase()==="p"?(r.preventDefault(),d(O=>!O),g(""),i(0)):r.key==="Escape"&&d(!1)};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[]),a.useEffect(()=>{var e;x&&((e=h.current)==null||e.focus())},[x]);const R=e=>{e.key==="ArrowDown"?(e.preventDefault(),i(r=>(r+1)%s.length)):e.key==="ArrowUp"?(e.preventDefault(),i(r=>(r-1+s.length)%s.length)):e.key==="Enter"&&(e.preventDefault(),s[f]&&b(s[f]))},b=e=>{e.execute(),n||d(!1)};return x?t.jsx("div",{className:y("z-[100] flex items-start justify-center pt-[10vh]",n?"relative pt-0 w-full max-w-xl":"fixed inset-0 bg-black/50 backdrop-blur-sm"),children:t.jsxs("div",{className:"w-full max-w-xl bg-popover text-popover-foreground border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200",children:[t.jsxs("div",{className:"flex items-center px-4 border-b",children:[t.jsx(K,{size:18,className:"text-muted-foreground mr-3"}),t.jsx("input",{ref:h,type:"text",placeholder:"Type a command to run...",className:"flex-1 h-14 bg-transparent outline-none text-base text-foreground placeholder:text-muted-foreground",value:l,onChange:e=>{g(e.target.value),i(0)},onKeyDown:R})]}),t.jsx("div",{className:"max-h-[300px] overflow-y-auto py-2",children:s.length===0?t.jsxs("div",{className:"px-4 py-8 text-center text-sm text-muted-foreground",children:['No commands found matching "',l,'"']}):s.map((e,r)=>t.jsxs("div",{className:y("px-4 py-2 cursor-pointer flex justify-between items-center text-sm",r===f?"bg-accent text-accent-foreground":"hover:bg-accent/50"),onClick:()=>b(e),onMouseEnter:()=>i(r),children:[t.jsx("span",{children:e.label}),e.keybinding&&t.jsx("span",{className:"text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50",children:e.keybinding})]},e.id))}),t.jsxs("div",{className:"px-4 py-2 border-t bg-muted/30 flex justify-between items-center text-[10px] text-muted-foreground",children:[t.jsxs("div",{className:"flex gap-3",children:[t.jsxs("span",{children:[t.jsx("kbd",{className:"bg-muted px-1 rounded border",children:"↑↓"})," to navigate"]}),t.jsxs("span",{children:[t.jsx("kbd",{className:"bg-muted px-1 rounded border",children:"Enter"})," to select"]})]}),t.jsxs("span",{children:[t.jsx("kbd",{className:"bg-muted px-1 rounded border",children:"Esc"})," to close"]})]})]})}):null};m.__docgenInfo={description:"",methods:[],displayName:"CommandPalette",props:{commands:{required:!1,tsType:{name:"Array",elements:[{name:"ICommand"}],raw:"ICommand[]"},description:""},forcedOpen:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const De={title:"Widgets/Shell/CommandPalette",component:m,parameters:{layout:"centered"}},c={decorators:[o=>(z(),t.jsx(o,{}))],args:{forcedOpen:!0},render:o=>t.jsx("div",{className:"theme-light w-[600px] h-[400px]",children:t.jsx(m,{...o})})},p={args:{forcedOpen:!0,commands:[{id:"custom.1",label:"Deploy to Production",execute:()=>alert("Deploying..."),keybinding:"Shift+Cmd+D"},{id:"custom.2",label:"Reset Local Database",execute:()=>alert("Resetting..."),keybinding:"Shift+Alt+R"},{id:"custom.3",label:"Sync with Remote",execute:()=>alert("Syncing...")},{id:"custom.4",label:"Open Documentation",execute:()=>alert("Opening docs...")}]},render:o=>t.jsx("div",{className:"theme-light w-[600px] h-[400px]",children:t.jsx(m,{...o})})},u={args:{forcedOpen:!0},render:o=>t.jsx("div",{className:"theme-dark w-[600px] h-[400px] p-4 bg-slate-900 rounded-lg",children:t.jsx(m,{...o})})};var v,w,j;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    return <Story />;
  }],
  args: {
    forcedOpen: true
  },
  render: args => <div className="theme-light w-[600px] h-[400px]">
      <CommandPalette {...args} />
    </div>
}`,...(j=(w=c.parameters)==null?void 0:w.docs)==null?void 0:j.source}}};var C,k,D;p.parameters={...p.parameters,docs:{...(C=p.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    forcedOpen: true,
    commands: [{
      id: 'custom.1',
      label: 'Deploy to Production',
      execute: () => alert('Deploying...'),
      keybinding: 'Shift+Cmd+D'
    }, {
      id: 'custom.2',
      label: 'Reset Local Database',
      execute: () => alert('Resetting...'),
      keybinding: 'Shift+Alt+R'
    }, {
      id: 'custom.3',
      label: 'Sync with Remote',
      execute: () => alert('Syncing...')
    }, {
      id: 'custom.4',
      label: 'Open Documentation',
      execute: () => alert('Opening docs...')
    }]
  },
  render: args => <div className="theme-light w-[600px] h-[400px]">
      <CommandPalette {...args} />
    </div>
}`,...(D=(k=p.parameters)==null?void 0:k.docs)==null?void 0:D.source}}};var N,S,E;u.parameters={...u.parameters,docs:{...(N=u.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    forcedOpen: true
  },
  render: args => <div className="theme-dark w-[600px] h-[400px] p-4 bg-slate-900 rounded-lg">
      <CommandPalette {...args} />
    </div>
}`,...(E=(S=u.parameters)==null?void 0:S.docs)==null?void 0:E.source}}};const Ne=["DefaultGlobal","CustomCommands","DarkTheme"];export{p as CustomCommands,u as DarkTheme,c as DefaultGlobal,Ne as __namedExportsOrder,De as default};
