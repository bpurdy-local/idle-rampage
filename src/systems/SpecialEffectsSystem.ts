import {BuildingState} from '../core/GameState';
import {getEvolvableBuildingById} from '../data/buildings';
import {SPECIAL_EFFECT_CONFIG} from '../data/specialEffectConfig';

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
    const config = SPECIAL_EFFECT_CONFIG.scrapFind;
    const levelReduction = (level - 1) * config.cooldownPerLevelMs;
    const workerReduction = assignedBuilders * config.cooldownPerWorkerMs;
    const cooldown = config.baseCooldownMs - levelReduction - workerReduction;
    return Math.max(config.minCooldownMs, cooldown);
  }

  calculateScrapFindAmount(
    waveReward: number,
    tier: number,
    prestigeProductionBonus: number = 1,
    prestigeWaveRewardBonus: number = 1,
  ): number {
    const config = SPECIAL_EFFECT_CONFIG.scrapFind;
    const tierMultiplier = config.tierMultipliers[tier - 1] ?? 1.0;
    const baseAmount = waveReward * config.baseRewardPercent;
    return Math.floor(baseAmount * tierMultiplier * prestigeProductionBonus * prestigeWaveRewardBonus);
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
    const config = SPECIAL_EFFECT_CONFIG.burstBoost;
    const levelBonus = (level - 1) * config.chancePerLevel;
    const workerBonus = assignedBuilders * config.chancePerWorker;
    const tierBonus = (tier - 1) * config.chancePerTier;
    return config.baseChance + levelBonus + workerBonus + tierBonus;
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
    const config = SPECIAL_EFFECT_CONFIG.burstBoost;
    let totalBonus = 0;

    for (const building of buildings) {
      if (building.typeId === 'training_facility') {
        const result = this.getBurstBoostFromBuilding(building);
        totalBonus += result.bonusChance;
      }
    }

    return Math.min(config.maxTotalChance, totalBonus);
  }

  calculateCriticalWeaknessChance(
    level: number,
    assignedBuilders: number,
    tier: number,
  ): number {
    const config = SPECIAL_EFFECT_CONFIG.criticalWeakness;
    const levelBonus = (level - 1) * config.chancePerLevel;
    const workerBonus = assignedBuilders * config.chancePerWorker;
    const tierBonus = (tier - 1) * config.chancePerTier;
    return config.baseChance + levelBonus + workerBonus + tierBonus;
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
    const config = SPECIAL_EFFECT_CONFIG.criticalWeakness;

    return {
      isCritical,
      damageMultiplier: isCritical ? config.damageMultiplier : 1,
    };
  }

  getCriticalWeaknessDamageMultiplier(): number {
    return SPECIAL_EFFECT_CONFIG.criticalWeakness.damageMultiplier;
  }

  calculateWaveExtendChance(level: number, tier: number): number {
    const config = SPECIAL_EFFECT_CONFIG.waveExtend;
    const levelBonus = (level - 1) * config.chancePerLevel;
    const tierBonus = (tier - 1) * config.chancePerTier;
    return config.baseChance + levelBonus + tierBonus;
  }

  calculateWaveExtendBonus(baseWaveTime: number): number {
    const config = SPECIAL_EFFECT_CONFIG.waveExtend;
    const bonusTime = baseWaveTime * config.bonusTimePercent;
    return Math.min(config.maxBonusSeconds, bonusTime);
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
