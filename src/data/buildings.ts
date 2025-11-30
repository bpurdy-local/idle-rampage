import {
  BuildingType,
  EvolvableBuilding,
  BuildingEvolutionTier,
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
    costMultiplier: 1.18,
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Scrap Collector',
        description: 'Gathers scrap from the wasteland',
        unlockWave: 1,
        baseProduction: 1,
        baseCost: 75,
        iconName: 'cog',
        color: '#8B4513',
      },
      {
        tier: 2,
        name: 'Recycler',
        description: 'Processes scrap into refined materials',
        unlockWave: 8,
        baseProduction: 5,
        baseCost: 1500,
        iconName: 'recycle',
        color: '#228B22',
      },
      {
        tier: 3,
        name: 'Refinery',
        description: 'Refines materials into high-grade components',
        unlockWave: 24,
        baseProduction: 20,
        baseCost: 20000,
        iconName: 'fire',
        color: '#4682B4',
      },
      {
        tier: 4,
        name: 'Factory',
        description: 'Mass produces components with efficiency',
        unlockWave: 48,
        baseProduction: 75,
        baseCost: 400000,
        iconName: 'industry',
        color: '#9932CC',
      },
      {
        tier: 5,
        name: 'Megaplex',
        description: 'Ultimate production facility',
        unlockWave: 78,
        baseProduction: 250,
        baseCost: 8000000,
        iconName: 'city',
        color: '#FFD700',
      },
    ],
  },
  {
    id: 'weak_point_scanner',
    role: 'combat',
    costMultiplier: 1.20,
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Weak Point Scanner',
        description: 'Reveals weak points for bonus tap damage',
        unlockWave: 5,
        baseProduction: 0.1,
        baseCost: 300,
        iconName: 'crosshairs',
        color: '#00CED1',
      },
      {
        tier: 2,
        name: 'Vulnerability Detector',
        description: 'More weak points, 2.5x tap damage',
        unlockWave: 12,
        baseProduction: 0.15,
        baseCost: 3000,
        iconName: 'bullseye',
        color: '#20B2AA',
      },
      {
        tier: 3,
        name: 'Targeting Array',
        description: 'Faster weak points, 3x tap damage',
        unlockWave: 32,
        baseProduction: 0.2,
        baseCost: 50000,
        iconName: 'satellite-dish',
        color: '#4682B4',
      },
      {
        tier: 4,
        name: 'Neural Analyzer',
        description: 'Larger weak points, 4x tap damage',
        unlockWave: 56,
        baseProduction: 0.25,
        baseCost: 1000000,
        iconName: 'brain',
        color: '#9370DB',
      },
      {
        tier: 5,
        name: 'Quantum Scanner',
        description: 'Maximum weak points, 5x tap damage',
        unlockWave: 84,
        baseProduction: 0.3,
        baseCost: 20000000,
        iconName: 'atom',
        color: '#FF1493',
      },
    ],
  },
  {
    id: 'training_facility',
    role: 'combat',
    costMultiplier: 1.20,
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Training Ground',
        description: 'Boosts tap damage',
        unlockWave: 3,
        baseProduction: 0.3,
        baseCost: 200,
        iconName: 'dumbbell',
        color: '#FF6B35',
      },
      {
        tier: 2,
        name: 'Combat Academy',
        description: 'Enhanced tap damage training',
        unlockWave: 16,
        baseProduction: 1.5,
        baseCost: 5000,
        iconName: 'graduation-cap',
        color: '#20B2AA',
      },
      {
        tier: 3,
        name: 'Elite Barracks',
        description: 'Superior tap damage enhancement',
        unlockWave: 36,
        baseProduction: 6,
        baseCost: 75000,
        iconName: 'medal',
        color: '#DAA520',
      },
      {
        tier: 4,
        name: 'War College',
        description: 'Master-level tap damage boost',
        unlockWave: 62,
        baseProduction: 20,
        baseCost: 1500000,
        iconName: 'user-graduate',
        color: '#8B008B',
      },
      {
        tier: 5,
        name: 'Champion Arena',
        description: 'Ultimate tap damage amplification',
        unlockWave: 88,
        baseProduction: 60,
        baseCost: 30000000,
        iconName: 'trophy',
        color: '#FFD700',
      },
    ],
  },
  {
    id: 'command_center',
    role: 'utility',
    costMultiplier: 1.30,
    maxBuilders: 0,
    noWorkers: true,
    tiers: [
      {
        tier: 1,
        name: 'Outpost',
        description: 'Static 15% boost to all production',
        unlockWave: 20,
        baseProduction: 0.15,
        baseCost: 75000,
        iconName: 'flag',
        color: '#708090',
      },
      {
        tier: 2,
        name: 'Command Center',
        description: 'Static 25% boost to all production',
        unlockWave: 44,
        baseProduction: 0.25,
        baseCost: 600000,
        iconName: 'broadcast-tower',
        color: '#FFD700',
      },
      {
        tier: 3,
        name: 'War Room',
        description: 'Static 35% boost to all production',
        unlockWave: 68,
        baseProduction: 0.35,
        baseCost: 6000000,
        iconName: 'chess-rook',
        color: '#E6E6FA',
      },
      {
        tier: 4,
        name: 'Citadel',
        description: 'Static 50% boost to all production',
        unlockWave: 94,
        baseProduction: 0.50,
        baseCost: 60000000,
        iconName: 'crown',
        color: '#FF4500',
      },
    ],
  },
  {
    id: 'engineering_bay',
    role: 'utility',
    costMultiplier: 1.22,
    maxBuilders: 0,
    noWorkers: true,
    tiers: [
      {
        tier: 1,
        name: 'Engineering Bay',
        description: 'Static 10% upgrade cost reduction',
        unlockWave: 10,
        baseProduction: 0.10,
        baseCost: 2000,
        iconName: 'wrench',
        color: '#4682B4',
      },
      {
        tier: 2,
        name: 'Research Lab',
        description: 'Static 15% upgrade cost reduction',
        unlockWave: 28,
        baseProduction: 0.15,
        baseCost: 25000,
        iconName: 'flask',
        color: '#5F9EA0',
      },
      {
        tier: 3,
        name: 'Innovation Hub',
        description: 'Static 20% upgrade cost reduction',
        unlockWave: 52,
        baseProduction: 0.20,
        baseCost: 300000,
        iconName: 'lightbulb',
        color: '#00CED1',
      },
      {
        tier: 4,
        name: 'Tech Nexus',
        description: 'Static 30% upgrade cost reduction',
        unlockWave: 74,
        baseProduction: 0.30,
        baseCost: 3500000,
        iconName: 'microchip',
        color: '#1E90FF',
      },
      {
        tier: 5,
        name: 'Singularity Core',
        description: 'Static 40% upgrade cost reduction',
        unlockWave: 98,
        baseProduction: 0.40,
        baseCost: 70000000,
        iconName: 'atom',
        color: '#9400D3',
      },
    ],
  },
  {
    id: 'shield_generator',
    role: 'utility',
    costMultiplier: 1.25,
    maxBuilders: 0,
    noWorkers: true,
    tiers: [
      {
        tier: 1,
        name: 'Shield Generator',
        description: 'Adds +5 seconds to wave timer',
        unlockWave: 15,
        baseProduction: 5,
        baseCost: 8000,
        iconName: 'shield-alt',
        color: '#4169E1',
      },
      {
        tier: 2,
        name: 'Barrier Projector',
        description: 'Adds +8 seconds to wave timer',
        unlockWave: 40,
        baseProduction: 8,
        baseCost: 200000,
        iconName: 'shield-virus',
        color: '#6495ED',
      },
      {
        tier: 3,
        name: 'Force Field Array',
        description: 'Adds +12 seconds to wave timer',
        unlockWave: 64,
        baseProduction: 12,
        baseCost: 2500000,
        iconName: 'circle-notch',
        color: '#00BFFF',
      },
      {
        tier: 4,
        name: 'Quantum Barrier',
        description: 'Adds +18 seconds to wave timer',
        unlockWave: 90,
        baseProduction: 18,
        baseCost: 50000000,
        iconName: 'atom',
        color: '#7B68EE',
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
 * Check if a building would unlock at a given wave (tier 1)
 */
export const checkUnlockAtWave = (
  building: EvolvableBuilding,
  wave: number,
): BuildingEvolutionTier | null => {
  const firstTier = building.tiers[0];
  // Return tier 1 if it unlocks at this wave
  return firstTier && firstTier.unlockWave === wave ? firstTier : null;
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
 * Get all buildings that unlock at a specific wave (tier 1)
 */
export const getBuildingsUnlockingAtWave = (
  wave: number,
): {building: EvolvableBuilding; tier: BuildingEvolutionTier}[] => {
  const unlocks: {building: EvolvableBuilding; tier: BuildingEvolutionTier}[] = [];

  for (const building of EVOLVABLE_BUILDINGS) {
    const tier = checkUnlockAtWave(building, wave);
    if (tier) {
      unlocks.push({building, tier});
    }
  }

  return unlocks;
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

// ============================================================================
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
 * Calculate the Engineering Bay cost reduction multiplier.
 * This is a static effect that scales with building level (no workers needed).
 * Returns a multiplier (e.g., 0.85 = 15% cost reduction)
 */
export const calculateEngineeringDiscount = (buildings: BuildingState[]): number => {
  const engineeringBay = buildings.find(b => b.typeId === 'engineering_bay');
  if (!engineeringBay || !engineeringBay.isUnlocked) return 1;

  const evolvable = getEvolvableBuildingById('engineering_bay');
  if (!evolvable) return 1;

  const tier = evolvable.tiers[engineeringBay.evolutionTier - 1];
  if (!tier) return 1;

  // Static effect: baseProduction + 2% per level above 1
  // e.g., Tier 1 at level 5: 10% + (4 * 2%) = 18%
  const baseDiscount = tier.baseProduction;
  const levelBonus = (engineeringBay.level - 1) * 0.02;
  const discountPercent = baseDiscount + levelBonus;

  // Cap discount at 50% to prevent free upgrades
  const cappedDiscount = Math.min(0.5, discountPercent);

  // Return as multiplier (e.g., 0.15 discount -> 0.85 multiplier)
  return 1 - cappedDiscount;
};

/**
 * Calculate the Shield Generator wave timer bonus.
 * This is a static effect that scales with building level (no workers needed).
 * Returns bonus seconds to add to wave timer.
 */
export const calculateShieldGeneratorBonus = (buildings: BuildingState[]): number => {
  const shieldGenerator = buildings.find(b => b.typeId === 'shield_generator');
  if (!shieldGenerator || !shieldGenerator.isUnlocked) return 0;

  const evolvable = getEvolvableBuildingById('shield_generator');
  if (!evolvable) return 0;

  const tier = evolvable.tiers[shieldGenerator.evolutionTier - 1];
  if (!tier) return 0;

  // Static effect: baseProduction (seconds) + 0.5s per level above 1
  // e.g., Tier 1 at level 5: 5s + (4 * 0.5s) = 7s
  const baseBonus = tier.baseProduction;
  const levelBonus = (shieldGenerator.level - 1) * 0.5;

  // Cap at 30 seconds max bonus
  return Math.min(30, baseBonus + levelBonus);
};
