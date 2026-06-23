import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{D as r}from"./DialogueMapperLibrary-e-oSgRZe.js";import{u as y}from"./ThemeService-HNgL0KqX.js";import"./bundle-mjs-D19diF5V.js";import"./minus-BhXvTaxs.js";import"./createLucideIcon-Ct5j26lv.js";import"./index-BWu4c2F4.js";import"./plus-Ca74xhiw.js";import"./check-OY72liom.js";import"./folder-UZmC4nkZ.js";import"./index-B2XhonKX.js";import"./with-selector-DCNUnGNr.js";const G={title:"Widgets/DialogueMapper/DialogueMapperLibrary",component:r,parameters:{layout:"centered"}},a={render:()=>{const o=y(t=>t.theme);return e.jsxs("div",{className:`theme-${o} h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl`,children:[e.jsx(r,{onAddNode:t=>console.log(`Clicked to add node of type: ${t}`),onClose:()=>console.log("Close clicked"),onDragStart:(t,l)=>{console.log(`Drag started for node type: ${l}`),t.dataTransfer.setData("application/reactflow",l)}}),e.jsxs("div",{className:"flex-1 p-6 flex flex-col items-center justify-center text-center font-sans",children:[e.jsxs("span",{className:"text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2",children:["Active Theme: ",o]}),e.jsx("p",{className:"text-xs text-muted-foreground max-w-xs leading-relaxed",children:"Drag items from the library sidebar, or click on them to trigger the callback."})]})]})}},s={render:()=>e.jsxs("div",{className:"theme-light h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl",children:[e.jsx(r,{onAddNode:o=>console.log(`Clicked to add: ${o}`),onClose:()=>console.log("Closed"),onDragStart:(o,t)=>{o.dataTransfer.setData("application/reactflow",t)}}),e.jsxs("div",{className:"flex-1 p-6 flex flex-col items-center justify-center text-center font-sans w-64 bg-background",children:[e.jsx("span",{className:"text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2",children:"Light Theme"}),e.jsx("p",{className:"text-xs text-muted-foreground leading-relaxed",children:"Palette color contrasts optimized for soft text on white/gray."})]})]})},d={render:()=>e.jsxs("div",{className:"theme-dark h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl",children:[e.jsx(r,{onAddNode:o=>console.log(`Clicked to add: ${o}`),onClose:()=>console.log("Closed"),onDragStart:(o,t)=>{o.dataTransfer.setData("application/reactflow",t)}}),e.jsxs("div",{className:"flex-1 p-6 flex flex-col items-center justify-center text-center font-sans w-64 bg-background",children:[e.jsx("span",{className:"text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2",children:"Dark Theme"}),e.jsx("p",{className:"text-xs text-muted-foreground leading-relaxed",children:"Palette color contrasts optimized for soft glow colors on dark gray."})]})]})},n={render:()=>e.jsxs("div",{className:"theme-gt h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl",children:[e.jsx(r,{onAddNode:o=>console.log(`Clicked to add: ${o}`),onClose:()=>console.log("Closed"),onDragStart:(o,t)=>{o.dataTransfer.setData("application/reactflow",t)}}),e.jsxs("div",{className:"flex-1 p-6 flex flex-col items-center justify-center text-center font-sans w-64 bg-background",children:[e.jsx("span",{className:"text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2",children:"Georgia Tech Theme"}),e.jsx("p",{className:"text-xs text-muted-foreground leading-relaxed",children:"Palette color contrasts optimized for GT gold and black layout colors."})]})]})};var c,i,x;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => {
    // Dynamically follows the global workstation theme store if changed
    const theme = useThemeStore(state => state.theme);
    return <div className={\`theme-\${theme} h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl\`}>
        <DialogueMapperLibrary onAddNode={type => console.log(\`Clicked to add node of type: \${type}\`)} onClose={() => console.log('Close clicked')} onDragStart={(e, type) => {
        console.log(\`Drag started for node type: \${type}\`);
        e.dataTransfer.setData('application/reactflow', type);
      }} />
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center font-sans">
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Active Theme: {theme}
          </span>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Drag items from the library sidebar, or click on them to trigger the callback.
          </p>
        </div>
      </div>;
  }
}`,...(x=(i=a.parameters)==null?void 0:i.docs)==null?void 0:x.source}}};var m,p,g;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div className="theme-light h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl">
      <DialogueMapperLibrary onAddNode={type => console.log(\`Clicked to add: \${type}\`)} onClose={() => console.log('Closed')} onDragStart={(e, type) => {
      e.dataTransfer.setData('application/reactflow', type);
    }} />
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center font-sans w-64 bg-background">
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Light Theme
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Palette color contrasts optimized for soft text on white/gray.
        </p>
      </div>
    </div>
}`,...(g=(p=s.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var f,u,h;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div className="theme-dark h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl">
      <DialogueMapperLibrary onAddNode={type => console.log(\`Clicked to add: \${type}\`)} onClose={() => console.log('Closed')} onDragStart={(e, type) => {
      e.dataTransfer.setData('application/reactflow', type);
    }} />
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center font-sans w-64 bg-background">
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Dark Theme
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Palette color contrasts optimized for soft glow colors on dark gray.
        </p>
      </div>
    </div>
}`,...(h=(u=d.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var b,k,w;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="theme-gt h-[600px] border border-border bg-background text-foreground flex overflow-hidden rounded-xl shadow-xl">
      <DialogueMapperLibrary onAddNode={type => console.log(\`Clicked to add: \${type}\`)} onClose={() => console.log('Closed')} onDragStart={(e, type) => {
      e.dataTransfer.setData('application/reactflow', type);
    }} />
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center font-sans w-64 bg-background">
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Georgia Tech Theme
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Palette color contrasts optimized for GT gold and black layout colors.
        </p>
      </div>
    </div>
}`,...(w=(k=n.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};const P=["Interactive","LightTheme","DarkTheme","GeorgiaTechTheme"];export{d as DarkTheme,n as GeorgiaTechTheme,a as Interactive,s as LightTheme,P as __namedExportsOrder,G as default};
