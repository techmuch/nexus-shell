import React, { useMemo } from 'react';
import Map from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { ArcLayer } from '@deck.gl/layers';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { IconLayer } from '@deck.gl/layers';
import ms from 'milsymbol';
import 'maplibre-gl/dist/maplibre-gl.css';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Helper to generate a data URL from milsymbol
const generateUnitIcon = (sidc: string) => {
  // Try to create the symbol, fallback to a default if invalid
  try {
    const symbol = new ms.Symbol(sidc, { size: 30 });
    return symbol.asCanvas().toDataURL();
  } catch (e) {
    console.error("Invalid SIDC code for milsymbol:", sidc);
    return new ms.Symbol("SUGPE---------", { size: 30 }).asCanvas().toDataURL();
  }
};

export interface UnitData {
  id: string;
  sidc: string; // MIL-STD-2525 symbol code
  coordinates: [number, number]; // [longitude, latitude]
}

export interface AttackData {
  id: string;
  origin: [number, number];
  target: [number, number];
}

export interface TerrainHexData {
  h3Index: string;
  owner: 'friendly' | 'hostile' | 'neutral';
}

export interface WargameMapProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
  units?: UnitData[];
  attacks?: AttackData[];
  terrainHexes?: TerrainHexData[];
  mapStyle?: string;
  className?: string;
}

export const WargameMap: React.FC<WargameMapProps> = ({
  initialViewState = { longitude: 35.8, latitude: 48.8, zoom: 6, pitch: 45, bearing: 0 },
  units = [],
  attacks = [],
  terrainHexes = [],
  mapStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  className
}) => {

  // Memoize the layers so DeckGL doesn't unnecessarily recreate them
  const layers = useMemo(() => [
    // Grid: "Area of Operation" using H3 hexagons
    new H3HexagonLayer({
      id: 'grid-layer',
      data: terrainHexes,
      getHexagon: (d: any) => d.h3Index,
      getFillColor: (d: any) => {
        if (d.owner === 'friendly') return [0, 0, 255, 80];
        if (d.owner === 'hostile') return [255, 0, 0, 80];
        return [128, 128, 128, 80];
      },
      stroked: true,
      getLineColor: [255, 255, 255, 100],
      lineWidthMinPixels: 1,
      pickable: true,
    }),

    // Analysis: "Artillery Trajectories" or "Supply Lines"
    new ArcLayer({
      id: 'attack-lines',
      data: attacks,
      getSourcePosition: (d: any) => d.origin,
      getTargetPosition: (d: any) => d.target,
      getSourceColor: [0, 255, 0],
      getTargetColor: [255, 0, 0],
      getWidth: 4,
      pickable: true
    }),

    // Units: "Troops" with dynamic NATO symbols
    new IconLayer({
      id: 'unit-layer',
      data: units,
      getIcon: (d: any) => ({
        url: generateUnitIcon(d.sidc),
        width: 128,
        height: 128,
        anchorY: 64,
        anchorX: 64
      }),
      getSize: 50,
      getPosition: (d: any) => d.coordinates,
      pickable: true
    })
  ], [terrainHexes, attacks, units]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-background", className)}>
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={layers}
        getTooltip={({object}) => object && (object.id || object.h3Index)}
      >
        <Map
          mapStyle={mapStyle}
          reuseMaps
        />
      </DeckGL>
      
      {/* Optional UI overlay for map controls or legend could go here */}
      <div className="absolute bottom-4 left-4 bg-card/90 border border-border p-3 rounded shadow backdrop-blur-sm pointer-events-none">
        <h4 className="text-sm font-bold mb-2">Tactical Overlay</h4>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500/50 border border-white"></div> Friendly Hex
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500/50 border border-white"></div> Hostile Hex
          </div>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-4 h-1 bg-gradient-to-r from-green-500 to-red-500 rounded"></div> Attack Vector
          </div>
        </div>
      </div>
    </div>
  );
};
