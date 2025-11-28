import {
  createInitialPlayer,
  canAfford,
  spendScrap,
  calculatePrestigeBlueprints,
} from '../../src/models/Player';

describe('Player Model', () => {
  describe('createInitialPlayer', () => {
    it('creates player with default 30 builders', () => {
      const player = createInitialPlayer();
      expect(player.totalBuilders).toBe(30);
      expect(player.availableBuilders).toBe(30);
    });

    it('allows custom starting builders', () => {
      const player = createInitialPlayer(50);
      expect(player.totalBuilders).toBe(50);
      expect(player.availableBuilders).toBe(50);
    });

    it('starts with 0 resources', () => {
      const player = createInitialPlayer();
      expect(player.scrap).toBe(0);
      expect(player.blueprints).toBe(0);
    });
  });

  describe('canAfford', () => {
    it('returns true when player has enough scrap', () => {
      const player = {...createInitialPlayer(), scrap: 100};
      expect(canAfford(player, 50)).toBe(true);
    });

    it('returns true when cost equals scrap', () => {
      const player = {...createInitialPlayer(), scrap: 100};
      expect(canAfford(player, 100)).toBe(true);
    });

    it('returns false when player cannot afford', () => {
      const player = {...createInitialPlayer(), scrap: 50};
      expect(canAfford(player, 100)).toBe(false);
    });
  });

  describe('spendScrap', () => {
    it('deducts scrap when affordable', () => {
      const player = {...createInitialPlayer(), scrap: 100};
      const result = spendScrap(player, 30);
      expect(result.scrap).toBe(70);
    });

    it('returns unchanged player when cannot afford', () => {
      const player = {...createInitialPlayer(), scrap: 20};
      const result = spendScrap(player, 50);
      expect(result.scrap).toBe(20);
    });
  });

  describe('calculatePrestigeBlueprints', () => {
    it('returns 0 below wave 10', () => {
      expect(calculatePrestigeBlueprints(5)).toBe(0);
      expect(calculatePrestigeBlueprints(9)).toBe(0);
    });

    it('returns 1 at wave 10', () => {
      expect(calculatePrestigeBlueprints(10)).toBe(1);
    });

    it('scales with wave count', () => {
      const bp10 = calculatePrestigeBlueprints(10);
      const bp50 = calculatePrestigeBlueprints(50);
      const bp100 = calculatePrestigeBlueprints(100);
      expect(bp50).toBeGreaterThan(bp10);
      expect(bp100).toBeGreaterThan(bp50);
    });
  });
});
