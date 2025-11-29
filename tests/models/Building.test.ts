import {
  createBuilding,
  calculateUpgradeCost,
  calculateProduction,
  BuildingType,
} from '../../src/models/Building';
import {
  calculateWorkerEfficiency,
  calculateTotalWorkerEfficiency,
  calculateMilestoneBonus,
} from '../../src/systems/WorkerEfficiency';

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

    it('returns increased production with 1 assigned builder (passive + 1)', () => {
      // With passive baseline: 1 passive + 1 assigned worker at 100% efficiency
      const production = calculateProduction(mockBuildingType, 1, 1);
      // 1 passive + 1 worker at 100% = 2 effective workers
      expect(production).toBe(20); // baseProduction * 2 effective workers
    });

    it('has diminishing returns with more workers', () => {
      // Workers have diminishing returns - each additional worker is less efficient
      const prod0 = calculateProduction(mockBuildingType, 1, 0); // 1 effective (passive only)
      const prod1 = calculateProduction(mockBuildingType, 1, 1); // passive + 1 worker at 100%
      const prod5 = calculateProduction(mockBuildingType, 1, 5); // passive + 5 workers with diminishing returns

      // First worker doubles production (100% efficient)
      expect(prod1).toBe(prod0 * 2);

      // 5 workers should NOT be 6x the base (diminishing returns)
      // But production should still increase
      expect(prod5).toBeGreaterThan(prod1);
      expect(prod5).toBeLessThan(prod0 * 6); // Less than linear scaling
    });

    it('provides milestone bonus at 5 workers', () => {
      // At 5 workers, there's a 15% milestone bonus
      const efficiency4 = calculateWorkerEfficiency(4, true);
      const efficiency5 = calculateWorkerEfficiency(5, true);

      // The 5th worker triggers milestone, so effective workers jump more
      expect(efficiency5.milestoneBonus).toBe(1.15); // +15%
      expect(efficiency4.milestoneBonus).toBe(1.0); // No bonus yet
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

describe('WorkerEfficiency', () => {
  describe('calculateTotalWorkerEfficiency', () => {
    it('returns 0 for 0 workers', () => {
      const efficiency = calculateTotalWorkerEfficiency(0);
      expect(efficiency).toBe(0);
    });

    it('returns 1 for 1 worker (100% efficient)', () => {
      const efficiency = calculateTotalWorkerEfficiency(1);
      expect(efficiency).toBe(1);
    });

    it('returns less than linear for multiple workers', () => {
      const efficiency5 = calculateTotalWorkerEfficiency(5);
      const efficiency10 = calculateTotalWorkerEfficiency(10);

      // With diminishing returns, 5 workers < 5 effective, 10 workers < 10 effective
      expect(efficiency5).toBeLessThan(5);
      expect(efficiency5).toBeGreaterThan(3); // But still significant
      expect(efficiency10).toBeLessThan(10);
      expect(efficiency10).toBeGreaterThan(5);
    });
  });

  describe('calculateMilestoneBonus', () => {
    it('returns 1 for 0-4 workers (no bonus)', () => {
      expect(calculateMilestoneBonus(0)).toBe(1);
      expect(calculateMilestoneBonus(4)).toBe(1);
    });

    it('returns 1.15 for 5-9 workers (+15%)', () => {
      expect(calculateMilestoneBonus(5)).toBe(1.15);
      expect(calculateMilestoneBonus(9)).toBe(1.15);
    });

    it('returns 1.40 for 10-19 workers (+40% cumulative)', () => {
      expect(calculateMilestoneBonus(10)).toBe(1.40);
      expect(calculateMilestoneBonus(19)).toBe(1.40);
    });

    it('returns 1.75 for 20+ workers (+75% cumulative)', () => {
      expect(calculateMilestoneBonus(20)).toBe(1.75);
      expect(calculateMilestoneBonus(50)).toBe(1.75);
    });
  });

  describe('calculateWorkerEfficiency', () => {
    it('includes passive baseline by default', () => {
      const withPassive = calculateWorkerEfficiency(0, true);
      const withoutPassive = calculateWorkerEfficiency(0, false);

      expect(withPassive.effectiveWorkers).toBe(1); // Passive gives 1 effective
      expect(withoutPassive.effectiveWorkers).toBe(0);
    });

    it('combines workers and milestone bonuses', () => {
      const result = calculateWorkerEfficiency(5, true);

      // 1 passive + ~3.7 from 5 workers with diminishing returns
      expect(result.totalEfficiency).toBeGreaterThan(4);
      expect(result.totalEfficiency).toBeLessThan(6);

      // Milestone bonus at 5 workers
      expect(result.milestoneBonus).toBe(1.15);

      // Effective workers = totalEfficiency * milestoneBonus
      expect(result.effectiveWorkers).toBeCloseTo(result.totalEfficiency * 1.15, 5);
    });
  });
});
