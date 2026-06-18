import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{M as r}from"./MenuBar-Vf-lKz-d.js";import{m as f,i as k}from"./Boot-7UxZIKBv.js";import"./index-BWu4c2F4.js";import"./StatusBarService-Cuc5oBPr.js";import"./index-B2XhonKX.js";import"./with-selector-DCNUnGNr.js";import"./ContextMenu-BqZrHCx1.js";import"./createLucideIcon-Ct5j26lv.js";import"./index-DlVbWVVj.js";import"./SidebarService-E_CB6iOX.js";import"./ChatService-moaT5vZu.js";import"./ThemeService-HNgL0KqX.js";import"./TerminalService-dKYBXmN1.js";import"./TreeWidget-DE8TlC9p.js";import"./index-DxIfkt58.js";import"./bundle-mjs-D19diF5V.js";import"./folder-UZmC4nkZ.js";import"./file-BM7Uy7FP.js";import"./plus-Ca74xhiw.js";import"./trash-2-wHb9ogRm.js";import"./DataGrid-Nb2IFS2e.js";import"./search-BK6gW7Ez.js";import"./x-Whvjbd09.js";import"./chevron-up-Dmoj2g6h.js";import"./MockupReviewWidget-DZhmHysg.js";import"./ExecutionOverlay-C_pQ0C81.js";import"./FlowControlToolbar-BFmOShZw.js";import"./rotate-ccw-meyFcNZf.js";import"./circle-CK_NQa3A.js";import"./copy-phYBoYUP.js";import"./check-OY72liom.js";import"./style-X7yiBvB1.js";import"./index-Cx8-z_gx.js";import"./play-DZLFvn0-.js";import"./git-fork-DGrEV6Yb.js";import"./download-u1JR2nuf.js";import"./DialogueMappingWidget-fWgfTPGh.js";import"./IbisNode-B3Nn9kEu.js";import"./user-DaxHjxw9.js";import"./minus-BhXvTaxs.js";import"./DialogueMapperLibrary-DmE9GRkx.js";import"./bell-C8_jCsGv.js";import"./terminal-C5zE9Rg5.js";k();const pe={title:"Widgets/Shell/MenuBar",component:r,parameters:{layout:"fullscreen"}},o={render:()=>e.jsx("div",{className:"theme-light bg-background text-foreground h-16",children:e.jsx(r,{})})},t={render:()=>(f.setMenus({File:[{id:"f.new",label:"New Project",commandId:"nexus.new-tab"},{id:"f.save",label:"Save",keybinding:"Control+S"}],Plugins:[{id:"p.manage",label:"Extension Manager",submenu:[{id:"p.1",label:"Theme Store"},{id:"p.2",label:"Icon Packs"}]}]}),e.jsx("div",{className:"theme-light bg-background text-foreground h-16",children:e.jsx(r,{})}))},a={render:()=>e.jsx("div",{className:"theme-dark bg-background text-foreground h-16",children:e.jsx(r,{})})},i={render:()=>e.jsx("div",{className:"theme-gt bg-background text-foreground h-16",children:e.jsx(r,{})})};var n,m,s;o.parameters={...o.parameters,docs:{...(n=o.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => <div className="theme-light bg-background text-foreground h-16">
      <MenuBar />
    </div>
}`,...(s=(m=o.parameters)==null?void 0:m.docs)==null?void 0:s.source}}};var d,p,c;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(c=(p=t.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};var l,u,g;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="theme-dark bg-background text-foreground h-16">
      <MenuBar />
    </div>
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var b,h,x;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="theme-gt bg-background text-foreground h-16">
      <MenuBar />
    </div>
}`,...(x=(h=i.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};const ce=["Default","CustomConfiguration","Dark","GeorgiaTech"];export{t as CustomConfiguration,a as Dark,o as Default,i as GeorgiaTech,ce as __namedExportsOrder,pe as default};
