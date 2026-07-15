import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-CHKtz2QT.js";import{M as a,C as o,a as s}from"./index-CgPsZv5K.js";import{W as d,D as c}from"./WargameMap.stories-DMQAW--H.js";import"./index-BWu4c2F4.js";import"./iframe-C2nJl1-g.js";import"./index-CTRLWg81.js";import"./index-4adcsI43.js";import"./index-DrFu-skq.js";import"./bundle-mjs-D19diF5V.js";function t(r){const n={code:"code",h1:"h1",h2:"h2",hr:"hr",p:"p",pre:"pre",...i(),...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(a,{of:d}),`
`,e.jsx(n.h1,{id:"️-wargamemap",children:"🗺️ WargameMap"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"WargameMap"})," is a high-performance tactical map widget designed for command-and-control visualizations and tactical simulation. Powered by MapLibre, React Map GL, and Deck.gl, it renders custom MapLibre basemaps overlaid with dynamic NATO MIL-STD-2525 unit symbols, H3 hexagonal grid tiles, and directional attack arcs."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-interactive-preview",children:"🎨 Interactive Preview"}),`
`,e.jsx(o,{of:c}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-properties",children:"📋 Properties"}),`
`,e.jsxs(n.p,{children:["Below are the props accepted by the ",e.jsx(n.code,{children:"WargameMap"})," component:"]}),`
`,e.jsx(s,{}),`
`,e.jsxs(n.p,{children:[`| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `,e.jsx(n.code,{children:"initialViewState"})," | ",e.jsx(n.code,{children:"object"})," | ",e.jsx(n.code,{children:"{ longitude: 35.8, latitude: 48.8, zoom: 6, pitch: 45, bearing: 0 }"}),` | The default viewport settings for the map camera. |
| `,e.jsx(n.code,{children:"units"})," | ",e.jsx(n.code,{children:"UnitData[]"})," | ",e.jsx(n.code,{children:"[]"}),` | Array of troop elements containing coordinates and MIL-STD-2525 symbol identifiers. |
| `,e.jsx(n.code,{children:"attacks"})," | ",e.jsx(n.code,{children:"AttackData[]"})," | ",e.jsx(n.code,{children:"[]"}),` | Supply routes or artillery trajectory coordinates. |
| `,e.jsx(n.code,{children:"terrainHexes"})," | ",e.jsx(n.code,{children:"TerrainHexData[]"})," | ",e.jsx(n.code,{children:"[]"})," | H3 hexagon indexes colorized by control ownership status (",e.jsx(n.code,{children:"friendly"}),", ",e.jsx(n.code,{children:"hostile"}),", ",e.jsx(n.code,{children:"neutral"}),`). |
| `,e.jsx(n.code,{children:"mapStyle"})," | ",e.jsx(n.code,{children:"string"})," | ",e.jsx(n.code,{children:"Positron style URL"}),` | The URL stylesheet of the MapLibre/Carto vector tile server. |
| `,e.jsx(n.code,{children:"className"})," | ",e.jsx(n.code,{children:"string"})," | ",e.jsx(n.code,{children:"undefined"})," | Custom styling classes to apply to the map wrapper element. |"]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"-sub-type-interfaces",children:"🧬 Sub-type Interfaces"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`export interface UnitData {
  id: string;
  sidc: string; // MIL-STD-2525 standard 15-character symbol code
  coordinates: [number, number]; // [Longitude, Latitude]
}

export interface AttackData {
  id: string;
  origin: [number, number]; // [Longitude, Latitude]
  target: [number, number]; // [Longitude, Latitude]
}

export interface TerrainHexData {
  h3Index: string; // Valid H3 cell index (e.g. "841f181ffffffff")
  owner: 'friendly' | 'hostile' | 'neutral';
}
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"️-integration-example",children:"🛠️ Integration Example"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import React from 'react';
import { WargameMap } from 'nexus-shell';

const troops = [
  {
    id: 'infantry-hq',
    sidc: 'SFGP------', // Friendly Infantry HQ
    coordinates: [35.5, 48.6] as [number, number],
  },
  {
    id: 'hostile-armor',
    sidc: 'SHGA------', // Hostile Armored unit
    coordinates: [36.2, 49.1] as [number, number],
  }
];

const maneuvers = [
  {
    id: 'strike-1',
    origin: [35.5, 48.6] as [number, number],
    target: [36.2, 49.1] as [number, number],
  }
];

export default function CommandConsole() {
  return (
    <div className="h-[600px] w-full border border-border rounded-lg overflow-hidden">
      <WargameMap 
        units={troops}
        attacks={maneuvers}
        terrainHexes={[
          { h3Index: '841f181ffffffff', owner: 'friendly' },
          { h3Index: '841f183ffffffff', owner: 'hostile' }
        ]}
      />
    </div>
  );
}
`})})]})}function y(r={}){const{wrapper:n}={...i(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(t,{...r})}):t(r)}export{y as default};
