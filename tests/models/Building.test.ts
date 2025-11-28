import {
  createBuilding,
  calculateUpgradeCost,
  calculateProduction,
  BuildingType,
} from '../../src/models/Building';

const mockBuildingType: BuildingType = {
  id: 'test_building',
  name: 'Test Building',
  description: 'A test building',
  role: 'production',
  baseProduction: 10,
  baseCost: 100,
  costMultiplier: 1.5,
  maxBuilders: 50,
  unlockWave: 1,
  iconName: 'test',
  color: '#000000',
};

describe('Building Model', () => {
  describe('createBuilding', () => {
    it('creates a building with correct default values', () => {
      const building = createBuilding('test_building');
      expect(building.typeId).toBe('test_building');
      expect(building.level).toBe(1);
      expect(building.assignedBuilders).toBe(0);
      expect(building.productionProgress).toBe(0);
      expect(building.upgradeProgress).toBe(0);
      expect(building.isUnlocked).toBe(false);
    });

    it('uses provided id when given', () => {
      const building = createBuilding('test_building', 'custom_id');
      expect(building.id).toBe('custom_id');
    });
  });

  describe('calculateUpgradeCost', () => {
    it('returns base cost at level 1', () => {
      const cost = calculateUpgradeCost(mockBuildingType, 1);
      expect(cost).toBe(100);
    });

    it('increases cost with level', () => {
      const costLevel1 = calculateUpgradeCost(mockBuildingType, 1);
      const costLevel2 = calculateUpgradeCost(mockBuildingType, 2);
      expect(costLevel2).toBeGreaterThan(costLevel1);
    });

    it('applies cost multiplier correctly', () => {
      const cost = calculateUpgradeCost(mockBuildingType, 2);
      expect(cost).toBe(150);
    });
  });

  describe('calculateProduction', () => {
    it('returns passive baseline with no assigned builders (1 effective worker)', () => {
      // With passive baseline, 0 assigned = 1 effective worker
      const production = calculateProduction(mockBuildingType, 1, 0);
      expect(production).toBe(10); // baseProduction * 1 effective worker
    });

    it('returns 0 with no builders when passive is disabled', () => {
      const production = calculateProduction(mockBuildingType, 1, 0, 1, 1, false);
      expect(production).toBe(0);
    });

    it('returns double base production with 1 assigned builder (passive + 1)', () => {
      // With passive baseline: 1 passive + 1 assigned = 2 effective workers
      const production = calculateProduction(mockBuildingType, 1, 1);
      expect(production).toBe(20); // baseProduction * 2 effective workers
    });

    it('scales linearly with total effective workers', () => {
      // 0 assigned = 1 effective, 1 assigned = 2 effective
      const prod0 = calculateProduction(mockBuildingType, 1, 0);
      const prod1 = calculateProduction(mockBuildingType, 1, 1);
      const prod2 = calculateProduction(mockBuildingType, 1, 2);
      expect(prod1).toBe(prod0 * 2); // 2 effective vs 1 effective
      expect(prod2).toBe(prod0 * 3); // 3 effective vs 1 effective
    });

    it('applies wave bonus', () => {
      const prodNoBonus = calculateProduction(mockBuildingType, 1, 1, 1);
      const prodWithBonus = calculateProduction(mockBuildingType, 1, 1, 2);
      expect(prodWithBonus).toBe(prodNoBonus * 2);
    });

    it('applies prestige bonus', () => {
      const prodNoBonus = calculateProduction(mockBuildingType, 1, 1, 1, 1);
      const prodWithBonus = calculateProduction(mockBuildingType, 1, 1, 1, 1.5);
      expect(prodWithBonus).toBe(prodNoBonus * 1.5);
    });
  });
});
