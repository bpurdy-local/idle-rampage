import {CombatState, EnemyState} from '../core/GameState';
import {getEnemyTierForWave} from '../data/enemies';
import {createEnemy, Enemy} from '../models/Enemy';
import {PRESTIGE_UPGRADES} from '../data/prestigeUpgrades';
import {getUpgradeEffect} from '../models/PrestigeUpgrade';
import {eventBus, GameEvents} from '../core/EventBus';

export interface WaveReward {
  scrap: number;
  bonusScrap: number;
  totalScrap: number;
}

export interface WaveConfig {
  baseTimerSeconds: number;
  timerBonusPerWave: number;
  maxTimerSeconds: number;
}

export class WaveManager {
  private config: WaveConfig;

  constructor(config?: Partial<WaveConfig>) {
    this.config = {
      baseTimerSeconds: 30,
      timerBonusPerWave: 0.1,
      maxTimerSeconds: 60,
      ...config,
    };
  }

  spawnEnemyForWave(wave: number): Enemy {
    const tier = getEnemyTierForWave(wave);
    return createEnemy(tier, wave);
  }

  calculateWaveTimer(wave: number): number {
    const timer = this.config.baseTimerSeconds + wave * this.config.timerBonusPerWave;
    return Math.min(timer, this.config.maxTimerSeconds);
  }

  calculateWaveReward(
    wave: number,
    enemyReward: number,
    prestigeRewardBonus: number = 1,
    boostMultiplier: number = 1,
  ): WaveReward {
    const baseScrap = enemyReward;

    // Wave completion bonus: very generous scaling with wave number
    // Base bonus of 500x wave number plus strong exponential scaling
    const waveBonus = Math.floor(wave * 500 + Math.pow(wave, 2.2));

    // Additional wave completion multiplier (50% per 10 waves, capped at 10x)
    const waveMultiplier = Math.min(10, 1 + Math.floor(wave / 10) * 0.5);

    const bonusScrap = Math.floor(
      waveBonus * waveMultiplier * prestigeRewardBonus * boostMultiplier,
    );
    const totalScrap = Math.floor(
      (baseScrap + bonusScrap) * waveMultiplier * prestigeRewardBonus * boostMultiplier,
    );

    return {
      scrap: baseScrap,
      bonusScrap,
      totalScrap,
    };
  }

  calculateProductionBonus(wave: number): number {
    return 1 + Math.log10(wave + 1) * 0.5;
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
  ): {enemy: EnemyState; timer: number} {
    const enemy = this.spawnEnemyForWave(wave);
    const timer = this.calculateWaveTimer(wave);

    combat.currentEnemy = enemy;
    combat.waveTimer = timer;
    combat.waveTimerMax = timer;
    combat.isActive = true;

    return {enemy, timer};
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

  getWaveDifficulty(wave: number): string {
    if (wave <= 10) return 'Easy';
    if (wave <= 25) return 'Normal';
    if (wave <= 50) return 'Hard';
    if (wave <= 100) return 'Expert';
    return 'Insane';
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
