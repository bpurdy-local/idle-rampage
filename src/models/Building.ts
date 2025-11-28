export type BuildingRole = 'production' | 'combat' | 'research' | 'utility';

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

export const calculateProduction = (
  buildingType: BuildingType,
  level: number,
  assignedBuilders: number,
  waveBonus: number = 1,
  prestigeBonus: number = 1,
): number => {
  if (assignedBuilders === 0) return 0;

  const baseOutput = buildingType.baseProduction;
  const levelMultiplier = 1 + (level - 1) * 0.5;
  const builderMultiplier = assignedBuilders;

  return baseOutput * levelMultiplier * builderMultiplier * waveBonus * prestigeBonus;
};
