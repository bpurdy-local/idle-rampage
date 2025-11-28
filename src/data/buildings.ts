import {
  BuildingType,
  EvolvableBuilding,
  BuildingEvolutionTier,
} from '../models/Building';
import {getTierForPrestigeCount, PrestigeTier} from './prestigeMilestones';

/**
 * Evolvable buildings - each building can evolve through multiple tiers
 * based on wave progression
 */
export const EVOLVABLE_BUILDINGS: EvolvableBuilding[] = [
  {
    id: 'scrap_works',
    role: 'production',
    costMultiplier: 1.5,
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Scrap Collector',
        description: 'Gathers scrap from the wasteland',
        unlockWave: 1,
        baseProduction: 1,
        baseCost: 10,
        iconName: 'cog',
        color: '#8B4513',
      },
      {
        tier: 2,
        name: 'Recycler',
        description: 'Processes scrap into refined materials',
        unlockWave: 15,
        baseProduction: 3,
        baseCost: 100,
        iconName: 'recycle',
        color: '#228B22',
      },
      {
        tier: 3,
        name: 'Refinery',
        description: 'Refines materials into high-grade components',
        unlockWave: 35,
        baseProduction: 8,
        baseCost: 1000,
        iconName: 'fire',
        color: '#4682B4',
      },
      {
        tier: 4,
        name: 'Factory',
        description: 'Mass produces components with efficiency',
        unlockWave: 60,
        baseProduction: 20,
        baseCost: 10000,
        iconName: 'industry',
        color: '#9932CC',
      },
      {
        tier: 5,
        name: 'Megaplex',
        description: 'Ultimate production facility',
        unlockWave: 85,
        baseProduction: 50,
        baseCost: 100000,
        iconName: 'city',
        color: '#FFD700',
      },
    ],
  },
  {
    id: 'turret_station',
    role: 'combat',
    costMultiplier: 1.55,
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Turret Bay',
        description: 'Basic auto-damage against enemies',
        unlockWave: 3,
        baseProduction: 0.5,
        baseCost: 50,
        iconName: 'crosshairs',
        color: '#DC143C',
      },
      {
        tier: 2,
        name: 'Gun Emplacement',
        description: 'Improved auto-damage output',
        unlockWave: 20,
        baseProduction: 1.5,
        baseCost: 300,
        iconName: 'bullseye',
        color: '#FF4500',
      },
      {
        tier: 3,
        name: 'Weapons Lab',
        description: 'Advanced auto-damage systems',
        unlockWave: 45,
        baseProduction: 4,
        baseCost: 3000,
        iconName: 'flask',
        color: '#9932CC',
      },
      {
        tier: 4,
        name: 'War Factory',
        description: 'High-powered auto-damage machinery',
        unlockWave: 70,
        baseProduction: 10,
        baseCost: 30000,
        iconName: 'shield-alt',
        color: '#4169E1',
      },
      {
        tier: 5,
        name: 'Doom Fortress',
        description: 'Ultimate auto-damage destruction',
        unlockWave: 90,
        baseProduction: 25,
        baseCost: 300000,
        iconName: 'skull',
        color: '#8B0000',
      },
    ],
  },
  {
    id: 'training_facility',
    role: 'combat',
    costMultiplier: 1.55,
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Training Ground',
        description: 'Boosts tap damage',
        unlockWave: 5,
        baseProduction: 0.3,
        baseCost: 75,
        iconName: 'dumbbell',
        color: '#FF6B35',
      },
      {
        tier: 2,
        name: 'Combat Academy',
        description: 'Enhanced tap damage training',
        unlockWave: 25,
        baseProduction: 1,
        baseCost: 500,
        iconName: 'graduation-cap',
        color: '#20B2AA',
      },
      {
        tier: 3,
        name: 'Elite Barracks',
        description: 'Superior tap damage enhancement',
        unlockWave: 50,
        baseProduction: 3,
        baseCost: 5000,
        iconName: 'medal',
        color: '#DAA520',
      },
      {
        tier: 4,
        name: 'War College',
        description: 'Master-level tap damage boost',
        unlockWave: 75,
        baseProduction: 8,
        baseCost: 50000,
        iconName: 'user-graduate',
        color: '#8B008B',
      },
      {
        tier: 5,
        name: 'Champion Arena',
        description: 'Ultimate tap damage amplification',
        unlockWave: 95,
        baseProduction: 20,
        baseCost: 500000,
        iconName: 'trophy',
        color: '#FFD700',
      },
    ],
  },
  {
    id: 'command_center',
    role: 'utility',
    costMultiplier: 2.0,
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Outpost',
        description: '5% boost to all production',
        unlockWave: 25,
        baseProduction: 0.05,
        baseCost: 5000,
        iconName: 'flag',
        color: '#708090',
      },
      {
        tier: 2,
        name: 'Command Center',
        description: '10% boost to all production',
        unlockWave: 50,
        baseProduction: 0.1,
        baseCost: 50000,
        iconName: 'broadcast-tower',
        color: '#FFD700',
      },
      {
        tier: 3,
        name: 'War Room',
        description: '15% boost to all production',
        unlockWave: 75,
        baseProduction: 0.15,
        baseCost: 500000,
        iconName: 'chess-rook',
        color: '#E6E6FA',
      },
      {
        tier: 4,
        name: 'Citadel',
        description: '20% boost to all production and combat',
        unlockWave: 95,
        baseProduction: 0.2,
        baseCost: 5000000,
        iconName: 'crown',
        color: '#FF4500',
      },
    ],
  },
];

/**
 * Get an evolvable building by its ID
 */
export const getEvolvableBuildingById = (
  id: string,
): EvolvableBuilding | undefined => {
  return EVOLVABLE_BUILDINGS.find(b => b.id === id);
};

/**
 * Get the current evolution tier for a building based on the current wave
 */
export const getCurrentEvolutionTier = (
  building: EvolvableBuilding,
  currentWave: number,
): BuildingEvolutionTier => {
  // Find the highest tier that's unlocked for the current wave
  let currentTier = building.tiers[0];
  for (const tier of building.tiers) {
    if (tier.unlockWave <= currentWave) {
      currentTier = tier;
    }
  }
  return currentTier;
};

/**
 * Get the next evolution tier for a building (if any)
 */
export const getNextEvolutionTier = (
  building: EvolvableBuilding,
  currentWave: number,
): BuildingEvolutionTier | null => {
  const currentTier = getCurrentEvolutionTier(building, currentWave);
  const nextTierIndex =
    building.tiers.findIndex(t => t.tier === currentTier.tier) + 1;
  return building.tiers[nextTierIndex] ?? null;
};

/**
 * Check if a building would evolve at a given wave
 */
export const checkEvolutionAtWave = (
  building: EvolvableBuilding,
  wave: number,
): BuildingEvolutionTier | null => {
  const tier = building.tiers.find(t => t.unlockWave === wave);
  // Only return if it's not the first tier (tier 1 is the initial unlock, not an evolution)
  return tier && tier.tier > 1 ? tier : null;
};

/**
 * Check if a building is unlocked at a given wave
 */
export const isBuildingUnlockedAtWave = (
  building: EvolvableBuilding,
  wave: number,
): boolean => {
  return building.tiers[0].unlockWave <= wave;
};

/**
 * Get all buildings that unlock at a specific wave
 */
export const getBuildingsUnlockingAtWave = (
  wave: number,
): EvolvableBuilding[] => {
  return EVOLVABLE_BUILDINGS.filter(b => b.tiers[0].unlockWave === wave);
};

/**
 * Get all buildings that evolve at a specific wave
 */
export const getBuildingsEvolvingAtWave = (
  wave: number,
): {building: EvolvableBuilding; newTier: BuildingEvolutionTier}[] => {
  const evolutions: {building: EvolvableBuilding; newTier: BuildingEvolutionTier}[] = [];

  for (const building of EVOLVABLE_BUILDINGS) {
    const evolution = checkEvolutionAtWave(building, wave);
    if (evolution) {
      evolutions.push({building, newTier: evolution});
    }
  }

  return evolutions;
};

/**
 * Convert an EvolvableBuilding + tier to a BuildingType (for compatibility)
 */
export const toBuildingType = (
  building: EvolvableBuilding,
  tier: BuildingEvolutionTier,
): BuildingType => {
  return {
    id: building.id,
    name: tier.name,
    description: tier.description,
    role: building.role,
    baseProduction: tier.baseProduction,
    baseCost: tier.baseCost,
    costMultiplier: building.costMultiplier,
    maxBuilders: building.maxBuilders,
    unlockWave: tier.unlockWave,
    iconName: tier.iconName,
    color: tier.color,
  };
};

/**
 * Get the BuildingType for a building at a specific wave
 */
export const getBuildingTypeAtWave = (
  buildingId: string,
  currentWave: number,
): BuildingType | undefined => {
  const building = getEvolvableBuildingById(buildingId);
  if (!building) return undefined;

  const tier = getCurrentEvolutionTier(building, currentWave);
  return toBuildingType(building, tier);
};

// ============================================================================
// Legacy compatibility - these map to the new evolution system
// ============================================================================

/**
 * @deprecated Use EVOLVABLE_BUILDINGS instead
 * Returns BuildingType array for compatibility with existing code
 */
export const BUILDING_TYPES: BuildingType[] = EVOLVABLE_BUILDINGS.map(b =>
  toBuildingType(b, b.tiers[0]),
);

/**
 * @deprecated Use getEvolvableBuildingById and getCurrentEvolutionTier instead
 */
export const getBuildingTypeById = (id: string): BuildingType | undefined => {
  const building = getEvolvableBuildingById(id);
  if (!building) return undefined;
  // Return tier 1 for compatibility - callers should use wave-aware version
  return toBuildingType(building, building.tiers[0]);
};

/**
 * @deprecated Use isBuildingUnlockedAtWave instead
 */
export const getBuildingsUnlockedAtWave = (wave: number): BuildingType[] => {
  return EVOLVABLE_BUILDINGS.filter(b => isBuildingUnlockedAtWave(b, wave)).map(
    b => toBuildingType(b, getCurrentEvolutionTier(b, wave)),
  );
};

// Alias for convenience
export const BUILDINGS = BUILDING_TYPES;

// Calculate the maximum total builders allowed (sum of all building maxBuilders)
export const getMaxTotalBuilders = (): number => {
  return EVOLVABLE_BUILDINGS.reduce((sum, b) => sum + b.maxBuilders, 0);
};

/**
 * Get the tiered name for a building based on prestige count
 * e.g., "Scrap Collector" -> "Scrap Collector Mk II" at tier 1
 */
export const getTieredBuildingName = (
  baseName: string,
  prestigeCount: number,
): string => {
  const tier = getTierForPrestigeCount(prestigeCount);
  if (tier.tier === 0) {
    return baseName;
  }
  return `${baseName} ${tier.name}`;
};

/**
 * Get the tier color for buildings based on prestige count
 */
export const getTierColor = (prestigeCount: number): string => {
  const tier = getTierForPrestigeCount(prestigeCount);
  return tier.color;
};

/**
 * Get the current tier info for display
 */
export const getCurrentTier = (prestigeCount: number): PrestigeTier => {
  return getTierForPrestigeCount(prestigeCount);
};
