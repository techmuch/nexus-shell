import { default as React } from '../../../node_modules/react';

export interface UnitData {
    id: string;
    sidc: string;
    coordinates: [number, number];
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
export declare const WargameMap: React.FC<WargameMapProps>;
