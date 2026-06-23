import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{M as r}from"./MenuBar-CzCCzTo-.js";import{i as f}from"./Boot-DRXqBR4_.js";import{m as k}from"./ComponentRegistry-BO303J9N.js";import"./index-BWu4c2F4.js";import"./CommandRegistry-CX-_p1NY.js";import"./chevron-right-B7SfSs_G.js";import"./createLucideIcon-Ct5j26lv.js";import"./LayoutService-CkFabNV-.js";import"./index-BXm_c4be.js";import"./index-DlVbWVVj.js";import"./SidebarService-yEaXw_BA.js";import"./ChatService-D_YOCviS.js";import"./ThemeService-BISFY8C-.js";import"./StatusBarService-DqlWWm1Q.js";import"./TerminalService-CUYaH6IJ.js";import"./ModalStoreService-D5ASpUPT.js";import"./TreeWidget-KMUz1_Ym.js";import"./index-DxIfkt58.js";import"./bundle-mjs-D19diF5V.js";import"./ContextMenu-Cvj1ARww.js";import"./plus-Ca74xhiw.js";import"./trash-2-wHb9ogRm.js";import"./folder-UZmC4nkZ.js";import"./file-BM7Uy7FP.js";import"./DataGrid-Nb2IFS2e.js";import"./search-BK6gW7Ez.js";import"./x-Whvjbd09.js";import"./chevron-up-Dmoj2g6h.js";import"./MockupReviewWidget-BYse67gh.js";import"./ExecutionOverlay-DXToSJAA.js";import"./FlowControlToolbar-DtCH6Ak7.js";import"./rotate-ccw-meyFcNZf.js";import"./circle-CK_NQa3A.js";import"./copy-phYBoYUP.js";import"./check-OY72liom.js";import"./style-D_hB0MQy.js";import"./index-BnQD1j6Q.js";import"./play-DZLFvn0-.js";import"./git-fork-DGrEV6Yb.js";import"./DialogueMappingWidget-D55AH1g7.js";import"./IbisNode-D3hpXzOF.js";import"./user-DaxHjxw9.js";import"./minus-C-0gyBqu.js";import"./circle-help-CKitsLmE.js";import"./DialogueMapperLibrary-BICYC6rt.js";import"./circle-alert-gxhWxiZn.js";import"./bell-C8_jCsGv.js";import"./terminal-C5zE9Rg5.js";f();const be={title:"Widgets/Shell/MenuBar",component:r,parameters:{layout:"fullscreen"}},o={render:()=>e.jsx("div",{className:"theme-light bg-background text-foreground h-16",children:e.jsx(r,{})})},t={render:()=>(k.setMenus({File:[{id:"f.new",label:"New Project",commandId:"nexus.new-tab"},{id:"f.save",label:"Save",keybinding:"Control+S"}],Plugins:[{id:"p.manage",label:"Extension Manager",submenu:[{id:"p.1",label:"Theme Store"},{id:"p.2",label:"Icon Packs"}]}]}),e.jsx("div",{className:"theme-light bg-background text-foreground h-16",children:e.jsx(r,{})}))},a={render:()=>e.jsx("div",{className:"theme-dark bg-background text-foreground h-16",children:e.jsx(r,{})})},i={render:()=>e.jsx("div",{className:"theme-gt bg-background text-foreground h-16",children:e.jsx(r,{})})};var m,n,s;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(c=(d=t.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var l,u,g;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="theme-dark bg-background text-foreground h-16">
      <MenuBar />
    </div>
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var b,h,x;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="theme-gt bg-background text-foreground h-16">
      <MenuBar />
    </div>
}`,...(x=(h=i.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};const he=["Default","CustomConfiguration","Dark","GeorgiaTech"];export{t as CustomConfiguration,a as Dark,o as Default,i as GeorgiaTech,he as __namedExportsOrder,be as default};
