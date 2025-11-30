import {PrestigeSystem} from '../../src/systems/PrestigeSystem';
import {PlayerState} from '../../src/core/GameState';

const createMockPlayer = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  scrap: 1000,
  blueprints: 50,
  totalBlueprintsEarned: 100,
  prestigeCount: 1,
  buildingTier: 0,
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
  buildersPurchased: 0,
  ...overrides,
});

describe('PrestigeSystem', () => {
  let system: PrestigeSystem;

  beforeEach(() => {
    system = new PrestigeSystem();
  });

  describe('calculateBlueprintsEarned', () => {
    it('returns 0 for waves below requirement', () => {
      expect(system.calculateBlueprintsEarned(50)).toBe(0);
      expect(system.calculateBlueprintsEarned(99)).toBe(0);
    });

    it('returns blueprints starting at wave 100', () => {
      const blueprints = system.calculateBlueprintsEarned(100);
      expect(blueprints).toBeGreaterThan(0);
    });

    it('increases blueprints with higher waves', () => {
      const bp100 = system.calculateBlueprintsEarned(100);
      const bp120 = system.calculateBlueprintsEarned(120);
      const bp150 = system.calculateBlueprintsEarned(150);

      expect(bp120).toBeGreaterThan(bp100);
      expect(bp150).toBeGreaterThan(bp120);
    });
  });

  describe('canPrestige', () => {
    it('returns false for low waves', () => {
      expect(system.canPrestige(50)).toBe(false);
      expect(system.canPrestige(99)).toBe(false);
    });

    it('returns true at minimum wave', () => {
      expect(system.canPrestige(100)).toBe(true);
    });

    it('returns true for higher waves', () => {
      expect(system.canPrestige(150)).toBe(true);
    });
  });

  describe('getPrestigeRequirement', () => {
    it('returns minimum wave requirement', () => {
      expect(system.getPrestigeRequirement()).toBe(100);
    });
  });

  describe('previewPrestige', () => {
    it('shows can prestige false for low waves', () => {
      const preview = system.previewPrestige(50);
      expect(preview.canPrestige).toBe(false);
      expect(preview.blueprintsEarned).toBe(0);
    });

    it('shows accurate preview for valid waves', () => {
      const preview = system.previewPrestige(125);
      expect(preview.canPrestige).toBe(true);
      expect(preview.blueprintsEarned).toBeGreaterThan(0);
    });
  });

  describe('executePrestige', () => {
    it('returns correct blueprints earned', () => {
      const player = createMockPlayer({blueprints: 50});
      const result = system.executePrestige(player, 125);

      expect(result.blueprintsEarned).toBe(system.calculateBlueprintsEarned(125));
      expect(result.totalBlueprints).toBe(50 + result.blueprintsEarned);
      expect(result.waveReached).toBe(125);
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
      const scrap = system.getStartingScrap({}, 100);
      expect(scrap).toBe(0);
    });

    it('returns 0 with upgrade but no wave progress', () => {
      const scrap = system.getStartingScrap({starting_scrap: 2}, 0);
      expect(scrap).toBe(0);
    });

    it('adds bonus from starting_scrap upgrade with wave scaling', () => {
      // Formula: highestWave * 50 * upgradeLevel
      // With wave 100, level 2: 100 * 50 * 2 = 10,000
      const scrap = system.getStartingScrap({starting_scrap: 2}, 100);
      expect(scrap).toBe(10000);
    });

    it('scales with highest wave reached', () => {
      const scrap50 = system.getStartingScrap({starting_scrap: 1}, 50);
      const scrap100 = system.getStartingScrap({starting_scrap: 1}, 100);
      // wave 50: 50 * 50 * 1 = 2,500
      // wave 100: 100 * 50 * 1 = 5,000
      expect(scrap50).toBe(2500);
      expect(scrap100).toBe(5000);
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

    it('preserves buildersPurchased count', () => {
      const player = createMockPlayer({buildersPurchased: 15});
      const newState = system.createPostPrestigeState(player, 50, 30);

      expect(newState.buildersPurchased).toBe(15);
    });
  });

  describe('blueprint calculation with updated constants', () => {
    it('returns exactly 100 blueprints for wave 100', () => {
      expect(system.calculateBlueprintsEarned(100)).toBe(100);
    });

    it('adds 10 blueprints base per wave above 100', () => {
      const bp100 = system.calculateBlueprintsEarned(100);
      const bp101 = system.calculateBlueprintsEarned(101);
      // First wave above 100 adds 10 * 1.10^0 = 10
      expect(bp101).toBe(bp100 + 10);
    });

    it('scales blueprints with 1.10 multiplier per wave', () => {
      const bp100 = system.calculateBlueprintsEarned(100);
      const bp105 = system.calculateBlueprintsEarned(105);
      // Should be significantly more than 100 + (5 * 10) due to scaling
      expect(bp105).toBeGreaterThan(bp100 + 50);
    });
  });

  describe('getBuilderPurchaseCost', () => {
    it('returns 30 for first 5 builders', () => {
      expect(system.getBuilderPurchaseCost(0)).toBe(30);
      expect(system.getBuilderPurchaseCost(1)).toBe(30);
      expect(system.getBuilderPurchaseCost(4)).toBe(30);
    });

    it('returns 50 for builders 5-9', () => {
      expect(system.getBuilderPurchaseCost(5)).toBe(50);
      expect(system.getBuilderPurchaseCost(9)).toBe(50);
    });

    it('returns 75 for builders 10-19', () => {
      expect(system.getBuilderPurchaseCost(10)).toBe(75);
      expect(system.getBuilderPurchaseCost(19)).toBe(75);
    });

    it('returns 100 for builders 20+', () => {
      expect(system.getBuilderPurchaseCost(20)).toBe(100);
      expect(system.getBuilderPurchaseCost(50)).toBe(100);
    });
  });

  describe('canAffordBuilder', () => {
    it('returns true when player has enough blueprints', () => {
      expect(system.canAffordBuilder(100, 0)).toBe(true); // Needs 30
      expect(system.canAffordBuilder(50, 5)).toBe(true); // Needs 50
    });

    it('returns false when player cannot afford', () => {
      expect(system.canAffordBuilder(29, 0)).toBe(false); // Needs 30
      expect(system.canAffordBuilder(49, 5)).toBe(false); // Needs 50
    });

    it('returns true when player has exactly enough', () => {
      expect(system.canAffordBuilder(30, 0)).toBe(true);
      expect(system.canAffordBuilder(50, 5)).toBe(true);
      expect(system.canAffordBuilder(75, 10)).toBe(true);
      expect(system.canAffordBuilder(100, 20)).toBe(true);
    });
  });

  describe('purchaseBuilder', () => {
    it('succeeds when player can afford', () => {
      const result = system.purchaseBuilder(100, 0);
      expect(result.success).toBe(true);
      expect(result.cost).toBe(30);
      expect(result.remainingBlueprints).toBe(70);
    });

    it('fails when player cannot afford', () => {
      const result = system.purchaseBuilder(20, 0);
      expect(result.success).toBe(false);
      expect(result.cost).toBe(30);
      expect(result.remainingBlueprints).toBe(20);
    });

    it('uses escalating cost based on buildersPurchased', () => {
      const result1 = system.purchaseBuilder(100, 0);
      expect(result1.cost).toBe(30);

      const result2 = system.purchaseBuilder(100, 5);
      expect(result2.cost).toBe(50);

      const result3 = system.purchaseBuilder(100, 10);
      expect(result3.cost).toBe(75);

      const result4 = system.purchaseBuilder(100, 20);
      expect(result4.cost).toBe(100);
    });
  });
});
