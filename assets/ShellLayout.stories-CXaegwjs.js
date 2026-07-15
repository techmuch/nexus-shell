import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{u as J,l as w,d as oe,a as ae}from"./LayoutService-CTDo5xdj.js";/* empty css                         */import{M as ne}from"./MenuBar-DUoJpf2M.js";import{S as se}from"./StatusBar-B2sNiR8-.js";import{A as ie}from"./ActivityBar-Da3SHpV0.js";import{S as le}from"./SidebarPane-XMBw8aar.js";import{C as ce}from"./ChatPane-CTlKOG1I.js";import{T as me}from"./TerminalPane-CxnZHlBG.js";import{u as de}from"./ThemeService-CbKNVEQF.js";import{u as ue}from"./SidebarService-DAfivAtX.js";import{a as pe}from"./ChatService-B23CmFdz.js";import{u as he}from"./StatusBarService-DSlFO_D9.js";import{m as fe,c as ge}from"./ComponentRegistry-CrTMOqvj.js";import{u as ye}from"./ModalStoreService-BBzXUBbe.js";import{r as u}from"./index-BWu4c2F4.js";import{i as a}from"./Boot-F92mRWnQ.js";import{U as Q}from"./UserProfile-CdRhhQEo.js";import{N as xe}from"./NexusWorkspaceTitle-Cw6bT8_-.js";import{T as Se}from"./ThemeSwitcher-Ciyol8U8.js";import{H as be}from"./home-n2-TUYy2.js";import{U as Ce}from"./user-DaxHjxw9.js";import{B as je}from"./bell-C8_jCsGv.js";import{c as F}from"./createLucideIcon-Ct5j26lv.js";import{I as ve}from"./info-XMsdAaXM.js";/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=F("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=F("RefreshCcw",[["path",{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"14sxne"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",key:"1hlbsb"}],["path",{d:"M16 16h5v5",key:"ccwih5"}]]),p=({panels:t,slashCommands:h,menuConfig:f,statusBarConfig:g,rightMenuBarContent:G,title:V,layoutModel:S})=>{const{model:y,setModel:X,isTabDirty:Y,setTabDirty:Z}=J(),{theme:ee}=de(),{setPanels:b}=ue(),{setSlashCommands:C}=pe(),{setWidgets:j}=he();u.useEffect(()=>{t&&b(t)},[t,b]),u.useEffect(()=>{h&&C(h)},[h,C]),u.useEffect(()=>{f&&fe.setMenus(f)},[f]),u.useEffect(()=>{g&&j(g)},[g,j]);const te=o=>{try{const r=o.getComponent(),x=o.getConfig()||{},v=r?ge.get(r):void 0;return v?e.jsx(v,{node:o,...x}):e.jsxs("div",{className:"p-4 text-sm",children:["Unknown Component: ",r]})}catch(r){return console.error("Error in component factory:",r),e.jsxs("div",{className:"p-8 text-destructive bg-destructive/10 border border-destructive/20 h-full flex items-center justify-center",children:["Error rendering component: ",r instanceof Error?r.message:"Unknown error"]})}},re=o=>{if(o.type===w.Actions.DELETE_TAB){const r=y.getNodeById(o.data.node);if(r&&Y(r.getId())){ye.getState().openConfirm(`Tab "${r.getName()}" has unsaved changes. Are you sure you want to close it?`).then(x=>{x&&(Z(r.getId(),!1),y.doAction(o))});return}}return o};return e.jsxs("div",{className:`flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden theme-${ee}`,children:[e.jsx(ne,{title:V,rightContent:G}),e.jsxs("div",{className:"flex-1 flex overflow-hidden",children:[e.jsx(ie,{}),e.jsx(le,{}),e.jsxs("div",{className:"flex-1 flex flex-col min-w-0 bg-card",children:[e.jsx("div",{className:"flex-1 relative h-full w-full",children:e.jsx(w.Layout,{model:S||y,factory:te,onModelChange:o=>{S||X(o)},onAction:re})}),e.jsx(me,{})]}),e.jsx(ce,{})]}),e.jsx(se,{})]})};p.__docgenInfo={description:"",methods:[],displayName:"ShellLayout",props:{panels:{required:!1,tsType:{name:"Array",elements:[{name:"ISidebarPanel"}],raw:"ISidebarPanel[]"},description:""},slashCommands:{required:!1,tsType:{name:"Array",elements:[{name:"ISlashCommand"}],raw:"ISlashCommand[]"},description:""},menuConfig:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"Array",elements:[{name:"IMenuItem"}],raw:"IMenuItem[]"}],raw:"Record<string, IMenuItem[]>"},description:""},statusBarConfig:{required:!1,tsType:{name:"Array",elements:[{name:"IStatusBarWidget"}],raw:"IStatusBarWidget[]"},description:""},rightMenuBarContent:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},title:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},layoutModel:{required:!1,tsType:{name:"Model"},description:""}}};const Ne={title:"Compositions/ShellLayout",component:p,parameters:{layout:"fullscreen"}},n={decorators:[t=>(a(),e.jsx(t,{}))],render:()=>e.jsx(p,{})},s={decorators:[t=>(a(),e.jsx(t,{}))],render:()=>e.jsx(p,{rightMenuBarContent:e.jsx(Q,{name:"David Tech",role:"Shell Architect",avatarUrl:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",onClick:()=>alert("Profile Clicked!")})})},i={decorators:[t=>(a(),e.jsx(t,{}))],args:{statusBarConfig:[{id:"health",label:"System: OK",icon:we,alignment:"left",onClick:()=>alert("System health is 100%")},{id:"version",label:"v1.2.3",icon:ve,alignment:"center"},{id:"sync",label:"Synced",icon:Ie,alignment:"right",className:"text-green-400"}]}},l={decorators:[t=>(a(),e.jsx(t,{}))],args:{panels:[{id:"home",label:"Home",icon:be,component:()=>e.jsx("div",{className:"p-4 text-sm",children:"Welcome to your custom Home sidebar!"})},{id:"profile",label:"Profile",icon:Ce,component:()=>e.jsx("div",{className:"p-4 text-sm",children:"This is the User Profile panel."})},{id:"notifications",label:"Alerts",icon:je,component:()=>e.jsx("div",{className:"p-4 text-sm font-bold text-destructive",children:"System Alert: All systems are operational."})}]}},c={decorators:[t=>(a(),e.jsx(t,{}))],args:{menuConfig:{App:[{id:"app.about",label:"About App",commandId:"nexus.about"},{id:"app.sep",label:"---",commandId:""},{id:"app.quit",label:"Quit",commandId:""}],Project:[{id:"proj.new",label:"New Project",commandId:"nexus.new-tab"},{id:"proj.recent",label:"Open Recent",submenu:[{id:"recent.1",label:"Nexus Shell v1",commandId:"nexus.new-tab"},{id:"recent.2",label:"Legacy Project",commandId:"nexus.new-tab"}]}],Actions:[{id:"act.chat",label:"Toggle Chat",commandId:"nexus.toggle-chat"}]}}},m={decorators:[t=>(a(),e.jsx(t,{}))],args:{slashCommands:[{command:"ping",description:"Test the application response",execute:()=>alert("Custom Pong!")},{command:"echo",description:"Repeat back what you type",execute:t=>alert(`Echo: ${t.join(" ")}`)}]}},d={decorators:[t=>(a(),J.getState().setStorageKey("nexus-shell-dialogue-layout",ae),e.jsx(t,{}))],args:{title:e.jsx(xe,{className:"mr-8 scale-[0.85] origin-left"}),menuConfig:oe,rightMenuBarContent:e.jsxs("div",{className:"flex items-center space-x-3 select-none",children:[e.jsx(Se,{}),e.jsx(Q,{showName:!1})]})}};var I,N,A;n.parameters={...n.parameters,docs:{...(I=n.parameters)==null?void 0:I.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    return <Story />;
  }],
  render: () => <ShellLayout />
}`,...(A=(N=n.parameters)==null?void 0:N.docs)==null?void 0:A.source}}};var M,T,P;s.parameters={...s.parameters,docs:{...(M=s.parameters)==null?void 0:M.docs,source:{originalSource:`{
  decorators: [Story => {
    initializeShell();
    return <Story />;
  }],
  render: () => <ShellLayout rightMenuBarContent={<UserProfile name="David Tech" role="Shell Architect" avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" onClick={() => alert('Profile Clicked!')} />} />
}`,...(P=(T=s.parameters)==null?void 0:T.docs)==null?void 0:P.source}}};var R,k,B;i.parameters={...i.parameters,docs:{...(R=i.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(B=(k=i.parameters)==null?void 0:k.docs)==null?void 0:B.source}}};var L,E,U;l.parameters={...l.parameters,docs:{...(L=l.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(U=(E=l.parameters)==null?void 0:E.docs)==null?void 0:U.source}}};var W,q,z;c.parameters={...c.parameters,docs:{...(W=c.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(z=(q=c.parameters)==null?void 0:q.docs)==null?void 0:z.source}}};var D,_,H;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(H=(_=m.parameters)==null?void 0:_.docs)==null?void 0:H.source}}};var O,K,$;d.parameters={...d.parameters,docs:{...(O=d.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
}`,...($=(K=d.parameters)==null?void 0:K.docs)==null?void 0:$.source}}};const Ae=["Default","WithUserProfile","CustomStatusBar","CustomConfiguration","CustomMenus","CustomSlashCommands","DialogueMappingWorkbench"],Ze=Object.freeze(Object.defineProperty({__proto__:null,CustomConfiguration:l,CustomMenus:c,CustomSlashCommands:m,CustomStatusBar:i,Default:n,DialogueMappingWorkbench:d,WithUserProfile:s,__namedExportsOrder:Ae,default:Ne},Symbol.toStringTag,{value:"Module"}));export{n as D,Ze as S};
