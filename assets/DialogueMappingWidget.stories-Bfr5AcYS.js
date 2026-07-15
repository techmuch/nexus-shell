import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{D as t}from"./DialogueMappingWidget-C7PHFo0O.js";const h={title:"Widgets/DialogueMapper/DialogueMappingWidget",component:t,argTypes:{defaultDragMode:{control:{type:"select"},options:["pan","select"],description:"Default drag mode for the canvas"}},args:{defaultDragMode:"select"},parameters:{layout:"fullscreen"}},o={render:r=>e.jsx("div",{className:"theme-dark bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl",children:e.jsx(t,{...r})})},d={render:r=>e.jsx("div",{className:"theme-light bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl",children:e.jsx(t,{...r})})},a={render:r=>e.jsx("div",{className:"theme-gt bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl",children:e.jsx(t,{...r})})};var s,n,g;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: args => <div className="theme-dark bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl">
      <DialogueMappingWidget {...args} />
    </div>
}`,...(g=(n=o.parameters)==null?void 0:n.docs)==null?void 0:g.source}}};var l,i,c;d.parameters={...d.parameters,docs:{...(l=d.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: args => <div className="theme-light bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl">
      <DialogueMappingWidget {...args} />
    </div>
}`,...(c=(i=d.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var u,p,m;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: args => <div className="theme-gt bg-background text-foreground h-[600px] w-full border border-border overflow-hidden rounded-xl">
      <DialogueMappingWidget {...args} />
    </div>
}`,...(m=(p=a.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};const b=["DarkTheme","LightTheme","GeorgiaTechTheme"],v=Object.freeze(Object.defineProperty({__proto__:null,DarkTheme:o,GeorgiaTechTheme:a,LightTheme:d,__namedExportsOrder:b,default:h},Symbol.toStringTag,{value:"Module"}));export{v as D,d as L,o as a};
