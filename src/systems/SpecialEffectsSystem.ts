import {BuildingState} from '../core/GameState';
import {getEvolvableBuildingById} from '../data/buildings';
import {
  calculateScrapFindCooldown as calculateScrapFindCooldownFormula,
  calculateScrapFindAmount as calculateScrapFindAmountFormula,
  calculateBurstBoostChance as calculateBurstBoostChanceFormula,
  calculateCriticalWeaknessChance as calculateCriticalWeaknessChanceFormula,
  calculateWaveExtendChance as calculateWaveExtendChanceFormula,
  calculateWaveExtendBonus as calculateWaveExtendBonusFormula,
  BURST_BOOST_MAX_TOTAL_CHANCE,
  CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER,
} from '../data/formulas';

export interface ScrapFindResult {
  triggered: boolean;
  amount: number;
  cooldownMs: number;
}

export interface BurstBoostResult {
  bonusChance: number;
}

export interface CriticalWeaknessResult {
  isCritical: boolean;
  damageMultiplier: number;
}

export interface WaveExtendResult {
  triggered: boolean;
  bonusSeconds: number;
}

export class SpecialEffectsSystem {
  calculateScrapFindCooldown(
    level: number,
    assignedBuilders: number,
    _tier: number, // Reserved for future tier-based cooldown adjustments
  ): number {
    // Use centralized formula from src/data/formulas/economy.ts
    return calculateScrapFindCooldownFormula(level, assignedBuilders);
  }

  calculateScrapFindAmount(
    waveReward: number,
    tier: number,
    prestigeProductionBonus: number = 1,
    prestigeWaveRewardBonus: number = 1,
  ): number {
    // Use centralized formula from src/data/formulas/economy.ts
    return calculateScrapFindAmountFormula(
      waveReward,
      tier,
      prestigeProductionBonus,
      prestigeWaveRewardBonus,
    );
  }

  processScrapFind(
    building: BuildingState,
    waveReward: number,
    lastTriggerTime: number,
    currentTime: number,
    prestigeProductionBonus: number = 1,
    prestigeWaveRewardBonus: number = 1,
  ): ScrapFindResult {
    const evolvable = getEvolvableBuildingById(building.typeId);
    if (!evolvable || !building.isUnlocked) {
      return {triggered: false, amount: 0, cooldownMs: 0};
    }

    const tier = building.evolutionTier;
    const cooldownMs = this.calculateScrapFindCooldown(
      building.level,
      building.assignedBuilders,
      tier,
    );

    const timeSinceLastTrigger = currentTime - lastTriggerTime;
    if (timeSinceLastTrigger < cooldownMs) {
      return {triggered: false, amount: 0, cooldownMs};
    }

    const amount = this.calculateScrapFindAmount(
      waveReward,
      tier,
      prestigeProductionBonus,
      prestigeWaveRewardBonus,
    );

    return {triggered: true, amount, cooldownMs};
  }

  calculateBurstBoostChance(
    level: number,
    assignedBuilders: number,
    tier: number,
  ): number {
    // Use centralized formula from src/data/formulas/economy.ts
    return calculateBurstBoostChanceFormula(level, assignedBuilders, tier);
  }

  getBurstBoostFromBuilding(building: BuildingState): BurstBoostResult {
    const evolvable = getEvolvableBuildingById(building.typeId);
    if (!evolvable || !building.isUnlocked) {
      return {bonusChance: 0};
    }

    const tierData = evolvable.tiers[building.evolutionTier - 1];
    if (!tierData?.specialEffect || tierData.specialEffect.type !== 'burst_boost') {
      return {bonusChance: 0};
    }

    const bonusChance = this.calculateBurstBoostChance(
      building.level,
      building.assignedBuilders,
      building.evolutionTier,
    );

    return {bonusChance};
  }

  getTotalBurstBoost(buildings: BuildingState[]): number {
    let totalBonus = 0;

    for (const building of buildings) {
      if (building.typeId === 'training_facility') {
        const result = this.getBurstBoostFromBuilding(building);
        totalBonus += result.bonusChance;
      }
    }

    return Math.min(BURST_BOOST_MAX_TOTAL_CHANCE, totalBonus);
  }

  calculateCriticalWeaknessChance(
    level: number,
    assignedBuilders: number,
    tier: number,
  ): number {
    // Use centralized formula from src/data/formulas/economy.ts
    return calculateCriticalWeaknessChanceFormula(level, assignedBuilders, tier);
  }

  shouldSpawnCriticalWeakness(building: BuildingState): CriticalWeaknessResult {
    const evolvable = getEvolvableBuildingById(building.typeId);
    if (!evolvable || !building.isUnlocked) {
      return {isCritical: false, damageMultiplier: 1};
    }

    const tierData = evolvable.tiers[building.evolutionTier - 1];
    if (!tierData?.specialEffect || tierData.specialEffect.type !== 'critical_weakness') {
      return {isCritical: false, damageMultiplier: 1};
    }

    const chance = this.calculateCriticalWeaknessChance(
      building.level,
      building.assignedBuilders,
      building.evolutionTier,
    );

    const isCritical = Math.random() < chance;

    return {
      isCritical,
      damageMultiplier: isCritical ? CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER : 1,
    };
  }

  getCriticalWeaknessDamageMultiplier(): number {
    return CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER;
  }

  calculateWaveExtendChance(level: number, tier: number): number {
    // Use centralized formula from src/data/formulas/economy.ts
    return calculateWaveExtendChanceFormula(level, tier);
  }

  calculateWaveExtendBonus(baseWaveTime: number): number {
    // Use centralized formula from src/data/formulas/economy.ts
    return calculateWaveExtendBonusFormula(baseWaveTime);
  }

  checkWaveExtension(
    building: BuildingState,
    baseWaveTime: number,
  ): WaveExtendResult {
    const evolvable = getEvolvableBuildingById(building.typeId);
    if (!evolvable || !building.isUnlocked) {
      return {triggered: false, bonusSeconds: 0};
    }

    const tierData = evolvable.tiers[building.evolutionTier - 1];
    if (!tierData?.specialEffect || tierData.specialEffect.type !== 'wave_extend') {
      return {triggered: false, bonusSeconds: 0};
    }

    const chance = this.calculateWaveExtendChance(
      building.level,
      building.evolutionTier,
    );

    const triggered = Math.random() < chance;
    if (!triggered) {
      return {triggered: false, bonusSeconds: 0};
    }

    const bonusSeconds = this.calculateWaveExtendBonus(baseWaveTime);
    return {triggered: true, bonusSeconds};
  }

  checkWaveExtensionFromBuildings(
    buildings: BuildingState[],
    baseWaveTime: number,
  ): WaveExtendResult {
    for (const building of buildings) {
      if (building.typeId === 'shield_generator') {
        const result = this.checkWaveExtension(building, baseWaveTime);
        if (result.triggered) {
          return result;
        }
      }
    }
    return {triggered: false, bonusSeconds: 0};
  }
}
