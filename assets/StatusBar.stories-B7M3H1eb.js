import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{S as t}from"./StatusBar-BrPb1jnK.js";import{u as x}from"./StatusBarService-DqlWWm1Q.js";import{I as v}from"./info-XMsdAaXM.js";import{C as W}from"./check-OY72liom.js";import"./CommandRegistry-CX-_p1NY.js";import"./bundle-mjs-D19diF5V.js";import"./index-BXm_c4be.js";import"./index-BWu4c2F4.js";import"./createLucideIcon-Ct5j26lv.js";const G={title:"Widgets/Shell/StatusBar",component:t,parameters:{layout:"fullscreen"}},r={render:()=>e.jsx("div",{className:"theme-light",children:e.jsx(t,{})})},a={render:()=>(x.getState().setWidgets([{id:"1",label:"Left Widget",icon:v,alignment:"left"},{id:"2",label:"Center Widget",alignment:"center"},{id:"3",label:"Right Widget",icon:W,alignment:"right",className:"text-green-500"}]),e.jsx("div",{className:"theme-light",children:e.jsx(t,{})}))},s={render:()=>e.jsx("div",{className:"theme-dark",children:e.jsx(t,{})})},i={render:()=>e.jsx("div",{className:"theme-gt",children:e.jsx(t,{})})};var o,n,m;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => <div className="theme-light">
      <StatusBar />
    </div>
}`,...(m=(n=r.parameters)==null?void 0:n.docs)==null?void 0:m.source}}};var d,c,l;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => {
    useStatusBarStore.getState().setWidgets([{
      id: '1',
      label: 'Left Widget',
      icon: Info,
      alignment: 'left'
    }, {
      id: '2',
      label: 'Center Widget',
      alignment: 'center'
    }, {
      id: '3',
      label: 'Right Widget',
      icon: Check,
      alignment: 'right',
      className: 'text-green-500'
    }]);
    return <div className="theme-light">
        <StatusBar />
      </div>;
  }
}`,...(l=(c=a.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var g,u,p;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="theme-dark">
      <StatusBar />
    </div>
}`,...(p=(u=s.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var h,S,f;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div className="theme-gt">
      <StatusBar />
    </div>
}`,...(f=(S=i.parameters)==null?void 0:S.docs)==null?void 0:f.source}}};const L=["Default","CustomWidgets","Dark","GeorgiaTech"];export{a as CustomWidgets,s as Dark,r as Default,i as GeorgiaTech,L as __namedExportsOrder,G as default};
