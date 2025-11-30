import {
  createBuilding,
  calculateUpgradeCost,
  calculateProduction,
  BuildingType,
} from '../../src/models/Building';
import {
  calculateWorkerEfficiency,
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

describe('Building Cost Scaling (Balance Pacing Fix)', () => {
  it('Scrap Works has 1.18x cost multiplier for reasonable upgrade costs', () => {
    const scrapWorksType: BuildingType = {
      id: 'scrap_works',
      name: 'Scrap Collector',
      description: 'Test',
      role: 'production',
      baseProduction: 1,
      baseCost: 75,
      costMultiplier: 1.18,
      maxBuilders: 50,
      unlockWave: 1,
      iconName: 'cog',
      color: '#8B4513',
    };

    const costLevel1 = calculateUpgradeCost(scrapWorksType, 1);
    const costLevel10 = calculateUpgradeCost(scrapWorksType, 10);
    const costLevel25 = calculateUpgradeCost(scrapWorksType, 25);
    const costLevel50 = calculateUpgradeCost(scrapWorksType, 50);

    expect(costLevel1).toBe(75);
    expect(costLevel10).toBeLessThan(400); // With 1.18x multiplier
    expect(costLevel25).toBeLessThan(5000); // Reasonable scaling
    expect(costLevel50).toBeLessThan(350000); // Still manageable
  });

  it('Weak Point Scanner has 1.20x cost multiplier', () => {
    const scannerType: BuildingType = {
      id: 'weak_point_scanner',
      name: 'Weak Point Scanner',
      description: 'Test',
      role: 'combat',
      baseProduction: 0.1,
      baseCost: 200,
      costMultiplier: 1.20,
      maxBuilders: 50,
      unlockWave: 3,
      iconName: 'crosshairs',
      color: '#00CED1',
    };

    const costLevel1 = calculateUpgradeCost(scannerType, 1);
    const costLevel50 = calculateUpgradeCost(scannerType, 50);

    expect(costLevel1).toBe(200);
    expect(costLevel50).toBeLessThan(2000000); // Reasonable cost at level 50
  });

  it('Command Center has 1.30x cost multiplier', () => {
    const commandType: BuildingType = {
      id: 'command_center',
      name: 'Outpost',
      description: 'Test',
      role: 'utility',
      baseProduction: 0.15,
      baseCost: 75000,
      costMultiplier: 1.30,
      maxBuilders: 0,
      unlockWave: 20,
      iconName: 'flag',
      color: '#708090',
    };

    const costLevel1 = calculateUpgradeCost(commandType, 1);
    const costLevel10 = calculateUpgradeCost(commandType, 10);

    expect(costLevel1).toBe(75000);
    expect(costLevel10).toBeLessThan(1000000); // With 1.30x multiplier
  });

  it('upgrade costs stay economically viable at high levels', () => {
    const scrapWorksType: BuildingType = {
      id: 'scrap_works',
      name: 'Scrap Collector',
      description: 'Test',
      role: 'production',
      baseProduction: 1,
      baseCost: 75,
      costMultiplier: 1.18,
      maxBuilders: 50,
      unlockWave: 1,
      iconName: 'cog',
      color: '#8B4513',
    };

    // At level 50, cost should be reasonable, not billions
    const costLevel50 = calculateUpgradeCost(scrapWorksType, 50);
    expect(costLevel50).toBeLessThan(350000);
    expect(costLevel50).toBeGreaterThan(1000);
  });
});

describe('WorkerEfficiency', () => {
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
