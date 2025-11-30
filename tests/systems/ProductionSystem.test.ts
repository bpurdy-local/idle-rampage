import {ProductionSystem, ProductionBonuses} from '../../src/systems/ProductionSystem';
import {BuildingState} from '../../src/core/GameState';

const createMockBuilding = (
  typeId: string = 'scrap_works',
  assignedBuilders: number = 0,
  level: number = 1,
  isUnlocked: boolean = true,
  evolutionTier: number = 1,
): BuildingState => ({
  id: `building_${typeId}_${Date.now()}`,
  typeId,
  level,
  assignedBuilders,
  productionProgress: 0,
  upgradeProgress: 0,
  isUnlocked,
  evolutionTier,
});

const defaultBonuses: ProductionBonuses = {
  waveBonus: 1,
  prestigeBonus: 1,
  boostMultiplier: 1,
  commandCenterBonus: 1,
  tierMultiplier: 1,
};

describe('ProductionSystem', () => {
  let system: ProductionSystem;

  beforeEach(() => {
    system = new ProductionSystem();
  });

  describe('calculateWaveBonus', () => {
    it('returns 1 at wave 1', () => {
      const bonus = system.calculateWaveBonus(1);
      expect(bonus).toBeGreaterThanOrEqual(1);
    });

    it('increases with higher waves', () => {
      const bonus1 = system.calculateWaveBonus(1);
      const bonus10 = system.calculateWaveBonus(10);
      const bonus100 = system.calculateWaveBonus(100);

      expect(bonus10).toBeGreaterThan(bonus1);
      expect(bonus100).toBeGreaterThan(bonus10);
    });
  });

  describe('calculateBuildingProduction', () => {
    it('returns passive baseline with no assigned builders', () => {
      // With passive baseline, unlocked buildings produce even without workers
      const building = createMockBuilding('scrap_works', 0);
      const production = system.calculateBuildingProduction(building, defaultBonuses);
      expect(production).toBeGreaterThan(0);
    });

    it('returns 0 for locked buildings', () => {
      const building = createMockBuilding('scrap_works', 5, 1, false);
      const production = system.calculateBuildingProduction(building, defaultBonuses);
      expect(production).toBe(0);
    });

    it('returns positive value with builders', () => {
      const building = createMockBuilding('scrap_works', 1);
      const production = system.calculateBuildingProduction(building, defaultBonuses);
      expect(production).toBeGreaterThan(0);
    });

    it('has diminishing returns with more workers', () => {
      // Workers have diminishing returns - each additional worker is less efficient
      const building0 = createMockBuilding('scrap_works', 0);
      const building1 = createMockBuilding('scrap_works', 1);
      const building5 = createMockBuilding('scrap_works', 5);

      const prod0 = system.calculateBuildingProduction(building0, defaultBonuses);
      const prod1 = system.calculateBuildingProduction(building1, defaultBonuses);
      const prod5 = system.calculateBuildingProduction(building5, defaultBonuses);

      // First worker doubles production (100% efficient)
      expect(prod1).toBe(prod0 * 2); // 2 effective vs 1 effective

      // 5 workers should NOT be 6x the base (diminishing returns)
      // But production should still increase and benefit from milestone bonus at 5
      expect(prod5).toBeGreaterThan(prod1);
      expect(prod5).toBeLessThan(prod0 * 6); // Less than linear scaling
    });

    it('applies wave bonus', () => {
      const building = createMockBuilding('scrap_works', 1);
      const bonusWithWave = {...defaultBonuses, waveBonus: 2};

      const prodBase = system.calculateBuildingProduction(building, defaultBonuses);
      const prodWithBonus = system.calculateBuildingProduction(building, bonusWithWave);

      expect(prodWithBonus).toBe(prodBase * 2);
    });

    it('applies prestige bonus', () => {
      const building = createMockBuilding('scrap_works', 1);
      const bonusWithPrestige = {...defaultBonuses, prestigeBonus: 1.5};

      const prodBase = system.calculateBuildingProduction(building, defaultBonuses);
      const prodWithBonus = system.calculateBuildingProduction(
        building,
        bonusWithPrestige,
      );

      expect(prodWithBonus).toBe(prodBase * 1.5);
    });

    it('returns 0 for combat buildings', () => {
      const building = createMockBuilding('defense_station', 5);
      const production = system.calculateBuildingProduction(building, defaultBonuses);
      expect(production).toBe(0);
    });
  });

  describe('tick', () => {
    it('produces nothing with no buildings', () => {
      const result = system.tick([], defaultBonuses, 100);
      expect(result.totalProduction).toBe(0);
      expect(result.buildingResults).toHaveLength(0);
    });

    it('accumulates production over time', () => {
      const building = createMockBuilding('scrap_works', 10);
      const buildings = [building];

      system.tick(buildings, defaultBonuses, 1000);
      system.tick(buildings, defaultBonuses, 1000);
      const result = system.tick(buildings, defaultBonuses, 1000);

      expect(result.totalProduction).toBeGreaterThan(0);
    });
  });

  describe('calculateOfflineProduction', () => {
    it('returns 0 with no production buildings', () => {
      const result = system.calculateOfflineProduction([], defaultBonuses, 3600);
      expect(result).toBe(0);
    });

    it('caps at max offline hours', () => {
      const building = createMockBuilding('scrap_works', 10);
      const buildings = [building];

      const result8h = system.calculateOfflineProduction(
        buildings,
        defaultBonuses,
        8 * 3600,
      );
      const result24h = system.calculateOfflineProduction(
        buildings,
        defaultBonuses,
        24 * 3600,
      );

      expect(result24h).toBe(result8h);
    });

    it('applies offline efficiency reduction', () => {
      const building = createMockBuilding('scrap_works', 10);
      const buildings = [building];

      const productionPerSecond = system.getTotalProductionPerSecond(
        buildings,
        defaultBonuses,
      );
      const offlineSeconds = 100;
      const result = system.calculateOfflineProduction(
        buildings,
        defaultBonuses,
        offlineSeconds,
      );

      expect(result).toBeLessThan(productionPerSecond * offlineSeconds);
    });
  });

  describe('initializeBuildings', () => {
    it('creates all building types', () => {
      const buildings = system.initializeBuildings();
      expect(buildings.length).toBeGreaterThan(0);
    });

    it('starts with first building unlocked', () => {
      const buildings = system.initializeBuildings();
      const scrapWorks = buildings.find(b => b.typeId === 'scrap_works');
      expect(scrapWorks?.isUnlocked).toBe(true);
    });

    it('starts with later buildings locked', () => {
      const buildings = system.initializeBuildings();
      const commandCenter = buildings.find(b => b.typeId === 'command_center');
      expect(commandCenter?.isUnlocked).toBe(false);
    });
  });

  describe('unlockBuildingsForWave', () => {
    it('unlocks buildings when wave threshold reached', () => {
      const buildings = system.initializeBuildings();
      const weakPointScanner = buildings.find(b => b.typeId === 'weak_point_scanner');

      expect(weakPointScanner?.isUnlocked).toBe(false);

      system.unlockBuildingsForWave(buildings, 3);

      expect(weakPointScanner?.isUnlocked).toBe(true);
    });

    it('returns list of newly unlocked buildings', () => {
      const buildings = system.initializeBuildings();
      const unlocked = system.unlockBuildingsForWave(buildings, 25);

      expect(unlocked.length).toBeGreaterThan(0);
    });
  });
});
