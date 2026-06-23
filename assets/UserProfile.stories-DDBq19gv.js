import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{U as a}from"./UserProfile-CctyX97c.js";import"./index-BWu4c2F4.js";import"./bundle-mjs-D19diF5V.js";import"./index-B2XhonKX.js";import"./with-selector-DCNUnGNr.js";import"./LayoutService-C4iIiTmL.js";import"./index-DlVbWVVj.js";import"./user-DaxHjxw9.js";import"./createLucideIcon-Ct5j26lv.js";import"./x-Whvjbd09.js";import"./check-OY72liom.js";import"./pen-Cb0p-aaW.js";import"./settings-ByHv1jwo.js";const O={title:"Widgets/Shell/UserProfile",component:a,argTypes:{showName:{control:"boolean"},name:{control:"text"},role:{control:"text"},email:{control:"text"},avatarUrl:{control:"text"}},parameters:{layout:"centered"}},o={args:{name:"David techmuch",role:"Principal Engineer"},render:r=>e.jsx("div",{className:"theme-light p-4 pb-32 w-80 border rounded bg-background",children:e.jsx(a,{...r})})},s={args:{name:"Jane Doe",role:"Product Designer",avatarUrl:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"},render:r=>e.jsx("div",{className:"theme-light p-4 pb-32 w-80 border rounded bg-background",children:e.jsx(a,{...r})})},t={args:{name:"Jane Doe",showName:!1,avatarUrl:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"},render:r=>e.jsx("div",{className:"theme-light p-4 pb-32 w-20 border rounded bg-background flex justify-center",children:e.jsx(a,{...r})})},d={args:{name:"Alex Smith",role:"Admin"},render:r=>e.jsx("div",{className:"theme-dark p-4 pb-32 w-80 border rounded bg-slate-900 text-slate-100",children:e.jsx(a,{...r})})},m={args:{},render:()=>e.jsx("div",{className:"theme-light p-4 pb-32 w-80 border rounded bg-background",children:e.jsx(a,{})})};var c,n,i;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    name: 'David techmuch',
    role: 'Principal Engineer'
  },
  render: args => <div className="theme-light p-4 pb-32 w-80 border rounded bg-background">
      <UserProfile {...args} />
    </div>
}`,...(i=(n=o.parameters)==null?void 0:n.docs)==null?void 0:i.source}}};var p,l,g;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    name: 'Jane Doe',
    role: 'Product Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  render: args => <div className="theme-light p-4 pb-32 w-80 border rounded bg-background">
      <UserProfile {...args} />
    </div>
}`,...(g=(l=s.parameters)==null?void 0:l.docs)==null?void 0:g.source}}};var h,u,b;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    name: 'Jane Doe',
    showName: false,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  render: args => <div className="theme-light p-4 pb-32 w-20 border rounded bg-background flex justify-center">
      <UserProfile {...args} />
    </div>
}`,...(b=(u=t.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var v,x,f;d.parameters={...d.parameters,docs:{...(v=d.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    name: 'Alex Smith',
    role: 'Admin'
  },
  render: args => <div className="theme-dark p-4 pb-32 w-80 border rounded bg-slate-900 text-slate-100">
      <UserProfile {...args} />
    </div>
}`,...(f=(x=d.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var w,j,N;m.parameters={...m.parameters,docs:{...(w=m.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {},
  render: () => <div className="theme-light p-4 pb-32 w-80 border rounded bg-background">
      <UserProfile />
    </div>
}`,...(N=(j=m.parameters)==null?void 0:j.docs)==null?void 0:N.source}}};const R=["Default","WithAvatar","Compact","DarkTheme","FromStore"];export{t as Compact,d as DarkTheme,o as Default,m as FromStore,s as WithAvatar,R as __namedExportsOrder,O as default};
