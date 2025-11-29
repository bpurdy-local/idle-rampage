import {calculateWorkerEfficiency} from '../systems/WorkerEfficiency';

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
 * BuildingType represents a building at a specific evolution tier.
 * Created from EvolvableBuilding + BuildingEvolutionTier via toBuildingType().
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
 * Calculate building production/effect with diminishing worker efficiency.
 *
 * Workers have diminishing returns - the more you assign, the less efficient each one is.
 * This encourages spreading workers across buildings rather than concentrating on one.
 *
 * Features:
 * - Passive baseline: All buildings provide 1 effective worker equivalent
 * - Diminishing returns: Each additional worker is less efficient
 * - Milestone bonuses: Bonuses at 5, 10, 20 workers to create breakpoints
 *
 * @param buildingType - The building type definition
 * @param level - Current building level
 * @param assignedBuilders - Number of workers assigned
 * @param waveBonus - Wave-based bonus multiplier (default 1)
 * @param prestigeBonus - Prestige bonus multiplier (default 1)
 * @param includePassive - Whether to include passive baseline (default true)
 * @param synergyBonus - Additional multiplier from synergies (default 0, additive)
 */
export const calculateProduction = (
  buildingType: BuildingType,
  level: number,
  assignedBuilders: number,
  waveBonus: number = 1,
  prestigeBonus: number = 1,
  includePassive: boolean = true,
  synergyBonus: number = 0,
): number => {
  const baseOutput = buildingType.baseProduction;
  // Improved level scaling: +75% per level (was +50%)
  const levelMultiplier = 1 + (level - 1) * 0.75;

  // Calculate effective workers with diminishing returns and milestone bonuses
  const efficiency = calculateWorkerEfficiency(assignedBuilders, includePassive);
  const effectiveWorkers = efficiency.effectiveWorkers;

  if (effectiveWorkers === 0) return 0;

  // Apply synergy bonus as additive multiplier
  const synergyMultiplier = 1 + synergyBonus;

  return baseOutput * levelMultiplier * effectiveWorkers * waveBonus * prestigeBonus * synergyMultiplier;
};

/**
 * Get detailed production breakdown for UI display.
 */
export const getProductionBreakdown = (
  buildingType: BuildingType,
  level: number,
  assignedBuilders: number,
  waveBonus: number = 1,
  prestigeBonus: number = 1,
  synergyBonus: number = 0,
): {
  baseProduction: number;
  levelMultiplier: number;
  effectiveWorkers: number;
  workerEfficiency: number;
  milestoneBonus: number;
  waveBonus: number;
  prestigeBonus: number;
  synergyBonus: number;
  totalProduction: number;
} => {
  const baseOutput = buildingType.baseProduction;
  const levelMultiplier = 1 + (level - 1) * 0.75;
  const efficiency = calculateWorkerEfficiency(assignedBuilders, true);

  return {
    baseProduction: baseOutput,
    levelMultiplier,
    effectiveWorkers: efficiency.effectiveWorkers,
    workerEfficiency: efficiency.averageEfficiency,
    milestoneBonus: efficiency.milestoneBonus,
    waveBonus,
    prestigeBonus,
    synergyBonus,
    totalProduction: calculateProduction(
      buildingType,
      level,
      assignedBuilders,
      waveBonus,
      prestigeBonus,
      true,
      synergyBonus,
    ),
  };
};
