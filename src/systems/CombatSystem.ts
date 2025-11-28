import {BuildingState, CombatState, EnemyState} from '../core/GameState';
import {getBuildingTypeById} from '../data/buildings';
import {calculateProduction} from '../models/Building';
import {PRESTIGE_UPGRADES} from '../data/prestigeUpgrades';
import {getUpgradeEffect} from '../models/PrestigeUpgrade';
import {eventBus, GameEvents} from '../core/EventBus';

export interface CombatBonuses {
  prestigeAutoDamage: number;
  prestigeTapPower: number;
  prestigeBurstChance: number;
  prestigeBurstDamage: number;
  boostMultiplier: number;
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
}

export class CombatSystem {
  calculateAutoDamage(
    buildings: BuildingState[],
    bonuses: CombatBonuses,
  ): number {
    let totalDamage = 0;

    for (const building of buildings) {
      const buildingType = getBuildingTypeById(building.typeId);
      if (!buildingType) continue;

      if (buildingType.role !== 'combat') continue;
      if (!building.isUnlocked || building.assignedBuilders === 0) continue;

      const baseDamage = calculateProduction(
        buildingType,
        building.level,
        building.assignedBuilders,
      );
      totalDamage += baseDamage;
    }

    return totalDamage * bonuses.prestigeAutoDamage * bonuses.boostMultiplier;
  }

  calculateTapDamage(
    baseTapDamage: number,
    bonuses: CombatBonuses,
  ): number {
    const randomVariance = 0.8 + Math.random() * 0.4;
    return Math.floor(
      baseTapDamage * bonuses.prestigeTapPower * bonuses.boostMultiplier * randomVariance,
    );
  }

  checkBurstAttack(
    burstChance: number,
    burstMultiplier: number,
    bonuses: CombatBonuses,
  ): {triggered: boolean; multiplier: number} {
    const effectiveChance = burstChance + bonuses.prestigeBurstChance;
    const triggered = Math.random() < effectiveChance;
    const multiplier = triggered
      ? burstMultiplier * bonuses.prestigeBurstDamage
      : 1;

    return {triggered, multiplier};
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
  ): CombatTickResult {
    const result: CombatTickResult = {
      autoDamage: 0,
      burstDamage: 0,
      totalDamage: 0,
      enemyDefeated: false,
      timerExpired: false,
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

    const burst = this.checkBurstAttack(
      combat.burstChance,
      combat.burstMultiplier,
      bonuses,
    );

    const totalDamage = Math.floor(tickDamage * burst.multiplier);
    result.autoDamage = Math.floor(tickDamage);
    result.burstDamage = burst.triggered ? totalDamage - result.autoDamage : 0;
    result.totalDamage = totalDamage;

    if (totalDamage > 0) {
      const damageResult = this.applyDamage(enemy, totalDamage, burst.triggered);
      result.enemyDefeated = damageResult.isDefeated;
    }

    return result;
  }

  getPrestigeBonuses(prestigeUpgradeLevels: Map<string, number>): CombatBonuses {
    const getBonusForType = (effectType: string): number => {
      const upgrade = PRESTIGE_UPGRADES.find(u => u.effectType === effectType);
      if (!upgrade) return 1;
      const level = prestigeUpgradeLevels.get(upgrade.id) ?? 0;
      return getUpgradeEffect(upgrade, level);
    };

    return {
      prestigeAutoDamage: getBonusForType('auto_damage'),
      prestigeTapPower: getBonusForType('tap_power'),
      prestigeBurstChance: getBonusForType('burst_chance') - 0.05,
      prestigeBurstDamage: getBonusForType('burst_damage') / 5,
      boostMultiplier: 1,
    };
  }

  createInitialCombatState(): CombatState {
    return {
      isActive: false,
      currentEnemy: null,
      waveTimer: 30,
      waveTimerMax: 30,
      autoDamagePerTick: 1,
      burstChance: 0.05,
      burstMultiplier: 5,
    };
  }
}
