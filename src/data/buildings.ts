import {BuildingType} from '../models/Building';

export const BUILDING_TYPES: BuildingType[] = [
  {
    id: 'scrap_collector',
    name: 'Scrap Collector',
    description: 'Gathers scrap from the wasteland',
    role: 'production',
    baseProduction: 1,
    baseCost: 10,
    costMultiplier: 1.5,
    maxBuilders: 50,
    unlockWave: 1,
    iconName: 'cog',
    color: '#8B4513',
  },
  {
    id: 'recycler',
    name: 'Recycler',
    description: 'Processes scrap into refined materials',
    role: 'production',
    baseProduction: 3,
    baseCost: 100,
    costMultiplier: 1.6,
    maxBuilders: 50,
    unlockWave: 5,
    iconName: 'recycle',
    color: '#228B22',
  },
  {
    id: 'factory',
    name: 'Factory',
    description: 'Mass produces components from materials',
    role: 'production',
    baseProduction: 10,
    baseCost: 1000,
    costMultiplier: 1.7,
    maxBuilders: 50,
    unlockWave: 15,
    iconName: 'industry',
    color: '#4682B4',
  },
  {
    id: 'turret_bay',
    name: 'Turret Bay',
    description: 'Increases auto-damage against enemies',
    role: 'combat',
    baseProduction: 0.5,
    baseCost: 50,
    costMultiplier: 1.55,
    maxBuilders: 50,
    unlockWave: 3,
    iconName: 'crosshairs',
    color: '#DC143C',
  },
  {
    id: 'training_ground',
    name: 'Training Ground',
    description: 'Boosts tap damage per builder assigned',
    role: 'combat',
    baseProduction: 0.5,
    baseCost: 75,
    costMultiplier: 1.55,
    maxBuilders: 50,
    unlockWave: 5,
    iconName: 'dumbbell',
    color: '#FF6B35',
  },
  {
    id: 'weapons_lab',
    name: 'Weapons Lab',
    description: 'Researches burst attack improvements',
    role: 'combat',
    baseProduction: 0.2,
    baseCost: 500,
    costMultiplier: 1.65,
    maxBuilders: 50,
    unlockWave: 10,
    iconName: 'flask',
    color: '#9932CC',
  },
  {
    id: 'command_center',
    name: 'Command Center',
    description: 'Boosts all other building output',
    role: 'utility',
    baseProduction: 0.1,
    baseCost: 5000,
    costMultiplier: 2.0,
    maxBuilders: 50,
    unlockWave: 25,
    iconName: 'broadcast-tower',
    color: '#FFD700',
  },
];

export const getBuildingTypeById = (id: string): BuildingType | undefined => {
  return BUILDING_TYPES.find(b => b.id === id);
};

export const getBuildingsUnlockedAtWave = (wave: number): BuildingType[] => {
  return BUILDING_TYPES.filter(b => b.unlockWave <= wave);
};

// Alias for convenience
export const BUILDINGS = BUILDING_TYPES;

// Calculate the maximum total builders allowed (sum of all building maxBuilders)
export const getMaxTotalBuilders = (): number => {
  return BUILDING_TYPES.reduce((sum, b) => sum + b.maxBuilders, 0);
};
