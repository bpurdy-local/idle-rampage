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
    costMultiplier: 1.08, // Reduced cost scaling (was 1.15)
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Scrap Collector',
        description: 'Gathers scrap from the wasteland',
        unlockWave: 3,
        baseProduction: 1,
        baseCost: 75,
        iconName: 'cog',
        color: '#8B4513',
        specialEffect: {type: 'scrap_find'},
      },
      {
        tier: 2,
        name: 'Recycler',
        description: 'Processes scrap into refined materials',
        unlockWave: 1,
        unlockLevel: 10,
        baseProduction: 3, // 3x from tier 1
        baseCost: 400,
        iconName: 'recycle',
        color: '#228B22',
        specialEffect: {type: 'scrap_find'},
      },
      {
        tier: 3,
        name: 'Refinery',
        description: 'Refines materials into high-grade components',
        unlockWave: 1,
        unlockLevel: 25,
        baseProduction: 9, // 3x from tier 2
        baseCost: 3000,
        iconName: 'fire',
        color: '#4682B4',
        specialEffect: {type: 'scrap_find'},
      },
      {
        tier: 4,
        name: 'Factory',
        description: 'Mass produces components with efficiency',
        unlockWave: 1,
        unlockLevel: 50,
        baseProduction: 27, // 3x from tier 3
        baseCost: 25000,
        iconName: 'industry',
        color: '#9932CC',
        specialEffect: {type: 'scrap_find'},
      },
      {
        tier: 5,
        name: 'Megaplex',
        description: 'Ultimate production facility',
        unlockWave: 1,
        unlockLevel: 100,
        baseProduction: 81, // 3x from tier 4
        baseCost: 300000,
        iconName: 'city',
        color: '#FFD700',
        specialEffect: {type: 'scrap_find'},
      },
    ],
  },
  {
    id: 'weak_point_scanner',
    role: 'combat',
    costMultiplier: 1.08, // Reduced cost scaling (was 1.16)
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Weak Point Scanner',
        description: 'Reveals weak points for 2x tap damage',
        unlockWave: 5,
        baseProduction: 1.0, // 2x damage multiplier base
        baseCost: 250,
        iconName: 'crosshairs',
        color: '#00CED1',
        specialEffect: {type: 'critical_weakness'},
      },
      {
        tier: 2,
        name: 'Vulnerability Detector',
        description: 'More weak points, 6x tap damage',
        unlockWave: 5,
        unlockLevel: 10,
        baseProduction: 3.0, // 3x from tier 1
        baseCost: 1200,
        iconName: 'bullseye',
        color: '#20B2AA',
        specialEffect: {type: 'critical_weakness'},
      },
      {
        tier: 3,
        name: 'Targeting Array',
        description: 'Faster weak points, 18x tap damage',
        unlockWave: 5,
        unlockLevel: 25,
        baseProduction: 9.0, // 3x from tier 2
        baseCost: 8000,
        iconName: 'satellite-dish',
        color: '#4682B4',
        specialEffect: {type: 'critical_weakness'},
      },
      {
        tier: 4,
        name: 'Neural Analyzer',
        description: 'Larger weak points, 54x tap damage',
        unlockWave: 5,
        unlockLevel: 50,
        baseProduction: 27.0, // 3x from tier 3
        baseCost: 60000,
        iconName: 'brain',
        color: '#9370DB',
        specialEffect: {type: 'critical_weakness'},
      },
      {
        tier: 5,
        name: 'Quantum Scanner',
        description: 'Maximum weak points, 162x tap damage',
        unlockWave: 5,
        unlockLevel: 100,
        baseProduction: 81.0, // 3x from tier 4
        baseCost: 500000,
        iconName: 'atom',
        color: '#FF1493',
        specialEffect: {type: 'critical_weakness'},
      },
    ],
  },
  {
    id: 'training_facility',
    role: 'combat',
    costMultiplier: 1.08, // Reduced cost scaling (was 1.16)
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Training Ground',
        description: '+10% tap damage bonus per effective worker',
        unlockWave: 1,
        baseProduction: 0.10, // 10% bonus per effective worker
        baseCost: 150,
        iconName: 'dumbbell',
        color: '#FF6B35',
        specialEffect: {type: 'burst_boost'},
      },
      {
        tier: 2,
        name: 'Combat Academy',
        description: '+30% tap damage bonus per effective worker',
        unlockWave: 1,
        unlockLevel: 10,
        baseProduction: 0.30, // 3x from tier 1
        baseCost: 1000,
        iconName: 'graduation-cap',
        color: '#20B2AA',
        specialEffect: {type: 'burst_boost'},
      },
      {
        tier: 3,
        name: 'Elite Barracks',
        description: '+90% tap damage bonus per effective worker',
        unlockWave: 1,
        unlockLevel: 25,
        baseProduction: 0.90, // 3x from tier 2
        baseCost: 7000,
        iconName: 'medal',
        color: '#DAA520',
        specialEffect: {type: 'burst_boost'},
      },
      {
        tier: 4,
        name: 'War College',
        description: '+270% tap damage bonus per effective worker',
        unlockWave: 1,
        unlockLevel: 50,
        baseProduction: 2.70, // 3x from tier 3
        baseCost: 55000,
        iconName: 'user-graduate',
        color: '#8B008B',
        specialEffect: {type: 'burst_boost'},
      },
      {
        tier: 5,
        name: 'Champion Arena',
        description: '+810% tap damage bonus per effective worker',
        unlockWave: 1,
        unlockLevel: 100,
        baseProduction: 8.10, // 3x from tier 4
        baseCost: 550000,
        iconName: 'trophy',
        color: '#FFD700',
        specialEffect: {type: 'burst_boost'},
      },
    ],
  },
  {
    id: 'command_center',
    role: 'utility',
    costMultiplier: 1.10, // Reduced cost scaling (was 1.18)
    maxBuilders: 20,
    tiers: [
      {
        tier: 1,
        name: 'Outpost',
        description: '20% boost to all production (+1% per level, +1% per worker)',
        unlockWave: 15,
        baseProduction: 0.20, // 20% base boost
        baseCost: 5000,
        iconName: 'flag',
        color: '#708090',
      },
      {
        tier: 2,
        name: 'Command Center',
        description: '60% boost to all production (+1% per level, +1% per worker)',
        unlockWave: 20,
        unlockLevel: 10,
        baseProduction: 0.60, // 3x from tier 1
        baseCost: 30000,
        iconName: 'broadcast-tower',
        color: '#FFD700',
      },
      {
        tier: 3,
        name: 'War Room',
        description: '180% boost to all production (+1% per level, +1% per worker)',
        unlockWave: 20,
        unlockLevel: 25,
        baseProduction: 1.80, // 3x from tier 2
        baseCost: 200000,
        iconName: 'chess-rook',
        color: '#E6E6FA',
      },
      {
        tier: 4,
        name: 'Citadel',
        description: '540% boost to all production (MAX)',
        unlockWave: 20,
        unlockLevel: 50,
        baseProduction: 5.40, // 3x from tier 3
        baseCost: 1500000,
        iconName: 'crown',
        color: '#FF4500',
      },
    ],
  },
  {
    id: 'engineering_bay',
    role: 'utility',
    costMultiplier: 1.10, // Reduced cost scaling (was 1.17)
    maxBuilders: 15,
    tiers: [
      {
        tier: 1,
        name: 'Engineering Bay',
        description: '10% upgrade cost reduction (+1% per level, +1% per worker)',
        unlockWave: 20,
        baseProduction: 0.10, // 10% base reduction
        baseCost: 800,
        iconName: 'wrench',
        color: '#4682B4',
      },
      {
        tier: 2,
        name: 'Research Lab',
        description: '30% upgrade cost reduction (+1% per level, +1% per worker)',
        unlockWave: 10,
        unlockLevel: 10,
        baseProduction: 0.30, // 3x from tier 1
        baseCost: 5000,
        iconName: 'flask',
        color: '#5F9EA0',
      },
      {
        tier: 3,
        name: 'Innovation Hub',
        description: '90% upgrade cost reduction (+1% per level, +1% per worker)',
        unlockWave: 10,
        unlockLevel: 25,
        baseProduction: 0.90, // 3x from tier 2 (capped at 50% in actual formula)
        baseCost: 35000,
        iconName: 'lightbulb',
        color: '#00CED1',
      },
      {
        tier: 4,
        name: 'Tech Nexus',
        description: 'MAX upgrade cost reduction (50% cap)',
        unlockWave: 10,
        unlockLevel: 50,
        baseProduction: 2.70, // 3x from tier 3 (capped at 50%)
        baseCost: 250000,
        iconName: 'microchip',
        color: '#1E90FF',
      },
      {
        tier: 5,
        name: 'Singularity Core',
        description: 'MAX upgrade cost reduction (50% cap)',
        unlockWave: 10,
        unlockLevel: 100,
        baseProduction: 8.10, // 3x from tier 4 (capped at 50%)
        baseCost: 1800000,
        iconName: 'atom',
        color: '#9400D3',
      },
    ],
  },
  {
    id: 'shield_generator',
    role: 'utility',
    costMultiplier: 1.10, // Reduced cost scaling (was 1.18)
    maxBuilders: 50,
    tiers: [
      {
        tier: 1,
        name: 'Shield Generator',
        description: 'Adds +5 seconds to wave timer',
        unlockWave: 10,
        baseProduction: 5,
        baseCost: 1500,
        iconName: 'shield-alt',
        color: '#4169E1',
        specialEffect: {type: 'wave_extend'},
      },
      {
        tier: 2,
        name: 'Barrier Projector',
        description: 'Adds +15 seconds to wave timer',
        unlockWave: 15,
        unlockLevel: 10,
        baseProduction: 15, // 3x from tier 1
        baseCost: 12000,
        iconName: 'shield-virus',
        color: '#6495ED',
        specialEffect: {type: 'wave_extend'},
      },
      {
        tier: 3,
        name: 'Force Field Array',
        description: 'Adds +45 seconds to wave timer',
        unlockWave: 15,
        unlockLevel: 25,
        baseProduction: 45, // 3x from tier 2 (capped at 30s in formula)
        baseCost: 90000,
        iconName: 'circle-notch',
        color: '#00BFFF',
        specialEffect: {type: 'wave_extend'},
      },
      {
        tier: 4,
        name: 'Quantum Barrier',
        description: 'Adds +MAX seconds to wave timer (30s cap)',
        unlockWave: 15,
        unlockLevel: 50,
        baseProduction: 135, // 3x from tier 3 (capped at 30s)
        baseCost: 700000,
        iconName: 'atom',
        color: '#7B68EE',
        specialEffect: {type: 'wave_extend'},
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
 * Get the current evolution tier for a building based on the building's level.
 * Tier 1 is always available once the building is unlocked.
 * Subsequent tiers require reaching a specific building level.
 *
 * @param building - The evolvable building definition
 * @param buildingLevel - The current level of the building
 */
export const getCurrentEvolutionTier = (
  building: EvolvableBuilding,
  buildingLevel: number,
): BuildingEvolutionTier => {
  // Find the highest tier that's unlocked for the current building level
  let currentTier = building.tiers[0];
  for (const tier of building.tiers) {
    // Tier 1 has no unlockLevel requirement
    if (tier.tier === 1) {
      currentTier = tier;
    } else if (tier.unlockLevel !== undefined && buildingLevel >= tier.unlockLevel) {
      currentTier = tier;
    }
  }
  return currentTier;
};

/**
 * Get the next evolution tier for a building (if any)
 *
 * @param building - The evolvable building definition
 * @param currentEvolutionTier - The building's current evolution tier (1-indexed)
 */
export const getNextEvolutionTier = (
  building: EvolvableBuilding,
  currentEvolutionTier: number,
): BuildingEvolutionTier | null => {
  // Simply get the next tier after the current one
  const nextTierIndex = currentEvolutionTier; // tier 1 -> index 1, tier 2 -> index 2, etc.
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
 * Scales with building level AND assigned workers.
 * Returns a multiplier (e.g., 0.85 = 15% cost reduction)
 */
export const calculateEngineeringDiscount = (buildings: BuildingState[]): number => {
  const engineeringBay = buildings.find(b => b.typeId === 'engineering_bay');
  if (!engineeringBay || !engineeringBay.isUnlocked) return 1;

  const evolvable = getEvolvableBuildingById('engineering_bay');
  if (!evolvable) return 1;

  const tier = evolvable.tiers[engineeringBay.evolutionTier - 1];
  if (!tier) return 1;

  // Effect: baseProduction + 0.8% per level above 1 + 0.8% per worker
  // e.g., Tier 1 at level 10 with 5 workers: 8% + (9 * 0.8%) + (5 * 0.8%) = 19.2%
  const baseDiscount = tier.baseProduction;
  const levelBonus = (engineeringBay.level - 1) * 0.008;
  const workerBonus = engineeringBay.assignedBuilders * 0.008;
  const discountPercent = baseDiscount + levelBonus + workerBonus;

  // Cap discount at 50% to prevent free upgrades
  const cappedDiscount = Math.min(0.5, discountPercent);

  // Return as multiplier (e.g., 0.15 discount -> 0.85 multiplier)
  return 1 - cappedDiscount;
};

/**
 * Calculate the Command Center production boost.
 * Scales with building level AND assigned workers.
 * Returns a multiplier (e.g., 1.25 = 25% boost)
 */
export const calculateCommandCenterBoost = (buildings: BuildingState[]): number => {
  const commandCenter = buildings.find(b => b.typeId === 'command_center');
  if (!commandCenter || !commandCenter.isUnlocked) return 1;

  const evolvable = getEvolvableBuildingById('command_center');
  if (!evolvable) return 1;

  const tier = evolvable.tiers[commandCenter.evolutionTier - 1];
  if (!tier) return 1;

  // Effect: baseProduction + 1% per level above 1 + 1% per worker
  // e.g., Tier 1 at level 10 with 10 workers: 10% + (9 * 1%) + (10 * 1%) = 29%
  const baseBoost = tier.baseProduction;
  const levelBonus = (commandCenter.level - 1) * 0.01;
  const workerBonus = commandCenter.assignedBuilders * 0.01;
  const boostPercent = baseBoost + levelBonus + workerBonus;

  // Cap boost at 80%
  const cappedBoost = Math.min(0.80, boostPercent);

  // Return as multiplier (e.g., 0.25 boost -> 1.25 multiplier)
  return 1 + cappedBoost;
};

/**
 * Calculate the Shield Generator wave timer bonus.
 * Scales with building level. Workers affect wave extend chance instead.
 * Returns bonus seconds to add to wave timer.
 */
export const calculateShieldGeneratorBonus = (buildings: BuildingState[]): number => {
  const shieldGenerator = buildings.find(b => b.typeId === 'shield_generator');
  if (!shieldGenerator || !shieldGenerator.isUnlocked) return 0;

  const evolvable = getEvolvableBuildingById('shield_generator');
  if (!evolvable) return 0;

  const tier = evolvable.tiers[shieldGenerator.evolutionTier - 1];
  if (!tier) return 0;

  // Effect: baseProduction (seconds) + 0.3s per level above 1
  // e.g., Tier 1 at level 10: 5s + (9 * 0.3s) = 7.7s
  const baseBonus = tier.baseProduction;
  const levelBonus = (shieldGenerator.level - 1) * 0.3;

  // Cap at 30 seconds max bonus
  return Math.min(30, baseBonus + levelBonus);
};
