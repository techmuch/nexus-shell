import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{A as s}from"./ActivityBar-CdMaPrQQ.js";import{u}from"./SidebarService-E_CB6iOX.js";import{H as b}from"./home-n2-TUYy2.js";import{U as x}from"./user-DaxHjxw9.js";import{B as f}from"./bell-C8_jCsGv.js";import"./bundle-mjs-D19diF5V.js";import"./settings-ByHv1jwo.js";import"./createLucideIcon-Ct5j26lv.js";import"./index-BWu4c2F4.js";import"./index-B2XhonKX.js";import"./with-selector-DCNUnGNr.js";const C={title:"Widgets/Shell/ActivityBar",component:s,parameters:{layout:"centered"}},r={render:()=>e.jsx("div",{className:"theme-light h-96 border flex",children:e.jsx(s,{})})},t={render:()=>e.jsx("div",{className:"theme-dark h-96 border flex",children:e.jsx(s,{})})},o={render:()=>(u.getState().setPanels([{id:"h",label:"Home",icon:b,component:"Home"},{id:"u",label:"User",icon:x,component:"User"},{id:"b",label:"Bell",icon:f,component:"Bell"}]),e.jsx("div",{className:"theme-light h-96 border flex",children:e.jsx(s,{})}))};var a,i,m;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  render: () => <div className="theme-light h-96 border flex">
      <ActivityBar />
    </div>
}`,...(m=(i=r.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var l,n,c;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="theme-dark h-96 border flex">
      <ActivityBar />
    </div>
}`,...(c=(n=t.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var d,p,h;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => {
    // Set custom panels for this story
    useSidebarStore.getState().setPanels([{
      id: 'h',
      label: 'Home',
      icon: Home,
      component: 'Home'
    }, {
      id: 'u',
      label: 'User',
      icon: User,
      component: 'User'
    }, {
      id: 'b',
      label: 'Bell',
      icon: Bell,
      component: 'Bell'
    }]);
    return <div className="theme-light h-96 border flex">
        <ActivityBar />
      </div>;
  }
}`,...(h=(p=o.parameters)==null?void 0:p.docs)==null?void 0:h.source}}};const D=["Light","Dark","CustomPanels"];export{o as CustomPanels,t as Dark,r as Light,D as __namedExportsOrder,C as default};
