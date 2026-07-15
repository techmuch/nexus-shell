import{j as r}from"./jsx-runtime-BjG_zV1W.js";import{M as e}from"./MenuBar-8xcNiwn8.js";import{i as f}from"./Boot-23EmRcNe.js";import{m as k}from"./ComponentRegistry-CrTMOqvj.js";import"./index-BWu4c2F4.js";import"./CommandRegistry-CX-_p1NY.js";import"./LayoutService-BXeI-dxf.js";import"./index-DoVLa59h.js";import"./index-DlVbWVVj.js";import"./terminal-C5zE9Rg5.js";import"./createLucideIcon-Ct5j26lv.js";import"./file-text-CbpRdZ9J.js";import"./map-DgzPSx_z.js";import"./minus-BO1cfiOZ.js";import"./link-BvjYbVHw.js";import"./circle-help-CKitsLmE.js";import"./search-7zRISiAX.js";import"./x-Whvjbd09.js";import"./folder-UZmC4nkZ.js";import"./file-BM7Uy7FP.js";import"./SidebarService-DAfivAtX.js";import"./ChatService-B23CmFdz.js";import"./ThemeService-CbKNVEQF.js";import"./StatusBarService-DSlFO_D9.js";import"./TerminalService-D9kUAMKC.js";import"./ModalStoreService-BBzXUBbe.js";import"./TreeWidget-BAjp4Q8l.js";import"./index-DxIfkt58.js";import"./bundle-mjs-D19diF5V.js";import"./ContextMenu-Cvj1ARww.js";import"./plus-Ca74xhiw.js";import"./trash-2-wHb9ogRm.js";import"./DataGrid-BFtmH835.js";import"./loader-circle-BEMb1V6C.js";import"./chevron-up-Dmoj2g6h.js";import"./MockupReviewWidget-DMHxv1_6.js";import"./ExecutionOverlay-DaE34DJG.js";import"./message-square-qBHjt7M5.js";import"./FlowControlToolbar-CWq55CyQ.js";import"./rotate-ccw-meyFcNZf.js";import"./sparkles-BxCYfVEq.js";import"./circle-CK_NQa3A.js";import"./copy-phYBoYUP.js";import"./check-OY72liom.js";import"./style-mH_6Z-Ms.js";import"./index-C4AqD3mD.js";import"./index-ozQ2W87l.js";import"./play-DZLFvn0-.js";import"./git-fork-DGrEV6Yb.js";import"./DialogueMappingWidget-CpegzhT2.js";import"./IbisNode-D44ubR17.js";import"./user-DaxHjxw9.js";import"./DialogueMapperLibrary-Boa1P9aW.js";import"./circle-alert-gxhWxiZn.js";import"./bell-C8_jCsGv.js";f();const jr={title:"Widgets/Shell/MenuBar",component:e,parameters:{layout:"fullscreen"}},o={render:()=>r.jsx("div",{className:"theme-light bg-background text-foreground h-16",children:r.jsx(e,{})})},t={render:()=>(k.setMenus({File:[{id:"f.new",label:"New Project",commandId:"nexus.new-tab"},{id:"f.save",label:"Save",keybinding:"Control+S"}],Plugins:[{id:"p.manage",label:"Extension Manager",submenu:[{id:"p.1",label:"Theme Store"},{id:"p.2",label:"Icon Packs"}]}]}),r.jsx("div",{className:"theme-light bg-background text-foreground h-16",children:r.jsx(e,{})}))},i={render:()=>r.jsx("div",{className:"theme-dark bg-background text-foreground h-16",children:r.jsx(e,{})})},a={render:()=>r.jsx("div",{className:"theme-gt bg-background text-foreground h-16",children:r.jsx(e,{})})};var m,n,s;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div className="theme-light bg-background text-foreground h-16">
      <MenuBar />
    </div>
}`,...(s=(n=o.parameters)==null?void 0:n.docs)==null?void 0:s.source}}};var p,d,c;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => {
    menuRegistry.setMenus({
      'File': [{
        id: 'f.new',
        label: 'New Project',
        commandId: 'nexus.new-tab'
      }, {
        id: 'f.save',
        label: 'Save',
        keybinding: 'Control+S'
      }],
      'Plugins': [{
        id: 'p.manage',
        label: 'Extension Manager',
        submenu: [{
          id: 'p.1',
          label: 'Theme Store'
        }, {
          id: 'p.2',
          label: 'Icon Packs'
        }]
      }]
    });
    return <div className="theme-light bg-background text-foreground h-16">
        <MenuBar />
      </div>;
  }
}`,...(c=(d=t.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var l,u,g;i.parameters={...i.parameters,docs:{...(l=i.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="theme-dark bg-background text-foreground h-16">
      <MenuBar />
    </div>
}`,...(g=(u=i.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var b,h,x;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="theme-gt bg-background text-foreground h-16">
      <MenuBar />
    </div>
}`,...(x=(h=a.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};const Sr=["Default","CustomConfiguration","Dark","GeorgiaTech"];export{t as CustomConfiguration,i as Dark,o as Default,a as GeorgiaTech,Sr as __namedExportsOrder,jr as default};
