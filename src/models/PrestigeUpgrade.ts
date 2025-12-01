export type PrestigeEffectType =
  | 'production_multiplier'
  | 'tap_power'
  | 'auto_damage'
  | 'wave_rewards'
  | 'burst_chance'
  | 'burst_damage'
  | 'starting_scrap'
  | 'critical_chance'
  | 'wave_extend_chance'
  | 'scrap_find_bonus';

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
