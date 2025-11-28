export type BuildingRole = 'production' | 'combat' | 'utility';

/**
 * Represents a single evolution tier of a building
 */
export interface BuildingEvolutionTier {
  tier: number;
  name: string;
  description: string;
  unlockWave: number;
  baseProduction: number;
  baseCost: number;
  iconName: string;
  color: string;
}

/**
 * Represents an evolvable building with multiple tiers
 */
export interface EvolvableBuilding {
  id: string;
  role: BuildingRole;
  costMultiplier: number;
  maxBuilders: number;
  tiers: BuildingEvolutionTier[];
}

/**
 * Legacy BuildingType interface for compatibility during transition
 * Maps to a specific tier of an EvolvableBuilding
 */
export interface BuildingType {
  id: string;
  name: string;
  description: string;
  role: BuildingRole;
  baseProduction: number;
  baseCost: number;
  costMultiplier: number;
  maxBuilders: number;
  unlockWave: number;
  iconName: string;
  color: string;
}

export interface Building {
  id: string;
  typeId: string;
  level: number;
  assignedBuilders: number;
  productionProgress: number;
  upgradeProgress: number;
  isUnlocked: boolean;
}

export const createBuilding = (typeId: string, id?: string): Building => ({
  id: id ?? `${typeId}_${Date.now()}`,
  typeId,
  level: 1,
  assignedBuilders: 0,
  productionProgress: 0,
  upgradeProgress: 0,
  isUnlocked: false,
});

export const calculateUpgradeCost = (
  buildingType: BuildingType,
  currentLevel: number,
): number => {
  return Math.floor(
    buildingType.baseCost * Math.pow(buildingType.costMultiplier, currentLevel - 1),
  );
};

/**
 * Calculate building production/effect.
 * All unlocked buildings provide a passive baseline effect (equivalent to 1 worker).
 * Assigned workers add on top of this baseline.
 *
 * @param buildingType - The building type definition
 * @param level - Current building level
 * @param assignedBuilders - Number of workers assigned
 * @param waveBonus - Wave-based bonus multiplier (default 1)
 * @param prestigeBonus - Prestige bonus multiplier (default 1)
 * @param includePassive - Whether to include passive baseline (default true)
 */
export const calculateProduction = (
  buildingType: BuildingType,
  level: number,
  assignedBuilders: number,
  waveBonus: number = 1,
  prestigeBonus: number = 1,
  includePassive: boolean = true,
): number => {
  const baseOutput = buildingType.baseProduction;
  const levelMultiplier = 1 + (level - 1) * 0.5;

  // Passive baseline = 1 worker equivalent, plus any assigned workers
  const effectiveWorkers = includePassive ? 1 + assignedBuilders : assignedBuilders;

  if (effectiveWorkers === 0) return 0;

  return baseOutput * levelMultiplier * effectiveWorkers * waveBonus * prestigeBonus;
};
