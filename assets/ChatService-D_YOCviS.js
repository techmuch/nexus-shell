import{c as i}from"./createLucideIcon-Ct5j26lv.js";import{c as r}from"./index-BXm_c4be.js";/**
 * @license lucide-react v0.378.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=i("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]),s="nexus-shell-right-sidebar",C=r(t=>({isChatOpen:localStorage.getItem(s)==="true",setChatOpen:a=>{localStorage.setItem(s,String(a)),t({isChatOpen:a})},toggleChat:()=>t(a=>{const o=!a.isChatOpen;return localStorage.setItem(s,String(o)),{isChatOpen:o}})})),m=r(t=>({slashCommands:[],setSlashCommands:e=>t({slashCommands:e}),registerSlashCommand:e=>t(n=>({slashCommands:[...n.slashCommands,e]}))}));export{l as M,m as a,C as u};
