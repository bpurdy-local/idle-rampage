import {createEnemy, getEnemyHealthPercentage, EnemyTier} from '../../src/models/Enemy';
import {getEnemyTierForWave} from '../../src/data/enemies';

const mockTier: EnemyTier = {
  id: 'test_tier',
  name: 'Test Bot',
  minWave: 1,
  maxWave: 10,
  baseHealth: 100,
  healthMultiplierPerWave: 1.2,
  baseReward: 10,
  rewardMultiplierPerWave: 1.1,
  color: '#000000',
  iconName: 'test',
};

describe('Enemy Model', () => {
  describe('createEnemy', () => {
    it('creates enemy with correct base stats at tier start wave', () => {
      const enemy = createEnemy(mockTier, 1);
      expect(enemy.tierId).toBe('test_tier');
      expect(enemy.maxHealth).toBe(100);
      expect(enemy.currentHealth).toBe(100);
      expect(enemy.reward).toBe(10);
      expect(enemy.wave).toBe(1);
    });

    it('scales health with wave', () => {
      const enemy1 = createEnemy(mockTier, 1);
      const enemy2 = createEnemy(mockTier, 2);
      expect(enemy2.maxHealth).toBeGreaterThan(enemy1.maxHealth);
    });

    it('scales rewards with wave', () => {
      const enemy1 = createEnemy(mockTier, 1);
      const enemy2 = createEnemy(mockTier, 2);
      expect(enemy2.reward).toBeGreaterThan(enemy1.reward);
    });

    it('generates unique ids', () => {
      const enemy1 = createEnemy(mockTier, 1);
      const enemy2 = createEnemy(mockTier, 1);
      expect(enemy1.id).not.toBe(enemy2.id);
    });
  });

  describe('getEnemyHealthPercentage', () => {
    it('returns 100 at full health', () => {
      const enemy = createEnemy(mockTier, 1);
      expect(getEnemyHealthPercentage(enemy)).toBe(100);
    });

    it('returns correct percentage when damaged', () => {
      const enemy = createEnemy(mockTier, 1);
      enemy.currentHealth = 50;
      expect(getEnemyHealthPercentage(enemy)).toBe(50);
    });

    it('returns 0 when dead', () => {
      const enemy = createEnemy(mockTier, 1);
      enemy.currentHealth = 0;
      expect(getEnemyHealthPercentage(enemy)).toBe(0);
    });
  });

  describe('getEnemyTierForWave', () => {
    it('returns scrap_bot for wave 1', () => {
      const tier = getEnemyTierForWave(1);
      expect(tier.id).toBe('scrap_bot');
    });

    it('returns drone for wave 15', () => {
      const tier = getEnemyTierForWave(15);
      expect(tier.id).toBe('drone');
    });

    it('returns mech for wave 75', () => {
      const tier = getEnemyTierForWave(75);
      expect(tier.id).toBe('mech');
    });

    it('returns ai_unit for high waves', () => {
      const tier = getEnemyTierForWave(150);
      expect(tier.id).toBe('ai_unit');
    });
  });
});
