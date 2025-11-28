import {PrestigeSystem} from '../../src/systems/PrestigeSystem';
import {PlayerState} from '../../src/core/GameState';

const createMockPlayer = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  scrap: 1000,
  blueprints: 50,
  totalBlueprintsEarned: 100,
  prestigeCount: 1,
  highestWave: 25,
  totalTaps: 500,
  totalEnemiesDefeated: 100,
  totalScrapEarned: 50000,
  builders: {
    total: 30,
    available: 10,
    maxBuilders: 100,
  },
  prestigeUpgrades: {},
  activeBoosts: [],
  ...overrides,
});

describe('PrestigeSystem', () => {
  let system: PrestigeSystem;

  beforeEach(() => {
    system = new PrestigeSystem();
  });

  describe('calculateBlueprintsEarned', () => {
    it('returns 0 for waves below requirement', () => {
      expect(system.calculateBlueprintsEarned(5)).toBe(0);
      expect(system.calculateBlueprintsEarned(9)).toBe(0);
    });

    it('returns blueprints starting at wave 10', () => {
      const blueprints = system.calculateBlueprintsEarned(10);
      expect(blueprints).toBeGreaterThan(0);
    });

    it('increases blueprints with higher waves', () => {
      const bp10 = system.calculateBlueprintsEarned(10);
      const bp20 = system.calculateBlueprintsEarned(20);
      const bp50 = system.calculateBlueprintsEarned(50);

      expect(bp20).toBeGreaterThan(bp10);
      expect(bp50).toBeGreaterThan(bp20);
    });
  });

  describe('canPrestige', () => {
    it('returns false for low waves', () => {
      expect(system.canPrestige(5)).toBe(false);
      expect(system.canPrestige(9)).toBe(false);
    });

    it('returns true at minimum wave', () => {
      expect(system.canPrestige(10)).toBe(true);
    });

    it('returns true for higher waves', () => {
      expect(system.canPrestige(50)).toBe(true);
    });
  });

  describe('getPrestigeRequirement', () => {
    it('returns minimum wave requirement', () => {
      expect(system.getPrestigeRequirement()).toBe(10);
    });
  });

  describe('previewPrestige', () => {
    it('shows can prestige false for low waves', () => {
      const preview = system.previewPrestige(5);
      expect(preview.canPrestige).toBe(false);
      expect(preview.blueprintsEarned).toBe(0);
    });

    it('shows accurate preview for valid waves', () => {
      const preview = system.previewPrestige(25);
      expect(preview.canPrestige).toBe(true);
      expect(preview.blueprintsEarned).toBeGreaterThan(0);
    });
  });

  describe('executePrestige', () => {
    it('returns correct blueprints earned', () => {
      const player = createMockPlayer({blueprints: 50});
      const result = system.executePrestige(player, 25);

      expect(result.blueprintsEarned).toBe(system.calculateBlueprintsEarned(25));
      expect(result.totalBlueprints).toBe(50 + result.blueprintsEarned);
      expect(result.waveReached).toBe(25);
    });
  });

  describe('canAffordUpgrade', () => {
    it('returns false for unknown upgrade', () => {
      expect(system.canAffordUpgrade('fake_upgrade', 0, 1000)).toBe(false);
    });

    it('returns false when at max level', () => {
      // production_boost has maxLevel 50
      expect(system.canAffordUpgrade('production_boost', 50, 10000)).toBe(false);
    });

    it('returns false when not enough blueprints', () => {
      expect(system.canAffordUpgrade('production_boost', 0, 0)).toBe(false);
    });

    it('returns true when can afford', () => {
      // production_boost has baseCost 1
      expect(system.canAffordUpgrade('production_boost', 0, 1000)).toBe(true);
    });
  });

  describe('purchaseUpgrade', () => {
    it('fails for unknown upgrade', () => {
      const result = system.purchaseUpgrade('fake_upgrade', 0, 1000);
      expect(result.success).toBe(false);
    });

    it('fails when at max level', () => {
      const result = system.purchaseUpgrade('production_boost', 50, 10000);
      expect(result.success).toBe(false);
    });

    it('fails when not enough blueprints', () => {
      const result = system.purchaseUpgrade('production_boost', 0, 0);
      expect(result.success).toBe(false);
    });

    it('succeeds and deducts blueprints', () => {
      const result = system.purchaseUpgrade('production_boost', 0, 1000);
      expect(result.success).toBe(true);
      expect(result.newLevel).toBe(1);
      expect(result.remainingBlueprints).toBeLessThan(1000);
      expect(result.cost).toBeGreaterThan(0);
    });
  });

  describe('calculateBonuses', () => {
    it('returns base bonuses with no upgrades', () => {
      const bonuses = system.calculateBonuses({});
      expect(bonuses.productionMultiplier).toBe(1);
      expect(bonuses.autoDamageMultiplier).toBe(1);
      expect(bonuses.tapPowerMultiplier).toBe(1);
      expect(bonuses.burstChanceBonus).toBe(0);
    });

    it('applies production boost upgrade', () => {
      const bonuses = system.calculateBonuses({production_boost: 3});
      expect(bonuses.productionMultiplier).toBeGreaterThan(1);
    });

    it('applies auto damage upgrade', () => {
      const bonuses = system.calculateBonuses({auto_damage: 2});
      expect(bonuses.autoDamageMultiplier).toBeGreaterThan(1);
    });

    it('applies multiple upgrades', () => {
      const bonuses = system.calculateBonuses({
        production_boost: 2,
        auto_damage: 2,
        tap_power: 2,
      });
      expect(bonuses.productionMultiplier).toBeGreaterThan(1);
      expect(bonuses.autoDamageMultiplier).toBeGreaterThan(1);
      expect(bonuses.tapPowerMultiplier).toBeGreaterThan(1);
    });
  });

  describe('getStartingScrap', () => {
    it('returns 0 with no upgrades', () => {
      const scrap = system.getStartingScrap({});
      expect(scrap).toBe(0);
    });

    it('adds bonus from starting_scrap upgrade', () => {
      const scrap = system.getStartingScrap({starting_scrap: 2});
      expect(scrap).toBeGreaterThan(0);
    });
  });

  describe('getUpgradeStatus', () => {
    it('returns all upgrades with status', () => {
      const status = system.getUpgradeStatus(100, {});
      expect(status.length).toBeGreaterThan(0);

      for (const item of status) {
        expect(item.upgrade).toBeDefined();
        expect(item.currentLevel).toBe(0);
        expect(item.isMaxed).toBe(false);
      }
    });

    it('shows owned upgrade levels', () => {
      const status = system.getUpgradeStatus(100, {production_boost: 3});
      const productionBoost = status.find(s => s.upgrade.id === 'production_boost');

      expect(productionBoost?.currentLevel).toBe(3);
    });

    it('shows maxed upgrades correctly', () => {
      const status = system.getUpgradeStatus(100, {production_boost: 50});
      const productionBoost = status.find(s => s.upgrade.id === 'production_boost');

      expect(productionBoost?.isMaxed).toBe(true);
      expect(productionBoost?.nextCost).toBeNull();
    });
  });

  describe('getTotalBlueprintsSpent', () => {
    it('returns 0 with no upgrades', () => {
      expect(system.getTotalBlueprintsSpent({})).toBe(0);
    });

    it('returns total spent on upgrades', () => {
      const spent = system.getTotalBlueprintsSpent({production_boost: 2});
      expect(spent).toBeGreaterThan(0);
    });
  });

  describe('calculatePrestigeLevel', () => {
    it('returns 0 for low blueprint counts', () => {
      expect(system.calculatePrestigeLevel(0)).toBe(0);
      expect(system.calculatePrestigeLevel(9)).toBe(0);
    });

    it('returns level based on blueprints', () => {
      expect(system.calculatePrestigeLevel(10)).toBe(1);
      expect(system.calculatePrestigeLevel(100)).toBe(2);
      expect(system.calculatePrestigeLevel(1000)).toBe(3);
    });
  });

  describe('getPrestigeRank', () => {
    it('returns Rookie for level 0', () => {
      expect(system.getPrestigeRank(0)).toBe('Rookie');
    });

    it('returns appropriate ranks for levels', () => {
      expect(system.getPrestigeRank(1)).toBe('Scavenger');
      expect(system.getPrestigeRank(2)).toBe('Mechanic');
      expect(system.getPrestigeRank(5)).toBe('Elite');
    });

    it('caps at highest rank', () => {
      expect(system.getPrestigeRank(100)).toBe('Transcendent');
    });
  });

  describe('createPostPrestigeState', () => {
    it('resets scrap to starting bonus and taps to 0', () => {
      const player = createMockPlayer({scrap: 10000, totalTaps: 1000});
      const newState = system.createPostPrestigeState(player, 50, 30);

      expect(newState.scrap).toBe(0); // No starting_scrap upgrade
      expect(newState.totalTaps).toBe(0);
    });

    it('adds earned blueprints', () => {
      const player = createMockPlayer({blueprints: 100});
      const newState = system.createPostPrestigeState(player, 50, 30);

      expect(newState.blueprints).toBe(150);
    });

    it('increments prestige count', () => {
      const player = createMockPlayer({prestigeCount: 2});
      const newState = system.createPostPrestigeState(player, 50, 30);

      expect(newState.prestigeCount).toBe(3);
    });

    it('preserves prestige upgrades', () => {
      const player = createMockPlayer({
        prestigeUpgrades: {production_boost: 3, auto_damage: 2},
      });
      const newState = system.createPostPrestigeState(player, 50, 30);

      expect(newState.prestigeUpgrades).toEqual({
        production_boost: 3,
        auto_damage: 2,
      });
    });

    it('applies starting scrap bonus', () => {
      const player = createMockPlayer({
        prestigeUpgrades: {starting_scrap: 2},
      });
      const newState = system.createPostPrestigeState(player, 50, 30);

      expect(newState.scrap).toBeGreaterThan(0);
    });

    it('updates total blueprints earned', () => {
      const player = createMockPlayer({totalBlueprintsEarned: 100});
      const newState = system.createPostPrestigeState(player, 50, 30);

      expect(newState.totalBlueprintsEarned).toBe(150);
    });
  });
});
