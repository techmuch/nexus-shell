import type { Meta, StoryObj } from '@storybook/react';
import { WargameMap } from '../components/widgets/WargameMap';
import { latLngToCell, gridDisk } from 'h3-js';

const meta = {
  title: 'Widgets/WargameMap',
  component: WargameMap,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WargameMap>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base coordinates (somewhere in Europe for example)
const CENTER_LAT = 48.8;
const CENTER_LNG = 35.8;

// Generate Hex Grid around the center (Resolution 4 is roughly city-sized)
const centerHex = latLngToCell(CENTER_LAT, CENTER_LNG, 4);
const surroundingHexes = gridDisk(centerHex, 3);

const terrainHexes = surroundingHexes.map((h3Index, i) => {
    let owner: 'friendly' | 'hostile' | 'neutral' = 'neutral';
    if (i % 5 === 0) owner = 'hostile';
    else if (i % 3 === 0) owner = 'friendly';
    return { h3Index, owner };
});

const mockUnits = [
  {
    id: 'unit-1',
    // Friendly Infantry HQ
    sidc: 'SFGP------',
    coordinates: [35.5, 48.6] as [number, number],
  },
  {
    id: 'unit-2',
    // Hostile Armor
    sidc: 'SHGA------',
    coordinates: [36.2, 49.1] as [number, number],
  },
  {
    id: 'unit-3',
    // Friendly Artillery
    sidc: 'SFGPE-----',
    coordinates: [35.2, 48.4] as [number, number],
  }
];

const mockAttacks = [
  {
    id: 'atk-1',
    origin: [35.2, 48.4] as [number, number], // Artillery
    target: [36.2, 49.1] as [number, number], // Armor
  }
];

export const Default: Story = {
  args: {
    initialViewState: {
        longitude: CENTER_LNG,
        latitude: CENTER_LAT,
        zoom: 6,
        pitch: 45,
        bearing: 0
    },
    units: mockUnits,
    attacks: mockAttacks,
    terrainHexes: terrainHexes,
    className: "h-screen w-full"
  },
};

export const Empty: Story = {
  args: {
    className: "h-screen w-full"
  }
};
