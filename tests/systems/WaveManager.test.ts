import {WaveManager} from '../../src/systems/WaveManager';
import {CombatState} from '../../src/core/GameState';

const createMockCombatState = (): CombatState => ({
  isActive: false,
  currentEnemy: null,
  waveTimer: 0,
  waveTimerMax: 30,
  autoDamagePerTick: 1,
  burstChance: 0.05,
  burstMultiplier: 5,
});

describe('WaveManager', () => {
  let manager: WaveManager;

  beforeEach(() => {
    manager = new WaveManager();
  });

  describe('spawnEnemyForWave', () => {
    it('creates enemy for wave 1', () => {
      const enemy = manager.spawnEnemyForWave(1);
      expect(enemy).toBeDefined();
      expect(enemy.wave).toBe(1);
      expect(enemy.tierId).toBe('scrap_bot');
    });

    it('creates appropriate tier enemy for higher waves', () => {
      const enemy15 = manager.spawnEnemyForWave(15);
      expect(enemy15.tierId).toBe('drone');

      const enemy75 = manager.spawnEnemyForWave(75);
      expect(enemy75.tierId).toBe('mech');
    });

    it('increases enemy health with wave', () => {
      const enemy1 = manager.spawnEnemyForWave(1);
      const enemy5 = manager.spawnEnemyForWave(5);
      expect(enemy5.maxHealth).toBeGreaterThan(enemy1.maxHealth);
    });

    it('increases rewards with wave', () => {
      const enemy1 = manager.spawnEnemyForWave(1);
      const enemy5 = manager.spawnEnemyForWave(5);
      expect(enemy5.reward).toBeGreaterThan(enemy1.reward);
    });
  });

  describe('calculateWaveTimer', () => {
    it('returns base timer for wave 1', () => {
      const timer = manager.calculateWaveTimer(1);
      expect(timer).toBeGreaterThanOrEqual(30);
    });

    it('increases timer with wave', () => {
      const timer1 = manager.calculateWaveTimer(1);
      const timer50 = manager.calculateWaveTimer(50);
      expect(timer50).toBeGreaterThan(timer1);
    });

    it('caps at max timer', () => {
      const timer = manager.calculateWaveTimer(1000);
      expect(timer).toBeLessThanOrEqual(60);
    });
  });

  describe('calculateWaveReward', () => {
    it('returns enemy reward as base', () => {
      const reward = manager.calculateWaveReward(1, 10);
      expect(reward.scrap).toBe(10);
    });

    it('includes wave bonus', () => {
      const reward = manager.calculateWaveReward(10, 10);
      expect(reward.totalScrap).toBeGreaterThan(10);
    });

    it('applies prestige bonus', () => {
      const rewardBase = manager.calculateWaveReward(10, 100, 1);
      const rewardWithBonus = manager.calculateWaveReward(10, 100, 2);
      expect(rewardWithBonus.totalScrap).toBeGreaterThan(rewardBase.totalScrap);
    });

    it('applies boost multiplier', () => {
      const rewardBase = manager.calculateWaveReward(10, 100, 1, 1);
      const rewardWithBoost = manager.calculateWaveReward(10, 100, 1, 2);
      expect(rewardWithBoost.totalScrap).toBeGreaterThan(rewardBase.totalScrap);
    });
  });

  describe('calculateProductionBonus', () => {
    it('returns positive bonus', () => {
      const bonus = manager.calculateProductionBonus(1);
      expect(bonus).toBeGreaterThan(0);
    });

    it('increases with wave', () => {
      const bonus1 = manager.calculateProductionBonus(1);
      const bonus50 = manager.calculateProductionBonus(50);
      const bonus100 = manager.calculateProductionBonus(100);

      expect(bonus50).toBeGreaterThan(bonus1);
      expect(bonus100).toBeGreaterThan(bonus50);
    });
  });

  describe('startWave', () => {
    it('spawns enemy and sets combat state', () => {
      const combat = createMockCombatState();
      const result = manager.startWave(1, combat);

      expect(result.enemy).toBeDefined();
      expect(result.timer).toBeGreaterThan(0);
      expect(combat.isActive).toBe(true);
      expect(combat.currentEnemy).toBe(result.enemy);
    });
  });

  describe('completeWave', () => {
    it('returns calculated reward', () => {
      const enemy = manager.spawnEnemyForWave(1);
      const reward = manager.completeWave(1, enemy, 1, 1);

      expect(reward.totalScrap).toBeGreaterThan(0);
    });
  });

  describe('failWave', () => {
    it('deactivates combat', () => {
      const combat = createMockCombatState();
      combat.isActive = true;
      combat.currentEnemy = manager.spawnEnemyForWave(1);

      manager.failWave(1, combat);

      expect(combat.isActive).toBe(false);
      expect(combat.currentEnemy).toBeNull();
    });
  });

  describe('getWaveDifficulty', () => {
    it('returns Easy for early waves', () => {
      expect(manager.getWaveDifficulty(5)).toBe('Easy');
    });

    it('returns appropriate difficulty for higher waves', () => {
      expect(manager.getWaveDifficulty(15)).toBe('Normal');
      expect(manager.getWaveDifficulty(40)).toBe('Hard');
      expect(manager.getWaveDifficulty(75)).toBe('Expert');
      expect(manager.getWaveDifficulty(150)).toBe('Insane');
    });
  });

  describe('getWaveProgress', () => {
    it('returns tier name and progress', () => {
      const progress = manager.getWaveProgress(5);
      expect(progress.tier).toBe('Scrap Bot');
      expect(progress.progress).toBeGreaterThan(0);
    });
  });

  describe('canDefeatWaveInTime', () => {
    it('returns false with no damage', () => {
      const canDefeat = manager.canDefeatWaveInTime(1, 0);
      expect(canDefeat).toBe(false);
    });

    it('returns true with sufficient damage', () => {
      const canDefeat = manager.canDefeatWaveInTime(1, 1000);
      expect(canDefeat).toBe(true);
    });
  });
});
