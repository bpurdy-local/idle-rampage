export type PrestigeEffectType =
  | 'production_multiplier'
  | 'tap_power'
  | 'auto_damage'
  | 'building_speed'
  | 'wave_rewards'
  | 'burst_chance'
  | 'burst_damage'
  | 'starting_scrap';

export interface PrestigeUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  effectType: PrestigeEffectType;
  baseCost: number;
  costMultiplier: number;
  baseEffect: number;
  effectPerLevel: number;
  maxLevel: number;
  iconName: string;
}

export interface PrestigeUpgrade {
  id: string;
  level: number;
}

export const createPrestigeUpgrade = (definitionId: string): PrestigeUpgrade => ({
  id: definitionId,
  level: 0,
});

export const getUpgradeCost = (
  definition: PrestigeUpgradeDefinition,
  currentLevel: number,
): number => {
  return Math.floor(
    definition.baseCost * Math.pow(definition.costMultiplier, currentLevel),
  );
};

export const getUpgradeEffect = (
  definition: PrestigeUpgradeDefinition,
  currentLevel: number,
): number => {
  if (currentLevel === 0) return 1;
  return definition.baseEffect + definition.effectPerLevel * currentLevel;
};

export const canUpgrade = (
  definition: PrestigeUpgradeDefinition,
  currentLevel: number,
  availableBlueprints: number,
): boolean => {
  if (currentLevel >= definition.maxLevel) return false;
  return availableBlueprints >= getUpgradeCost(definition, currentLevel);
};
