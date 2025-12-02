import {BuildingState} from '../core/GameState';
import {getEvolvableBuildingById} from '../data/buildings';
import {
  calculateScrapFindCooldown as calculateScrapFindCooldownFormula,
  calculateScrapFindAmount as calculateScrapFindAmountFormula,
  calculateBurstBoostChance as calculateBurstBoostChanceFormula,
  calculateCriticalWeaknessChance as calculateCriticalWeaknessChanceFormula,
  calculateWaveExtendChance as calculateWaveExtendChanceFormula,
  calculateWaveExtendBonus as calculateWaveExtendBonusFormula,
  calculateWeakPointDamageMultiplier,
  BURST_BOOST_MAX_TOTAL_CHANCE,
  CRITICAL_WEAKNESS_MAX_CHANCE,
  CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER,
  WAVE_EXTEND_MAX_CHANCE,
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

    // Special effects require at least 1 worker assigned
    if (building.assignedBuilders < 1) {
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
    prestigeBurstChance: number = 0,
  ): number {
    // Use centralized formula from src/data/formulas/economy.ts
    // Now includes prestige bonus for synergy
    return calculateBurstBoostChanceFormula(level, assignedBuilders, tier, prestigeBurstChance);
  }

  getBurstBoostFromBuilding(building: BuildingState): BurstBoostResult {
    const evolvable = getEvolvableBuildingById(building.typeId);
    if (!evolvable || !building.isUnlocked) {
      return {bonusChance: 0};
    }

    // Special effects require at least 1 worker assigned
    if (building.assignedBuilders < 1) {
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
    prestigeBonus: number = 0,
  ): number {
    // Use centralized formula from src/data/formulas/economy.ts
    // Now includes prestige bonus for synergy with 'critical_eye' upgrade
    return calculateCriticalWeaknessChanceFormula(level, assignedBuilders, tier, prestigeBonus);
  }

  /**
   * Calculate critical weakness damage multiplier.
   * Uses the weak point scanner stats to determine the multiplier.
   */
  calculateCriticalDamageMultiplier(
    scannerTier: number,
    scannerLevel: number,
    assignedBuilders: number,
  ): number {
    return calculateWeakPointDamageMultiplier(scannerTier, scannerLevel, assignedBuilders);
  }

  shouldSpawnCriticalWeakness(
    building: BuildingState,
    prestigeBonus: number = 0,
  ): CriticalWeaknessResult {
    const evolvable = getEvolvableBuildingById(building.typeId);
    if (!evolvable || !building.isUnlocked) {
      return {isCritical: false, damageMultiplier: 1};
    }

    // Special effects require at least 1 worker assigned
    if (building.assignedBuilders < 1) {
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
      prestigeBonus,
    );

    // Apply max chance cap
    const cappedChance = Math.min(CRITICAL_WEAKNESS_MAX_CHANCE, chance);
    const isCritical = Math.random() < cappedChance;

    // Calculate damage multiplier based on building stats
    const damageMultiplier = isCritical
      ? this.calculateCriticalDamageMultiplier(
          building.evolutionTier,
          building.level,
          building.assignedBuilders,
        )
      : 1;

    return {
      isCritical,
      damageMultiplier,
    };
  }

  /**
   * Get the maximum possible critical damage multiplier (capped at 4x).
   */
  getMaxCriticalDamageMultiplier(): number {
    return 4.0; // From WEAK_POINT_MAX_MULTIPLIER
  }

  /**
   * @deprecated Use calculateCriticalDamageMultiplier or getMaxCriticalDamageMultiplier instead.
   * Kept for backward compatibility.
   */
  getCriticalWeaknessDamageMultiplier(): number {
    return CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER;
  }

  calculateWaveExtendChance(
    level: number,
    tier: number,
    assignedWorkers: number = 0,
    prestigeBonus: number = 0,
  ): number {
    // Use centralized formula from src/data/formulas/economy.ts
    // Now includes workers and prestige bonus for synergy with 'time_dilation' upgrade
    return calculateWaveExtendChanceFormula(level, tier, assignedWorkers, prestigeBonus);
  }

  calculateWaveExtendBonus(baseWaveTime: number): number {
    // Use centralized formula from src/data/formulas/economy.ts
    return calculateWaveExtendBonusFormula(baseWaveTime);
  }

  checkWaveExtension(
    building: BuildingState,
    baseWaveTime: number,
    prestigeBonus: number = 0,
  ): WaveExtendResult {
    const evolvable = getEvolvableBuildingById(building.typeId);
    if (!evolvable || !building.isUnlocked) {
      return {triggered: false, bonusSeconds: 0};
    }

    // Special effects require at least 1 worker assigned
    if (building.assignedBuilders < 1) {
      return {triggered: false, bonusSeconds: 0};
    }

    const tierData = evolvable.tiers[building.evolutionTier - 1];
    if (!tierData?.specialEffect || tierData.specialEffect.type !== 'wave_extend') {
      return {triggered: false, bonusSeconds: 0};
    }

    const chance = this.calculateWaveExtendChance(
      building.level,
      building.evolutionTier,
      building.assignedBuilders,
      prestigeBonus,
    );

    // Apply max chance cap
    const cappedChance = Math.min(WAVE_EXTEND_MAX_CHANCE, chance);
    const triggered = Math.random() < cappedChance;
    if (!triggered) {
      return {triggered: false, bonusSeconds: 0};
    }

    const bonusSeconds = this.calculateWaveExtendBonus(baseWaveTime);
    return {triggered: true, bonusSeconds};
  }

  checkWaveExtensionFromBuildings(
    buildings: BuildingState[],
    baseWaveTime: number,
    prestigeBonus: number = 0,
  ): WaveExtendResult {
    for (const building of buildings) {
      if (building.typeId === 'shield_generator') {
        const result = this.checkWaveExtension(building, baseWaveTime, prestigeBonus);
        if (result.triggered) {
          return result;
        }
      }
    }
    return {triggered: false, bonusSeconds: 0};
  }
}
