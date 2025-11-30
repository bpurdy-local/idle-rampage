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
  baseTapDamage: 10,
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
      expect(timer).toBeGreaterThanOrEqual(20);
    });

    it('increases timer with wave', () => {
      const timer1 = manager.calculateWaveTimer(1);
      const timer50 = manager.calculateWaveTimer(50);
      expect(timer50).toBeGreaterThan(timer1);
    });

    it('caps at max timer for non-boss waves', () => {
      const timer = manager.calculateWaveTimer(251); // Non-boss wave past max (not divisible by 10)
      expect(timer).toBeLessThanOrEqual(60);
    });

    it('allows boss waves to exceed normal max (with 1.5x multiplier)', () => {
      const timer = manager.calculateWaveTimer(90); // Boss wave
      expect(timer).toBeLessThanOrEqual(90); // 60 * 1.5
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

  describe('isBossWave', () => {
    it('returns true for wave 10', () => {
      expect(manager.isBossWave(10)).toBe(true);
    });

    it('returns true for wave 20', () => {
      expect(manager.isBossWave(20)).toBe(true);
    });

    it('returns true for wave 100', () => {
      expect(manager.isBossWave(100)).toBe(true);
    });

    it('returns false for wave 1', () => {
      expect(manager.isBossWave(1)).toBe(false);
    });

    it('returns false for wave 5', () => {
      expect(manager.isBossWave(5)).toBe(false);
    });

    it('returns false for wave 15', () => {
      expect(manager.isBossWave(15)).toBe(false);
    });

    it('returns false for wave 25', () => {
      expect(manager.isBossWave(25)).toBe(false);
    });

    it('returns false for wave 0', () => {
      expect(manager.isBossWave(0)).toBe(false);
    });
  });

  describe('getWavesUntilBoss', () => {
    it('returns 10 for wave 0', () => {
      expect(manager.getWavesUntilBoss(0)).toBe(10);
    });

    it('returns 9 for wave 1', () => {
      expect(manager.getWavesUntilBoss(1)).toBe(9);
    });

    it('returns 1 for wave 9', () => {
      expect(manager.getWavesUntilBoss(9)).toBe(1);
    });

    it('returns 10 for wave 10 (next boss is 20)', () => {
      expect(manager.getWavesUntilBoss(10)).toBe(10);
    });
  });

  describe('boss enemy spawning', () => {
    it('spawns boss with isBoss flag on wave 10', () => {
      const enemy = manager.spawnEnemyForWave(10);
      expect(enemy.isBoss).toBe(true);
    });

    it('spawns boss with 2x health multiplier (compared to same-wave regular)', () => {
      // Compare wave 10 boss to what wave 10 would be without boss multiplier
      // Boss HP = regularHP * 2.0, where regularHP already includes wave scaling
      const bossEnemy = manager.spawnEnemyForWave(10);
      // Wave 10 regular HP: 200 * 1.50^9 = ~7688
      // Boss HP should be ~7688 * 2.0 = ~15376
      expect(bossEnemy.maxHealth).toBeGreaterThan(12000);
      expect(bossEnemy.maxHealth).toBeLessThan(20000);
      expect(bossEnemy.isBoss).toBe(true);
    });

    it('spawns boss with 4x reward multiplier', () => {
      const bossEnemy = manager.spawnEnemyForWave(10);
      // Wave 10 regular reward: 10 * 1.15^9 = ~35
      // Boss reward should be ~35 * 4 = ~140
      expect(bossEnemy.reward).toBeGreaterThan(120);
      expect(bossEnemy.reward).toBeLessThan(160);
    });

    it('spawns boss with Alpha in name', () => {
      const enemy = manager.spawnEnemyForWave(10);
      expect(enemy.name).toContain('Alpha');
    });

    it('does not set isBoss flag for regular enemies', () => {
      const enemy = manager.spawnEnemyForWave(5);
      expect(enemy.isBoss).toBeFalsy();
    });
  });

  describe('boss wave timer', () => {
    it('extends timer by 1.5x for boss waves', () => {
      const regularTimer = manager.calculateWaveTimer(9);
      const bossTimer = manager.calculateWaveTimer(10);
      expect(bossTimer).toBeGreaterThan(regularTimer * 1.4);
      expect(bossTimer).toBeLessThan(regularTimer * 1.6);
    });

    it('does not extend timer for regular waves', () => {
      const timer5 = manager.calculateWaveTimer(5);
      const timer6 = manager.calculateWaveTimer(6);
      expect(timer6 - timer5).toBeLessThan(1);
    });
  });

  describe('final boss waves (96-100)', () => {
    it('detects final boss waves correctly', () => {
      expect(manager.isFinalBoss(95)).toBe(false);
      expect(manager.isFinalBoss(96)).toBe(true);
      expect(manager.isFinalBoss(97)).toBe(true);
      expect(manager.isFinalBoss(98)).toBe(true);
      expect(manager.isFinalBoss(99)).toBe(true);
      expect(manager.isFinalBoss(100)).toBe(true);
      expect(manager.isFinalBoss(101)).toBe(false);
    });

    it('spawns final boss with correct stats for wave 96', () => {
      const enemy = manager.spawnEnemyForWave(96);
      expect(enemy.name).toBe('Sentinel Prime');
      expect(enemy.maxHealth).toBe(500000);
      expect(enemy.reward).toBe(100000);
      expect(enemy.isBoss).toBe(true);
    });

    it('spawns final boss with correct stats for wave 100', () => {
      const enemy = manager.spawnEnemyForWave(100);
      expect(enemy.name).toBe('The Architect');
      expect(enemy.maxHealth).toBe(2500000);
      expect(enemy.reward).toBe(500000);
      expect(enemy.isBoss).toBe(true);
    });

    it('uses fixed timer for final bosses', () => {
      expect(manager.calculateWaveTimer(96)).toBe(120);
      expect(manager.calculateWaveTimer(97)).toBe(120);
      expect(manager.calculateWaveTimer(98)).toBe(150);
      expect(manager.calculateWaveTimer(99)).toBe(150);
      expect(manager.calculateWaveTimer(100)).toBe(180);
    });

    it('returns boost drop for waves 96-99', () => {
      const drop96 = manager.getFinalBossDrop(96);
      expect(drop96).not.toBeNull();
      expect(drop96?.type).toBe('boost');
      expect(drop96?.multiplier).toBe(2);
      expect(drop96?.duration).toBe(60);

      const drop99 = manager.getFinalBossDrop(99);
      expect(drop99?.type).toBe('boost');
      expect(drop99?.multiplier).toBe(3);
      expect(drop99?.duration).toBe(90);
    });

    it('returns blueprint drop for wave 100', () => {
      const drop = manager.getFinalBossDrop(100);
      expect(drop).not.toBeNull();
      expect(drop?.type).toBe('blueprints');
      expect(drop?.amount).toBe(25);
    });

    it('returns null for non-final-boss waves', () => {
      expect(manager.getFinalBossDrop(95)).toBeNull();
      expect(manager.getFinalBossDrop(50)).toBeNull();
      expect(manager.getFinalBossDrop(101)).toBeNull();
    });

    it('gets final boss data correctly', () => {
      const boss = manager.getFinalBoss(100);
      expect(boss).toBeDefined();
      expect(boss?.name).toBe('The Architect');
      expect(boss?.health).toBe(2500000);
    });
  });
});
