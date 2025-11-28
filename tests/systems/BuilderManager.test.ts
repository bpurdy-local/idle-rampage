import {BuilderManager} from '../../src/systems/BuilderManager';
import {BuildingState} from '../../src/core/GameState';

const createMockBuilding = (id: string, isUnlocked: boolean = true): BuildingState => ({
  id,
  typeId: 'scrap_works',
  level: 1,
  assignedBuilders: 0,
  productionProgress: 0,
  upgradeProgress: 0,
  isUnlocked,
  evolutionTier: 1,
});

describe('BuilderManager', () => {
  let manager: BuilderManager;

  beforeEach(() => {
    manager = new BuilderManager(30);
  });

  describe('initialization', () => {
    it('starts with correct total builders', () => {
      expect(manager.getTotalBuilders()).toBe(30);
    });

    it('starts with all builders available', () => {
      expect(manager.getAvailableBuilders()).toBe(30);
    });

    it('starts with no assigned builders', () => {
      expect(manager.getAssignedBuilders()).toBe(0);
    });
  });

  describe('addBuilders', () => {
    it('increases total and available builders', () => {
      manager.addBuilders(10);
      expect(manager.getTotalBuilders()).toBe(40);
      expect(manager.getAvailableBuilders()).toBe(40);
    });
  });

  describe('assignBuilder', () => {
    it('fails when no available builders', () => {
      const emptyManager = new BuilderManager(0);
      emptyManager.registerBuilding(createMockBuilding('b1'));
      const result = emptyManager.assignBuilder('b1');
      expect(result.success).toBe(false);
      expect(result.message).toBe('No available builders');
    });

    it('fails when building not found', () => {
      const result = manager.assignBuilder('nonexistent');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Building not found');
    });

    it('fails when building is locked', () => {
      manager.registerBuilding(createMockBuilding('b1', false));
      const result = manager.assignBuilder('b1');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Building is locked');
    });

    it('succeeds and decreases available builders', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      const result = manager.assignBuilder('b1');
      expect(result.success).toBe(true);
      expect(manager.getAvailableBuilders()).toBe(29);
    });

    it('increases building assigned count', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      manager.assignBuilder('b1');
      expect(manager.getBuilderCountForBuilding('b1')).toBe(1);
    });
  });

  describe('unassignBuilder', () => {
    it('fails when building not found', () => {
      const result = manager.unassignBuilder('nonexistent');
      expect(result.success).toBe(false);
    });

    it('fails when no builders assigned', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      const result = manager.unassignBuilder('b1');
      expect(result.success).toBe(false);
      expect(result.message).toBe('No builders to unassign');
    });

    it('succeeds and increases available builders', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      manager.assignBuilder('b1');
      const result = manager.unassignBuilder('b1');
      expect(result.success).toBe(true);
      expect(manager.getAvailableBuilders()).toBe(30);
    });
  });

  describe('reassignBuilder', () => {
    it('moves builder between buildings', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      manager.registerBuilding(createMockBuilding('b2'));
      manager.assignBuilder('b1');

      const result = manager.reassignBuilder('b1', 'b2');
      expect(result.success).toBe(true);
      expect(manager.getBuilderCountForBuilding('b1')).toBe(0);
      expect(manager.getBuilderCountForBuilding('b2')).toBe(1);
      expect(manager.getAvailableBuilders()).toBe(29);
    });

    it('rolls back on failure', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      manager.registerBuilding(createMockBuilding('b2', false));
      manager.assignBuilder('b1');

      manager.reassignBuilder('b1', 'b2');
      expect(manager.getBuilderCountForBuilding('b1')).toBe(1);
      expect(manager.getBuilderCountForBuilding('b2')).toBe(0);
    });
  });

  describe('resetAllAssignments', () => {
    it('returns all builders to available pool', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      manager.registerBuilding(createMockBuilding('b2'));
      manager.assignBuilder('b1');
      manager.assignBuilder('b1');
      manager.assignBuilder('b2');

      manager.resetAllAssignments();
      expect(manager.getAvailableBuilders()).toBe(30);
      expect(manager.getBuilderCountForBuilding('b1')).toBe(0);
      expect(manager.getBuilderCountForBuilding('b2')).toBe(0);
    });
  });

  describe('validateConsistency', () => {
    it('returns true when counts are consistent', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      manager.assignBuilder('b1');
      expect(manager.validateConsistency()).toBe(true);
    });

    it('validates after multiple operations', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      manager.registerBuilding(createMockBuilding('b2'));

      for (let i = 0; i < 10; i++) {
        manager.assignBuilder('b1');
      }
      for (let i = 0; i < 5; i++) {
        manager.assignBuilder('b2');
      }
      manager.unassignBuilder('b1');
      manager.unassignBuilder('b1');

      expect(manager.validateConsistency()).toBe(true);
      expect(manager.getAvailableBuilders()).toBe(17);
    });
  });

  describe('purchaseIntegration', () => {
    it('purchased builders persist through operations', () => {
      manager.registerBuilding(createMockBuilding('b1'));
      manager.assignBuilder('b1');
      manager.addBuilders(10);

      expect(manager.getTotalBuilders()).toBe(40);
      expect(manager.getAvailableBuilders()).toBe(39);
      expect(manager.validateConsistency()).toBe(true);
    });
  });
});
