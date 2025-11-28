import {BuildingState} from '../core/GameState';
import {getBuildingTypeById, BUILDING_TYPES} from '../data/buildings';
import {calculateProduction} from '../models/Building';
import {PRESTIGE_UPGRADES} from '../data/prestigeUpgrades';
import {getUpgradeEffect} from '../models/PrestigeUpgrade';

export interface ProductionResult {
  buildingId: string;
  production: number;
  newProgress: number;
}

export interface ProductionTickResult {
  totalProduction: number;
  buildingResults: ProductionResult[];
}

export interface ProductionBonuses {
  waveBonus: number;
  prestigeBonus: number;
  boostMultiplier: number;
  commandCenterBonus: number;
}

export class ProductionSystem {
  calculateWaveBonus(currentWave: number): number {
    return 1 + Math.log10(currentWave + 1) * 0.5;
  }

  calculatePrestigeBonus(prestigeUpgradeLevels: Map<string, number>): number {
    const productionUpgrade = PRESTIGE_UPGRADES.find(
      u => u.effectType === 'production_multiplier',
    );
    if (!productionUpgrade) return 1;

    const level = prestigeUpgradeLevels.get(productionUpgrade.id) ?? 0;
    return getUpgradeEffect(productionUpgrade, level);
  }

  calculateCommandCenterBonus(buildings: BuildingState[]): number {
    const commandCenter = buildings.find(b => b.typeId === 'command_center');
    if (!commandCenter || commandCenter.assignedBuilders === 0) return 1;

    const buildingType = getBuildingTypeById('command_center');
    if (!buildingType) return 1;

    const baseBonus = calculateProduction(
      buildingType,
      commandCenter.level,
      commandCenter.assignedBuilders,
    );
    return 1 + baseBonus;
  }

  calculateBuildingProduction(
    building: BuildingState,
    bonuses: ProductionBonuses,
  ): number {
    const buildingType = getBuildingTypeById(building.typeId);
    if (!buildingType) return 0;

    if (building.assignedBuilders === 0) return 0;
    if (!building.isUnlocked) return 0;

    if (buildingType.role !== 'production') return 0;

    const baseProduction = calculateProduction(
      buildingType,
      building.level,
      building.assignedBuilders,
      bonuses.waveBonus,
      bonuses.prestigeBonus,
    );

    return baseProduction * bonuses.boostMultiplier * bonuses.commandCenterBonus;
  }

  tick(
    buildings: BuildingState[],
    bonuses: ProductionBonuses,
    deltaTime: number,
  ): ProductionTickResult {
    const results: ProductionResult[] = [];
    let totalProduction = 0;

    const productionPerSecond = 1000;
    const tickMultiplier = deltaTime / productionPerSecond;

    for (const building of buildings) {
      const production = this.calculateBuildingProduction(building, bonuses);
      const tickProduction = production * tickMultiplier;

      if (tickProduction > 0) {
        building.productionProgress += tickProduction;
        const produced = Math.floor(building.productionProgress);
        building.productionProgress -= produced;

        if (produced > 0) {
          totalProduction += produced;
          results.push({
            buildingId: building.id,
            production: produced,
            newProgress: building.productionProgress,
          });
        }
      }
    }

    return {
      totalProduction,
      buildingResults: results,
    };
  }

  calculateOfflineProduction(
    buildings: BuildingState[],
    bonuses: ProductionBonuses,
    offlineSeconds: number,
    maxOfflineHours: number = 8,
  ): number {
    const maxOfflineSeconds = maxOfflineHours * 3600;
    const cappedSeconds = Math.min(offlineSeconds, maxOfflineSeconds);

    let totalProductionPerSecond = 0;
    for (const building of buildings) {
      totalProductionPerSecond += this.calculateBuildingProduction(building, bonuses);
    }

    const offlineEfficiency = 0.5;
    return Math.floor(totalProductionPerSecond * cappedSeconds * offlineEfficiency);
  }

  getProductionBreakdown(
    buildings: BuildingState[],
    bonuses: ProductionBonuses,
  ): Map<string, number> {
    const breakdown = new Map<string, number>();

    for (const building of buildings) {
      const production = this.calculateBuildingProduction(building, bonuses);
      if (production > 0) {
        breakdown.set(building.id, production);
      }
    }

    return breakdown;
  }

  getTotalProductionPerSecond(
    buildings: BuildingState[],
    bonuses: ProductionBonuses,
  ): number {
    let total = 0;
    for (const building of buildings) {
      total += this.calculateBuildingProduction(building, bonuses);
    }
    return total;
  }

  initializeBuildings(): BuildingState[] {
    return BUILDING_TYPES.map((type, index) => ({
      id: `building_${type.id}_${index}`,
      typeId: type.id,
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: type.unlockWave === 1,
    }));
  }

  unlockBuildingsForWave(buildings: BuildingState[], currentWave: number): string[] {
    const newlyUnlocked: string[] = [];

    for (const building of buildings) {
      if (building.isUnlocked) continue;

      const buildingType = getBuildingTypeById(building.typeId);
      if (buildingType && buildingType.unlockWave <= currentWave) {
        building.isUnlocked = true;
        newlyUnlocked.push(building.id);
      }
    }

    return newlyUnlocked;
  }
}
