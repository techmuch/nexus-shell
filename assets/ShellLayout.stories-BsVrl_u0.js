import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{u as $,l as v,d as oe,a as ae}from"./LayoutService-C4iIiTmL.js";/* empty css                         */import{M as ne}from"./MenuBar-CzCCzTo-.js";import{S as se,I as ie}from"./StatusBar-BWhRPKnj.js";import{A as le}from"./ActivityBar-CdMaPrQQ.js";import{S as ce}from"./SidebarPane-BtF06Ko-.js";import{C as me}from"./ChatPane-CUn3rnGH.js";import{T as de}from"./TerminalPane-DXCTVjo8.js";import{u as pe}from"./ThemeService-HNgL0KqX.js";import{u as ue}from"./SidebarService-E_CB6iOX.js";import{a as he}from"./ChatService-moaT5vZu.js";import{u as fe}from"./StatusBarService-BlWI523p.js";import{m as ge,c as xe}from"./ComponentRegistry-BO303J9N.js";import{r as n}from"./index-BWu4c2F4.js";import{i as a}from"./Boot-vo8POysp.js";import{U as J}from"./UserProfile-CctyX97c.js";import{N as ye}from"./NexusWorkspaceTitle-Cw6bT8_-.js";import{T as Se}from"./ThemeSwitcher-BcWWbnlm.js";import{H as be}from"./home-n2-TUYy2.js";import{U as Ce}from"./user-DaxHjxw9.js";import{B as je}from"./bell-C8_jCsGv.js";import{c as Q}from"./createLucideIcon-Ct5j26lv.js";import"./index-B2XhonKX.js";import"./with-selector-DCNUnGNr.js";import"./index-DlVbWVVj.js";import"./CommandRegistry-CX-_p1NY.js";import"./chevron-right-B7SfSs_G.js";import"./bundle-mjs-D19diF5V.js";import"./settings-ByHv1jwo.js";import"./x-Whvjbd09.js";import"./terminal-C5zE9Rg5.js";import"./TerminalService-dKYBXmN1.js";import"./chevron-up-Dmoj2g6h.js";import"./TreeWidget-KMUz1_Ym.js";import"./index-DxIfkt58.js";import"./ContextMenu-Cvj1ARww.js";import"./plus-Ca74xhiw.js";import"./trash-2-wHb9ogRm.js";import"./folder-UZmC4nkZ.js";import"./file-BM7Uy7FP.js";import"./DataGrid-Nb2IFS2e.js";import"./search-BK6gW7Ez.js";import"./MockupReviewWidget-Bbxpub7_.js";import"./ExecutionOverlay-D0RzvJMS.js";import"./FlowControlToolbar-gOO_hePN.js";import"./rotate-ccw-meyFcNZf.js";import"./circle-CK_NQa3A.js";import"./copy-phYBoYUP.js";import"./check-OY72liom.js";import"./style-Bll1RtfE.js";import"./index-Qb75ndQS.js";import"./play-DZLFvn0-.js";import"./git-fork-DGrEV6Yb.js";import"./DialogueMappingWidget-Cn9eHisv.js";import"./IbisNode-B2djeN3E.js";import"./minus-BhXvTaxs.js";import"./DialogueMapperLibrary-e-oSgRZe.js";import"./pen-Cb0p-aaW.js";/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=Q("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=Q("RefreshCcw",[["path",{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"14sxne"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",key:"1hlbsb"}],["path",{d:"M16 16h5v5",key:"ccwih5"}]]),u=({panels:t,slashCommands:h,menuConfig:f,statusBarConfig:g,rightMenuBarContent:F,title:G,layoutModel:x})=>{const{model:y,setModel:V,isTabDirty:X,setTabDirty:Y}=$(),{theme:Z}=pe(),{setPanels:S}=ue(),{setSlashCommands:b}=he(),{setWidgets:C}=fe();n.useEffect(()=>{t&&S(t)},[t,S]),n.useEffect(()=>{h&&b(h)},[h,b]),n.useEffect(()=>{f&&ge.setMenus(f)},[f]),n.useEffect(()=>{g&&C(g)},[g,C]);const ee=o=>{try{const r=o.getComponent(),re=o.getConfig()||{},j=r?xe.get(r):void 0;return j?e.jsx(j,{node:o,...re}):e.jsxs("div",{className:"p-4 text-sm",children:["Unknown Component: ",r]})}catch(r){return console.error("Error in component factory:",r),e.jsxs("div",{className:"p-8 text-destructive bg-destructive/10 border border-destructive/20 h-full flex items-center justify-center",children:["Error rendering component: ",r instanceof Error?r.message:"Unknown error"]})}},te=o=>{if(o.type===v.Actions.DELETE_TAB){const r=y.getNodeById(o.data.node);if(r&&X(r.getId())){if(!window.confirm(`Tab "${r.getName()}" has unsaved changes. Are you sure you want to close it?`))return;Y(r.getId(),!1)}}return o};return e.jsxs("div",{className:`flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden theme-${Z}`,children:[e.jsx(ne,{title:G,rightContent:F}),e.jsxs("div",{className:"flex-1 flex overflow-hidden",children:[e.jsx(le,{}),e.jsx(ce,{}),e.jsxs("div",{className:"flex-1 flex flex-col min-w-0 bg-card",children:[e.jsx("div",{className:"flex-1 relative h-full w-full",children:e.jsx(v.Layout,{model:x||y,factory:ee,onModelChange:o=>{x||V(o)},onAction:te})}),e.jsx(de,{})]}),e.jsx(me,{})]}),e.jsx(se,{})]})};u.__docgenInfo={description:"",methods:[],displayName:"ShellLayout",props:{panels:{required:!1,tsType:{name:"Array",elements:[{name:"ISidebarPanel"}],raw:"ISidebarPanel[]"},description:""},slashCommands:{required:!1,tsType:{name:"Array",elements:[{name:"ISlashCommand"}],raw:"ISlashCommand[]"},description:""},menuConfig:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"Array",elements:[{name:"IMenuItem"}],raw:"IMenuItem[]"}],raw:"Record<string, IMenuItem[]>"},description:""},statusBarConfig:{required:!1,tsType:{name:"Array",elements:[{name:"IStatusBarWidget"}],raw:"IStatusBarWidget[]"},description:""},rightMenuBarContent:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},title:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},layoutModel:{required:!1,tsType:{name:"Model"},description:""}}};const Pt={title:"Compositions/ShellLayout",component:u,parameters:{layout:"fullscreen"}},s={decorators:[t=>(a(),e.jsx(t,{}))],render:()=>e.jsx(u,{})},i={decorators:[t=>(a(),e.jsx(t,{}))],render:()=>e.jsx(u,{rightMenuBarContent:e.jsx(J,{name:"David Tech",role:"Shell Architect",avatarUrl:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",onClick:()=>alert("Profile Clicked!")})})},l={decorators:[t=>(a(),e.jsx(t,{}))],args:{statusBarConfig:[{id:"health",label:"System: OK",icon:ve,alignment:"left",onClick:()=>alert("System health is 100%")},{id:"version",label:"v1.2.3",icon:ie,alignment:"center"},{id:"sync",label:"Synced",icon:we,alignment:"right",className:"text-green-400"}]}},c={decorators:[t=>(a(),e.jsx(t,{}))],args:{panels:[{id:"home",label:"Home",icon:be,component:()=>e.jsx("div",{className:"p-4 text-sm",children:"Welcome to your custom Home sidebar!"})},{id:"profile",label:"Profile",icon:Ce,component:()=>e.jsx("div",{className:"p-4 text-sm",children:"This is the User Profile panel."})},{id:"notifications",label:"Alerts",icon:je,component:()=>e.jsx("div",{className:"p-4 text-sm font-bold text-destructive",children:"System Alert: All systems are operational."})}]}},m={decorators:[t=>(a(),e.jsx(t,{}))],args:{menuConfig:{App:[{id:"app.about",label:"About App",commandId:"nexus.about"},{id:"app.sep",label:"---",commandId:""},{id:"app.quit",label:"Quit",commandId:""}],Project:[{id:"proj.new",label:"New Project",commandId:"nexus.new-tab"},{id:"proj.recent",label:"Open Recent",submenu:[{id:"recent.1",label:"Nexus Shell v1",commandId:"nexus.new-tab"},{id:"recent.2",label:"Legacy Project",commandId:"nexus.new-tab"}]}],Actions:[{id:"act.chat",label:"Toggle Chat",commandId:"nexus.toggle-chat"}]}}},d={decorators:[t=>(a(),e.jsx(t,{}))],args:{slashCommands:[{command:"ping",description:"Test the application response",execute:()=>alert("Custom Pong!")},{command:"echo",description:"Repeat back what you type",execute:t=>alert(`Echo: ${t.join(" ")}`)}]}},p={decorators:[t=>(a(),$.getState().setStorageKey("nexus-shell-dialogue-layout",ae),e.jsx(t,{}))],args:{title:e.jsx(ye,{className:"mr-8 scale-[0.85] origin-left"}),menuConfig:oe,rightMenuBarContent:e.jsxs("div",{className:"flex items-center space-x-3 select-none",children:[e.jsx(Se,{}),e.jsx(J,{showName:!1})]})}};var w,I,N;s.parameters={...s.parameters,docs:{...(w=s.parameters)==null?void 0:w.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    return <Story />;
  }],
  render: () => <ShellLayout />
}`,...(N=(I=s.parameters)==null?void 0:I.docs)==null?void 0:N.source}}};var A,M,T;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    return <Story />;
  }],
  render: () => <ShellLayout rightMenuBarContent={<UserProfile name="David Tech" role="Shell Architect" avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" onClick={() => alert('Profile Clicked!')} />} />
}`,...(T=(M=i.parameters)==null?void 0:M.docs)==null?void 0:T.source}}};var P,R,k;l.parameters={...l.parameters,docs:{...(P=l.parameters)==null?void 0:P.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    return <Story />;
  }],
  args: {
    statusBarConfig: [{
      id: 'health',
      label: 'System: OK',
      icon: Activity,
      alignment: 'left',
      onClick: () => alert('System health is 100%')
    }, {
      id: 'version',
      label: 'v1.2.3',
      icon: Info,
      alignment: 'center'
    }, {
      id: 'sync',
      label: 'Synced',
      icon: RefreshCcw,
      alignment: 'right',
      className: 'text-green-400'
    }]
  }
}`,...(k=(R=l.parameters)==null?void 0:R.docs)==null?void 0:k.source}}};var B,L,E;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    return <Story />;
  }],
  args: {
    panels: [{
      id: 'home',
      label: 'Home',
      icon: Home,
      component: () => <div className="p-4 text-sm">Welcome to your custom Home sidebar!</div>
    }, {
      id: 'profile',
      label: 'Profile',
      icon: User,
      component: () => <div className="p-4 text-sm">This is the User Profile panel.</div>
    }, {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      component: () => <div className="p-4 text-sm font-bold text-destructive">System Alert: All systems are operational.</div>
    }]
  }
}`,...(E=(L=c.parameters)==null?void 0:L.docs)==null?void 0:E.source}}};var U,W,q;m.parameters={...m.parameters,docs:{...(U=m.parameters)==null?void 0:U.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    return <Story />;
  }],
  args: {
    menuConfig: {
      'App': [{
        id: 'app.about',
        label: 'About App',
        commandId: 'nexus.about'
      }, {
        id: 'app.sep',
        label: '---',
        commandId: ''
      }, {
        id: 'app.quit',
        label: 'Quit',
        commandId: ''
      }],
      'Project': [{
        id: 'proj.new',
        label: 'New Project',
        commandId: 'nexus.new-tab'
      }, {
        id: 'proj.recent',
        label: 'Open Recent',
        submenu: [{
          id: 'recent.1',
          label: 'Nexus Shell v1',
          commandId: 'nexus.new-tab'
        }, {
          id: 'recent.2',
          label: 'Legacy Project',
          commandId: 'nexus.new-tab'
        }]
      }],
      'Actions': [{
        id: 'act.chat',
        label: 'Toggle Chat',
        commandId: 'nexus.toggle-chat'
      }]
    }
  }
}`,...(q=(W=m.parameters)==null?void 0:W.docs)==null?void 0:q.source}}};var z,D,H;d.parameters={...d.parameters,docs:{...(z=d.parameters)==null?void 0:z.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    return <Story />;
  }],
  args: {
    slashCommands: [{
      command: 'ping',
      description: 'Test the application response',
      execute: () => alert('Custom Pong!')
    }, {
      command: 'echo',
      description: 'Repeat back what you type',
      execute: args => alert(\`Echo: \${args.join(' ')}\`)
    }]
  }
}`,...(H=(D=d.parameters)==null?void 0:D.docs)==null?void 0:H.source}}};var O,_,K;p.parameters={...p.parameters,docs:{...(O=p.parameters)==null?void 0:O.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    useLayoutStore.getState().setStorageKey('nexus-shell-dialogue-layout', dialogueMappingLayoutJson);
    return <Story />;
  }],
  args: {
    title: <NexusWorkspaceTitle className="mr-8 scale-[0.85] origin-left" />,
    menuConfig: dialogueMapperMenus,
    rightMenuBarContent: <div className="flex items-center space-x-3 select-none">
        <ThemeSwitcher />
        <UserProfile showName={false} />
      </div>
  }
}`,...(K=(_=p.parameters)==null?void 0:_.docs)==null?void 0:K.source}}};const Rt=["Default","WithUserProfile","CustomStatusBar","CustomConfiguration","CustomMenus","CustomSlashCommands","DialogueMappingWorkbench"];export{c as CustomConfiguration,m as CustomMenus,d as CustomSlashCommands,l as CustomStatusBar,s as Default,p as DialogueMappingWorkbench,i as WithUserProfile,Rt as __namedExportsOrder,Pt as default};
