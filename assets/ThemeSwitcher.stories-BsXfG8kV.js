import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{T as r}from"./ThemeSwitcher-BcB8wvdJ.js";import{u as v}from"./ThemeService-BISFY8C-.js";import"./bundle-mjs-D19diF5V.js";import"./index-BXm_c4be.js";import"./index-BWu4c2F4.js";const G={title:"Widgets/Shell/ThemeSwitcher",component:r,parameters:{layout:"centered"}},k=()=>{const s=v(w=>w.theme);return e.jsxs("div",{className:`theme-${s} p-8 rounded-xl border border-border bg-background text-foreground transition-all duration-300 w-[300px] flex flex-col items-center gap-4`,children:[e.jsxs("span",{className:"text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground",children:["Active Theme: ",s]}),e.jsx(r,{})]})},t={render:()=>e.jsx(k,{})},o={render:()=>e.jsxs("div",{className:"theme-light p-8 rounded-xl border border-border bg-background text-foreground w-[300px] flex flex-col items-center gap-4",children:[e.jsx("span",{className:"text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground",children:"Light Preview"}),e.jsx(r,{})]})},n={render:()=>e.jsxs("div",{className:"theme-dark p-8 rounded-xl border border-border bg-background text-foreground w-[300px] flex flex-col items-center gap-4",children:[e.jsx("span",{className:"text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground",children:"Dark Preview"}),e.jsx(r,{})]})},a={render:()=>e.jsxs("div",{className:"theme-gt p-8 rounded-xl border border-border bg-background text-foreground w-[300px] flex flex-col items-center gap-4",children:[e.jsx("span",{className:"text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground",children:"GT Preview"}),e.jsx(r,{})]})};var d,c,i;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <InteractiveThemeSwitcherWrapper />
}`,...(i=(c=t.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};var m,p,x;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div className="theme-light p-8 rounded-xl border border-border bg-background text-foreground w-[300px] flex flex-col items-center gap-4">
      <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
        Light Preview
      </span>
      <ThemeSwitcher />
    </div>
}`,...(x=(p=o.parameters)==null?void 0:p.docs)==null?void 0:x.source}}};var l,u,g;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="theme-dark p-8 rounded-xl border border-border bg-background text-foreground w-[300px] flex flex-col items-center gap-4">
      <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
        Dark Preview
      </span>
      <ThemeSwitcher />
    </div>
}`,...(g=(u=n.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var f,b,h;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div className="theme-gt p-8 rounded-xl border border-border bg-background text-foreground w-[300px] flex flex-col items-center gap-4">
      <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
        GT Preview
      </span>
      <ThemeSwitcher />
    </div>
}`,...(h=(b=a.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};const I=["Interactive","StaticLight","StaticDark","StaticGeorgiaTech"];export{t as Interactive,n as StaticDark,a as StaticGeorgiaTech,o as StaticLight,I as __namedExportsOrder,G as default};
