import {
  BuildingType,
  EvolvableBuilding,
  BuildingEvolutionTier,
  calculateProduction,
} from '../models/Building';
import {getTierForPrestigeCount, PrestigeTier} from './prestigeMilestones';
import {BuildingState} from '../core/GameState';

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
        description: '10% boost to all production',
        unlockWave: 25,
        baseProduction: 0.10, // Doubled from 0.05 for stronger early impact
        baseCost: 5000,
        iconName: 'flag',
        color: '#708090',
      },
      {
        tier: 2,
        name: 'Command Center',
        description: '20% boost to all production',
        unlockWave: 50,
        baseProduction: 0.20, // Doubled from 0.1
        baseCost: 50000,
        iconName: 'broadcast-tower',
        color: '#FFD700',
      },
      {
        tier: 3,
        name: 'War Room',
        description: '30% boost to all production',
        unlockWave: 75,
        baseProduction: 0.30, // Doubled from 0.15
        baseCost: 500000,
        iconName: 'chess-rook',
        color: '#E6E6FA',
      },
      {
        tier: 4,
        name: 'Citadel',
        description: '40% boost to all production and combat',
        unlockWave: 95,
        baseProduction: 0.40, // Doubled from 0.2
        baseCost: 5000000,
        iconName: 'crown',
        color: '#FF4500',
      },
    ],
  },
  {
    id: 'salvage_yard',
    role: 'utility',
    costMultiplier: 1.6,
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Salvage Yard',
        description: 'Bonus scrap from defeated enemies',
        unlockWave: 8,
        baseProduction: 0.05, // 5% bonus per effective worker
        baseCost: 100,
        iconName: 'recycle',
        color: '#8B4513',
      },
      {
        tier: 2,
        name: 'Reclamation Center',
        description: 'Improved enemy loot recovery',
        unlockWave: 30,
        baseProduction: 0.08,
        baseCost: 800,
        iconName: 'warehouse',
        color: '#CD853F',
      },
      {
        tier: 3,
        name: 'Loot Processor',
        description: 'Advanced salvage processing',
        unlockWave: 55,
        baseProduction: 0.12,
        baseCost: 8000,
        iconName: 'cogs',
        color: '#B8860B',
      },
      {
        tier: 4,
        name: 'Trophy Hall',
        description: 'Elite enemy reward extraction',
        unlockWave: 80,
        baseProduction: 0.18,
        baseCost: 80000,
        iconName: 'gem',
        color: '#FFD700',
      },
      {
        tier: 5,
        name: 'Spoils Vault',
        description: 'Ultimate loot magnification',
        unlockWave: 98,
        baseProduction: 0.25,
        baseCost: 800000,
        iconName: 'treasure-chest',
        color: '#FFA500',
      },
    ],
  },
  {
    id: 'engineering_bay',
    role: 'utility',
    costMultiplier: 1.7,
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Engineering Bay',
        description: 'Reduces upgrade costs',
        unlockWave: 12,
        baseProduction: 0.02, // 2% cost reduction per effective worker
        baseCost: 150,
        iconName: 'wrench',
        color: '#4682B4',
      },
      {
        tier: 2,
        name: 'Research Lab',
        description: 'Improved cost efficiency',
        unlockWave: 35,
        baseProduction: 0.035,
        baseCost: 1200,
        iconName: 'flask',
        color: '#5F9EA0',
      },
      {
        tier: 3,
        name: 'Innovation Hub',
        description: 'Advanced upgrade optimization',
        unlockWave: 60,
        baseProduction: 0.05,
        baseCost: 12000,
        iconName: 'lightbulb',
        color: '#00CED1',
      },
      {
        tier: 4,
        name: 'Tech Nexus',
        description: 'Superior engineering efficiency',
        unlockWave: 85,
        baseProduction: 0.07,
        baseCost: 120000,
        iconName: 'microchip',
        color: '#1E90FF',
      },
      {
        tier: 5,
        name: 'Singularity Core',
        description: 'Ultimate cost reduction',
        unlockWave: 100,
        baseProduction: 0.10,
        baseCost: 1200000,
        iconName: 'atom',
        color: '#9400D3',
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

// ============================================================================
// Building Effect Calculations
// ============================================================================

/**
 * Calculate the Salvage Yard reward bonus multiplier.
 * Returns a multiplier (e.g., 1.15 = 15% bonus to rewards)
 */
export const calculateSalvageBonus = (buildings: BuildingState[]): number => {
  const salvageYard = buildings.find(b => b.typeId === 'salvage_yard');
  if (!salvageYard || !salvageYard.isUnlocked) return 1;

  const evolvable = getEvolvableBuildingById('salvage_yard');
  if (!evolvable) return 1;

  const tier = evolvable.tiers[salvageYard.evolutionTier - 1];
  if (!tier) return 1;

  const buildingType = toBuildingType(evolvable, tier);

  // Calculate bonus percentage (includes passive baseline)
  const bonusPercent = calculateProduction(
    buildingType,
    salvageYard.level,
    salvageYard.assignedBuilders,
  );

  // Return as multiplier (e.g., 0.15 bonus -> 1.15 multiplier)
  return 1 + bonusPercent;
};

/**
 * Calculate the Engineering Bay cost reduction multiplier.
 * Returns a multiplier (e.g., 0.85 = 15% cost reduction)
 */
export const calculateEngineeringDiscount = (buildings: BuildingState[]): number => {
  const engineeringBay = buildings.find(b => b.typeId === 'engineering_bay');
  if (!engineeringBay || !engineeringBay.isUnlocked) return 1;

  const evolvable = getEvolvableBuildingById('engineering_bay');
  if (!evolvable) return 1;

  const tier = evolvable.tiers[engineeringBay.evolutionTier - 1];
  if (!tier) return 1;

  const buildingType = toBuildingType(evolvable, tier);

  // Calculate discount percentage (includes passive baseline)
  const discountPercent = calculateProduction(
    buildingType,
    engineeringBay.level,
    engineeringBay.assignedBuilders,
  );

  // Cap discount at 50% to prevent free upgrades
  const cappedDiscount = Math.min(0.5, discountPercent);

  // Return as multiplier (e.g., 0.15 discount -> 0.85 multiplier)
  return 1 - cappedDiscount;
};
