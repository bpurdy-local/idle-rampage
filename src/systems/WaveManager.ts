import {BuildingState, CombatState, EnemyState} from '../core/GameState';
import {
  getEnemyTierForWave,
  BOSS_CONFIG,
  isFinalBossWave,
  getFinalBossForWave,
  FinalBoss,
} from '../data/enemies';
import {createEnemy, Enemy} from '../models/Enemy';
import {PRESTIGE_UPGRADES} from '../data/prestigeUpgrades';
import {getUpgradeEffect} from '../models/PrestigeUpgrade';
import {eventBus, GameEvents} from '../core/EventBus';
import {SpecialEffectsSystem} from './SpecialEffectsSystem';
import {
  calculateWaveTimer as calculateWaveTimerFormula,
  calculateBossWaveTimer,
  calculateWaveReward as calculateWaveRewardFormula,
  isBossWave as isBossWaveFormula,
  getWavesUntilBoss as getWavesUntilBossFormula,
  getWaveDifficulty as getWaveDifficultyFormula,
} from '../data/formulas';

export interface WaveReward {
  scrap: number;
  bonusScrap: number;
  totalScrap: number;
}

export interface FinalBossDrop {
  type: 'boost' | 'blueprints';
  multiplier?: number;
  duration?: number;
  amount?: number;
}

export class WaveManager {
  isBossWave(wave: number): boolean {
    // Use centralized formula from src/data/formulas/progression.ts
    return isBossWaveFormula(wave);
  }

  isFinalBoss(wave: number): boolean {
    return isFinalBossWave(wave);
  }

  getFinalBoss(wave: number): FinalBoss | undefined {
    return getFinalBossForWave(wave);
  }

  getWavesUntilBoss(wave: number): number {
    // Use centralized formula from src/data/formulas/progression.ts
    return getWavesUntilBossFormula(wave);
  }

  spawnEnemyForWave(wave: number): Enemy {
    const finalBoss = getFinalBossForWave(wave);
    if (finalBoss) {
      return {
        id: `enemy_${wave}_${Date.now()}_final`,
        tierId: finalBoss.id,
        name: finalBoss.name,
        currentHealth: finalBoss.health,
        maxHealth: finalBoss.health,
        reward: finalBoss.reward,
        wave,
        isBoss: true,
      };
    }

    const tier = getEnemyTierForWave(wave);
    const baseEnemy = createEnemy(tier, wave);

    if (this.isBossWave(wave)) {
      return {
        ...baseEnemy,
        name: `${tier.name} Alpha`,
        maxHealth: Math.floor(baseEnemy.maxHealth * BOSS_CONFIG.healthMultiplier),
        currentHealth: Math.floor(baseEnemy.maxHealth * BOSS_CONFIG.healthMultiplier),
        reward: Math.floor(baseEnemy.reward * BOSS_CONFIG.rewardMultiplier),
        isBoss: true,
      };
    }

    return baseEnemy;
  }

  calculateWaveTimer(wave: number): number {
    const finalBoss = getFinalBossForWave(wave);
    if (finalBoss) {
      return finalBoss.timerSeconds;
    }

    // Use centralized formula from src/data/formulas/progression.ts
    const timer = calculateWaveTimerFormula(wave);

    if (this.isBossWave(wave)) {
      return calculateBossWaveTimer(timer);
    }

    return timer;
  }

  calculateWaveReward(
    wave: number,
    enemyReward: number,
    prestigeRewardBonus: number = 1,
    boostMultiplier: number = 1,
  ): WaveReward {
    // Use centralized formula from src/data/formulas/progression.ts
    const result = calculateWaveRewardFormula(
      enemyReward,
      wave,
      prestigeRewardBonus,
      boostMultiplier,
    );

    return {
      scrap: result.baseScrap,
      bonusScrap: result.bonusScrap,
      totalScrap: result.totalScrap,
    };
  }

  getPrestigeRewardBonus(prestigeUpgradeLevels: Map<string, number>): number {
    const rewardUpgrade = PRESTIGE_UPGRADES.find(u => u.effectType === 'wave_rewards');
    if (!rewardUpgrade) return 1;

    const level = prestigeUpgradeLevels.get(rewardUpgrade.id) ?? 0;
    return getUpgradeEffect(rewardUpgrade, level);
  }

  startWave(
    wave: number,
    combat: CombatState,
    buildings?: BuildingState[],
  ): {enemy: EnemyState; timer: number; waveExtended: boolean; bonusSeconds: number} {
    const enemy = this.spawnEnemyForWave(wave);
    let timer = this.calculateWaveTimer(wave);
    let waveExtended = false;
    let bonusSeconds = 0;

    if (buildings) {
      const specialEffectsSystem = new SpecialEffectsSystem();
      const extensionResult = specialEffectsSystem.checkWaveExtensionFromBuildings(buildings, timer);
      if (extensionResult.triggered) {
        bonusSeconds = extensionResult.bonusSeconds;
        timer += bonusSeconds;
        waveExtended = true;
        eventBus.emit(GameEvents.WAVE_EXTENDED, {
          wave,
          bonusSeconds,
          newTimer: timer,
        });
      }
    }

    combat.currentEnemy = enemy;
    combat.waveTimer = timer;
    combat.waveTimerMax = timer;
    combat.isActive = true;

    return {enemy, timer, waveExtended, bonusSeconds};
  }

  completeWave(
    wave: number,
    enemy: EnemyState,
    prestigeRewardBonus: number,
    boostMultiplier: number,
  ): WaveReward {
    const reward = this.calculateWaveReward(
      wave,
      enemy.reward,
      prestigeRewardBonus,
      boostMultiplier,
    );

    eventBus.emit(GameEvents.WAVE_CLEARED, {
      wave,
      reward: reward.totalScrap,
    });

    return reward;
  }

  failWave(wave: number, combat: CombatState): void {
    combat.isActive = false;
    combat.currentEnemy = null;

    eventBus.emit(GameEvents.WAVE_FAILED, {wave});
  }

  getFinalBossDrop(wave: number): FinalBossDrop | null {
    const finalBoss = getFinalBossForWave(wave);
    if (!finalBoss) return null;

    return {
      type: finalBoss.guaranteedDrop.type,
      multiplier: finalBoss.guaranteedDrop.multiplier,
      duration: finalBoss.guaranteedDrop.duration,
      amount: finalBoss.guaranteedDrop.amount,
    };
  }

  getWaveDifficulty(wave: number): string {
    // Use centralized formula from src/data/formulas/progression.ts
    return getWaveDifficultyFormula(wave);
  }

  getWaveProgress(wave: number): {tier: string; progress: number} {
    const tier = getEnemyTierForWave(wave);
    const waveInTier = wave - tier.minWave;
    const tierLength = tier.maxWave - tier.minWave + 1;
    const progress = Math.min(100, (waveInTier / tierLength) * 100);

    return {
      tier: tier.name,
      progress,
    };
  }

  estimateWaveTime(
    wave: number,
    autoDamagePerSecond: number,
  ): number {
    const tier = getEnemyTierForWave(wave);
    const enemy = createEnemy(tier, wave);

    if (autoDamagePerSecond <= 0) return Infinity;

    return enemy.maxHealth / autoDamagePerSecond;
  }

  canDefeatWaveInTime(
    wave: number,
    autoDamagePerSecond: number,
    tapDamagePerSecond: number = 0,
  ): boolean {
    const timer = this.calculateWaveTimer(wave);
    const estimatedTime = this.estimateWaveTime(
      wave,
      autoDamagePerSecond + tapDamagePerSecond,
    );

    return estimatedTime < timer;
  }
}
