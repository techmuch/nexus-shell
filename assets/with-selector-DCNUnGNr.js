import{r as g,g as $}from"./index-BWu4c2F4.js";const x={},y=t=>{let e;const u=new Set,c=(o,l)=>{const a=typeof o=="function"?o(e):o;if(!Object.is(a,e)){const s=e;e=l??(typeof a!="object"||a===null)?a:Object.assign({},e,a),u.forEach(i=>i(e,s))}},r=()=>e,S={setState:c,getState:r,getInitialState:()=>b,subscribe:o=>(u.add(o),()=>u.delete(o)),destroy:()=>{(x?"production":void 0)!=="production"&&console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),u.clear()}},b=e=t(c,r,S);return S},K=t=>t?y(t):y;var h={exports:{}},w={},j={exports:{}},_={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d=g;function D(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var I=typeof Object.is=="function"?Object.is:D,V=d.useState,O=d.useEffect,R=d.useLayoutEffect,z=d.useDebugValue;function C(t,e){var u=e(),c=V({inst:{value:u,getSnapshot:e}}),r=c[0].inst,n=c[1];return R(function(){r.value=u,r.getSnapshot=e,E(r)&&n({inst:r})},[t,u,e]),O(function(){return E(r)&&n({inst:r}),t(function(){E(r)&&n({inst:r})})},[t]),z(u),u}function E(t){var e=t.getSnapshot;t=t.value;try{var u=e();return!I(t,u)}catch{return!0}}function M(t,e){return e()}var G=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?M:C;_.useSyncExternalStore=d.useSyncExternalStore!==void 0?d.useSyncExternalStore:G;j.exports=_;var L=j.exports;/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var m=g,T=L;function k(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var A=typeof Object.is=="function"?Object.is:k,F=T.useSyncExternalStore,P=m.useRef,U=m.useEffect,W=m.useMemo,B=m.useDebugValue;w.useSyncExternalStoreWithSelector=function(t,e,u,c,r){var n=P(null);if(n.current===null){var f={hasValue:!1,value:null};n.current=f}else f=n.current;n=W(function(){function S(s){if(!b){if(b=!0,o=s,s=c(s),r!==void 0&&f.hasValue){var i=f.value;if(r(i,s))return l=i}return l=s}if(i=l,A(o,s))return i;var p=c(s);return r!==void 0&&r(i,p)?(o=s,i):(o=s,l=p)}var b=!1,o,l,a=u===void 0?null:u;return[function(){return S(e())},a===null?void 0:function(){return S(a())}]},[e,u,c,r]);var v=F(t,n[0],n[1]);return U(function(){f.hasValue=!0,f.value=v},[v]),B(v),v};h.exports=w;var H=h.exports;const N=$(H);export{K as c,N as u};
