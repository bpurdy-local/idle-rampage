import {BuildingState, CombatState, EnemyState} from '../core/GameState';
import {getEvolvableBuildingById, toBuildingType} from '../data/buildings';
import {calculateProduction} from '../models/Building';
import {PRESTIGE_UPGRADES} from '../data/prestigeUpgrades';
import {getUpgradeEffect} from '../models/PrestigeUpgrade';
import {eventBus, GameEvents} from '../core/EventBus';
import {SpecialEffectsSystem} from './SpecialEffectsSystem';
import {
  calculateTapDamage as calculateTapDamageFormula,
  checkBurstAttack as checkBurstAttackFormula,
  calculateScrapFromDamage as calculateScrapFromDamageFormula,
  BASE_TAP_DAMAGE,
  DEFAULT_BURST_CHANCE,
  DEFAULT_BURST_MULTIPLIER,
} from '../data/formulas';

export interface CombatBonuses {
  prestigeAutoDamage: number;
  prestigeTapPower: number;
  prestigeBurstChance: number;
  prestigeBurstDamage: number;
  boostMultiplier: number;
  tierMultiplier: number;
}

export interface DamageResult {
  damage: number;
  isBurst: boolean;
  remainingHealth: number;
  isDefeated: boolean;
}

export interface CombatTickResult {
  autoDamage: number;
  burstDamage: number;
  totalDamage: number;
  enemyDefeated: boolean;
  timerExpired: boolean;
  scrapFromDamage: number;
}

// Re-export for backward compatibility
export {DAMAGE_SCRAP_PERCENT} from '../data/formulas';

export class CombatSystem {
  calculateAutoDamage(
    buildings: BuildingState[],
    bonuses: CombatBonuses,
  ): number {
    let totalDamage = 0;

    for (const building of buildings) {
      const evolvableBuilding = getEvolvableBuildingById(building.typeId);
      if (!evolvableBuilding) continue;
      // weak_point_scanner does NOT provide auto damage (it enables weak points for tap damage)
      // training_facility does NOT provide auto damage (it boosts tap damage only)
      // Currently no buildings provide auto-damage - all combat is tap-based
      if (building.typeId === 'weak_point_scanner') continue;
      if (building.typeId === 'training_facility') continue;
      if (evolvableBuilding.role !== 'combat') continue;
      if (!building.isUnlocked) continue;

      // Get the tier based on the building's current evolution tier
      const tier = evolvableBuilding.tiers[building.evolutionTier - 1];
      if (!tier) continue;

      const buildingType = toBuildingType(evolvableBuilding, tier);

      // Buildings provide passive baseline (1 worker equivalent) plus assigned workers
      const baseDamage = calculateProduction(
        buildingType,
        building.level,
        building.assignedBuilders,
      );
      totalDamage += baseDamage;
    }

    return totalDamage * bonuses.prestigeAutoDamage * bonuses.boostMultiplier * bonuses.tierMultiplier;
  }

  calculateTapDamageBonus(buildings: BuildingState[]): number {
    let totalBonus = 0;

    // Only training_facility provides tap damage bonus
    for (const building of buildings) {
      const evolvableBuilding = getEvolvableBuildingById(building.typeId);
      if (!evolvableBuilding) continue;
      // Only training_facility provides tap damage bonus
      if (building.typeId !== 'training_facility') continue;
      if (!building.isUnlocked) continue;

      // Get the tier based on the building's current evolution tier
      const tier = evolvableBuilding.tiers[building.evolutionTier - 1];
      if (!tier) continue;

      const buildingType = toBuildingType(evolvableBuilding, tier);

      // Buildings provide passive baseline (1 worker equivalent) plus assigned workers
      const bonus = calculateProduction(
        buildingType,
        building.level,
        building.assignedBuilders,
      );
      totalBonus += bonus;
    }

    return totalBonus;
  }

  calculateTapDamage(
    baseTapDamage: number,
    bonuses: CombatBonuses,
  ): number {
    // Use centralized formula from src/data/formulas/combat.ts
    return calculateTapDamageFormula(
      baseTapDamage,
      bonuses.prestigeTapPower,
      bonuses.boostMultiplier,
      bonuses.tierMultiplier,
    );
  }

  checkBurstAttack(
    burstChance: number,
    burstMultiplier: number,
    bonuses: CombatBonuses,
    trainingFacilityBoost: number = 0,
  ): {triggered: boolean; multiplier: number} {
    // Use centralized formula from src/data/formulas/combat.ts
    return checkBurstAttackFormula(
      burstChance,
      burstMultiplier,
      bonuses.prestigeBurstChance,
      bonuses.prestigeBurstDamage,
      trainingFacilityBoost,
    );
  }

  /**
   * Calculate scrap earned from dealing damage to an enemy.
   * Uses centralized formula from src/data/formulas/combat.ts
   */
  calculateScrapFromDamage(
    damage: number,
    enemy: EnemyState,
    rewardMultiplier: number = 1,
  ): number {
    return calculateScrapFromDamageFormula(
      damage,
      enemy.maxHealth,
      enemy.reward,
      rewardMultiplier,
    );
  }

  applyDamage(
    enemy: EnemyState,
    damage: number,
    isBurst: boolean = false,
  ): DamageResult {
    const newHealth = Math.max(0, enemy.currentHealth - damage);
    enemy.currentHealth = newHealth;

    const result: DamageResult = {
      damage,
      isBurst,
      remainingHealth: newHealth,
      isDefeated: newHealth <= 0,
    };

    eventBus.emit(GameEvents.ENEMY_DAMAGED, result);
    if (result.isDefeated) {
      eventBus.emit(GameEvents.ENEMY_DEFEATED, {enemy, reward: enemy.reward});
    }

    return result;
  }

  processTap(
    enemy: EnemyState | null,
    baseTapDamage: number,
    combat: CombatState,
    bonuses: CombatBonuses,
  ): DamageResult | null {
    if (!enemy) return null;

    const tapDamage = this.calculateTapDamage(baseTapDamage, bonuses);
    const burst = this.checkBurstAttack(
      combat.burstChance,
      combat.burstMultiplier,
      bonuses,
    );
    const totalDamage = Math.floor(tapDamage * burst.multiplier);

    eventBus.emit(GameEvents.TAP_REGISTERED, {
      damage: totalDamage,
      isBurst: burst.triggered,
    });

    if (burst.triggered) {
      eventBus.emit(GameEvents.BURST_ATTACK, {
        damage: totalDamage,
        multiplier: burst.multiplier,
      });
    }

    return this.applyDamage(enemy, totalDamage, burst.triggered);
  }

  tick(
    enemy: EnemyState | null,
    buildings: BuildingState[],
    combat: CombatState,
    bonuses: CombatBonuses,
    deltaTime: number,
    rewardMultiplier: number = 1,
  ): CombatTickResult {
    const result: CombatTickResult = {
      autoDamage: 0,
      burstDamage: 0,
      totalDamage: 0,
      enemyDefeated: false,
      timerExpired: false,
      scrapFromDamage: 0,
    };

    if (!enemy || !combat.isActive) {
      return result;
    }

    // Check if enemy is already defeated
    if (enemy.currentHealth <= 0) {
      result.enemyDefeated = true;
      return result;
    }

    // Check if timer expired (timer is updated externally via store)
    if (combat.waveTimer <= 0) {
      result.timerExpired = true;
      eventBus.emit(GameEvents.WAVE_FAILED, {wave: enemy.wave});
      return result;
    }

    const damagePerSecond = this.calculateAutoDamage(buildings, bonuses);
    const tickDamage = (damagePerSecond * deltaTime) / 1000;

    const specialEffectsSystem = new SpecialEffectsSystem();
    const trainingFacilityBoost = specialEffectsSystem.getTotalBurstBoost(buildings);

    const burst = this.checkBurstAttack(
      combat.burstChance,
      combat.burstMultiplier,
      bonuses,
      trainingFacilityBoost,
    );

    const totalDamage = Math.floor(tickDamage * burst.multiplier);
    result.autoDamage = Math.floor(tickDamage);
    result.burstDamage = burst.triggered ? totalDamage - result.autoDamage : 0;
    result.totalDamage = totalDamage;

    if (totalDamage > 0) {
      // Calculate scrap earned from this damage
      result.scrapFromDamage = this.calculateScrapFromDamage(totalDamage, enemy, rewardMultiplier);

      const damageResult = this.applyDamage(enemy, totalDamage, burst.triggered);
      result.enemyDefeated = damageResult.isDefeated;
    }

    return result;
  }

  getPrestigeBonuses(
    prestigeUpgradeLevels: Map<string, number>,
  ): CombatBonuses {
    const getBonusForType = (effectType: string): number => {
      const upgrade = PRESTIGE_UPGRADES.find(u => u.effectType === effectType);
      if (!upgrade) return 1;
      const level = prestigeUpgradeLevels.get(upgrade.id) ?? 0;
      return getUpgradeEffect(upgrade, level);
    };

    // For burst_chance: getUpgradeEffect returns 1 at level 0, or (0.05 + 0.01*level) at level 1+
    // We need 0 bonus at level 0, and the effect value minus baseline (1) at level 1+
    const burstChanceEffect = getBonusForType('burst_chance');
    // At level 0, effect is 1 (baseline) -> bonus should be 0
    // At level 1+, effect is 0.05 + 0.01*level -> we want this as the bonus
    const prestigeBurstChance = burstChanceEffect === 1 ? 0 : burstChanceEffect;

    // For burst_damage: getUpgradeEffect returns 1 at level 0, or (5.0 + 1.0*level) at level 1+
    // This is used as a multiplier, so level 0 = 1x, level 1 = 6x, etc.
    const prestigeBurstDamage = getBonusForType('burst_damage');

    return {
      prestigeAutoDamage: getBonusForType('auto_damage'),
      prestigeTapPower: getBonusForType('tap_power'),
      prestigeBurstChance,
      prestigeBurstDamage,
      boostMultiplier: 1,
      tierMultiplier: 1,
    };
  }

  createInitialCombatState(): CombatState {
    return {
      isActive: false,
      currentEnemy: null,
      waveTimer: 30,
      waveTimerMax: 30,
      autoDamagePerTick: 1,
      burstChance: DEFAULT_BURST_CHANCE,
      burstMultiplier: DEFAULT_BURST_MULTIPLIER,
      baseTapDamage: BASE_TAP_DAMAGE,
    };
  }
}
