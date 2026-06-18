import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{u}from"./SidebarService-E_CB6iOX.js";import{u as h}from"./ThemeService-HNgL0KqX.js";import{X as x}from"./x-Whvjbd09.js";import{c as o}from"./createLucideIcon-Ct5j26lv.js";/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=o("GraduationCap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]]);/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=o("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=o("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]),j=()=>{const{activeSidebar:n,setActiveSidebar:s,panels:i}=u(),{theme:c,setTheme:d}=h();if(!n)return null;const t=i.find(r=>r.id===n),l=()=>{if(n==="settings")return e.jsx("div",{className:"p-4 space-y-6",children:e.jsxs("section",{children:[e.jsx("h3",{className:"text-[11px] font-bold text-muted-foreground uppercase mb-3",children:"Theme"}),e.jsx("div",{className:"grid grid-cols-1 gap-2",children:[{id:"light",label:"Light",icon:g},{id:"dark",label:"Dark",icon:b},{id:"gt",label:"Georgia Tech",icon:f}].map(({id:r,label:p,icon:m})=>e.jsxs("button",{onClick:()=>d(r),className:`
                    flex items-center space-x-3 px-3 py-2 rounded-md border text-sm transition-all
                    ${c===r?"bg-primary text-primary-foreground border-primary":"bg-background hover:bg-accent border-border"}
                  `,children:[e.jsx(m,{size:16}),e.jsx("span",{children:p})]},r))})]})});if(t){if(typeof t.component=="function"){const r=t.component;return e.jsx(r,{})}return t.component}return e.jsx("div",{className:"p-4 text-sm italic text-muted-foreground",children:"Panel content not found."})},a=()=>n==="settings"?"SETTINGS":(t==null?void 0:t.label.toUpperCase())||"";return e.jsxs("aside",{role:"tabpanel","aria-label":`${a()} Panel`,className:"w-[300px] h-full bg-muted border-r flex flex-col select-none",children:[e.jsxs("div",{className:"h-10 flex items-center justify-between px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest",children:[e.jsx("span",{children:a()}),e.jsx("button",{onClick:()=>s(null),"aria-label":"Close Panel",className:"p-1 hover:bg-accent hover:text-foreground rounded transition-colors focus:outline-none focus:ring-2 focus:ring-ring",children:e.jsx(x,{size:14})})]}),e.jsx("div",{className:"flex-1 overflow-auto border-t border-border/50 bg-background/50",children:l()})]})};j.__docgenInfo={description:"",methods:[],displayName:"SidebarPane"};export{j as S};
