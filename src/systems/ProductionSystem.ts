import {BuildingState} from '../core/GameState';
import {
  getEvolvableBuildingById,
  toBuildingType,
  EVOLVABLE_BUILDINGS,
} from '../data/buildings';
import {
  calculateWaveBonus,
  calculateCommandCenterBonus,
  calculateBuildingProduction,
  calculateOfflineProduction,
} from '../data/formulas';

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
  tierMultiplier: number;
}

export class ProductionSystem {
  /**
   * Calculate wave-based efficiency bonus for buildings.
   * Uses centralized formula from src/data/formulas/production.ts
   */
  calculateWaveBonus(currentWave: number): number {
    return calculateWaveBonus(currentWave);
  }

  /**
   * Calculate Command Center bonus.
   * This is a static effect that scales with building level (no workers needed).
   */
  calculateCommandCenterBonus(buildings: BuildingState[]): number {
    const commandCenter = buildings.find(b => b.typeId === 'command_center');
    if (!commandCenter || !commandCenter.isUnlocked) return 1;

    const evolvableBuilding = getEvolvableBuildingById('command_center');
    if (!evolvableBuilding) return 1;

    const tier = evolvableBuilding.tiers[commandCenter.evolutionTier - 1];
    if (!tier) return 1;

    // Use centralized formula
    return calculateCommandCenterBonus(tier.baseProduction, commandCenter.level);
  }

  calculateBuildingProduction(
    building: BuildingState,
    bonuses: ProductionBonuses,
  ): number {
    if (!building.isUnlocked) return 0;

    const evolvableBuilding = getEvolvableBuildingById(building.typeId);
    if (!evolvableBuilding) return 0;
    if (evolvableBuilding.role !== 'production') return 0;

    const tier = evolvableBuilding.tiers[building.evolutionTier - 1];
    if (!tier) return 0;

    const buildingType = toBuildingType(evolvableBuilding, tier);

    // Use centralized formula
    const baseProduction = calculateBuildingProduction(
      buildingType.baseProduction,
      building.level,
      building.assignedBuilders,
      bonuses.waveBonus,
      bonuses.prestigeBonus,
    );

    return baseProduction * bonuses.boostMultiplier * bonuses.commandCenterBonus * bonuses.tierMultiplier;
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
  ): number {
    let totalProductionPerSecond = 0;
    for (const building of buildings) {
      totalProductionPerSecond += this.calculateBuildingProduction(building, bonuses);
    }

    // Use centralized formula
    return calculateOfflineProduction(totalProductionPerSecond, offlineSeconds);
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
    return EVOLVABLE_BUILDINGS.map((evolvable, index) => ({
      id: `building_${evolvable.id}_${index}`,
      typeId: evolvable.id,
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: evolvable.tiers[0].unlockWave === 1,
      evolutionTier: 1,
    }));
  }

  unlockBuildingsForWave(buildings: BuildingState[], currentWave: number): string[] {
    const newlyUnlocked: string[] = [];

    for (const building of buildings) {
      if (building.isUnlocked) continue;

      const evolvableBuilding = getEvolvableBuildingById(building.typeId);
      if (evolvableBuilding && evolvableBuilding.tiers[0].unlockWave <= currentWave) {
        building.isUnlocked = true;
        newlyUnlocked.push(building.id);
      }
    }

    return newlyUnlocked;
  }
}
