import {CombatSystem, CombatBonuses} from '../../src/systems/CombatSystem';
import {BuildingState, CombatState, EnemyState} from '../../src/core/GameState';

const createMockEnemy = (health: number = 100): EnemyState => ({
  id: 'enemy_1',
  tierId: 'scrap_bot',
  name: 'Test Bot',
  currentHealth: health,
  maxHealth: health,
  reward: 10,
});

const createMockTurretBuilding = (assignedBuilders: number = 5): BuildingState => ({
  id: 'turret_station_1',
  typeId: 'turret_station',
  level: 1,
  assignedBuilders,
  productionProgress: 0,
  upgradeProgress: 0,
  isUnlocked: true,
  evolutionTier: 1,
});

const createMockTrainingBuilding = (assignedBuilders: number = 5): BuildingState => ({
  id: 'training_facility_1',
  typeId: 'training_facility',
  level: 1,
  assignedBuilders,
  productionProgress: 0,
  upgradeProgress: 0,
  isUnlocked: true,
  evolutionTier: 1,
});

const createMockCombatState = (): CombatState => ({
  isActive: true,
  currentEnemy: null,
  waveTimer: 30,
  waveTimerMax: 30,
  autoDamagePerTick: 1,
  burstChance: 0.05,
  burstMultiplier: 5,
});

const defaultBonuses: CombatBonuses = {
  prestigeAutoDamage: 1,
  prestigeTapPower: 1,
  prestigeBurstChance: 0,
  prestigeBurstDamage: 1,
  boostMultiplier: 1,
  tierMultiplier: 1,
};

describe('CombatSystem', () => {
  let system: CombatSystem;

  beforeEach(() => {
    system = new CombatSystem();
  });

  describe('calculateAutoDamage', () => {
    it('returns 0 with no combat buildings', () => {
      const damage = system.calculateAutoDamage([], defaultBonuses);
      expect(damage).toBe(0);
    });

    it('returns 0 with no assigned builders', () => {
      const building = createMockTurretBuilding(0);
      const damage = system.calculateAutoDamage([building], defaultBonuses);
      expect(damage).toBe(0);
    });

    it('returns positive damage with turret buildings', () => {
      const building = createMockTurretBuilding(5);
      const damage = system.calculateAutoDamage([building], defaultBonuses);
      expect(damage).toBeGreaterThan(0);
    });

    it('returns 0 for training facility (only turret provides auto damage)', () => {
      const building = createMockTrainingBuilding(5);
      const damage = system.calculateAutoDamage([building], defaultBonuses);
      expect(damage).toBe(0);
    });

    it('scales with prestige bonus', () => {
      const building = createMockTurretBuilding(5);
      const bonusWithPrestige = {...defaultBonuses, prestigeAutoDamage: 2};

      const damageBase = system.calculateAutoDamage([building], defaultBonuses);
      const damageWithBonus = system.calculateAutoDamage([building], bonusWithPrestige);

      expect(damageWithBonus).toBe(damageBase * 2);
    });
  });

  describe('calculateTapDamage', () => {
    it('returns positive damage', () => {
      const damage = system.calculateTapDamage(10, defaultBonuses);
      expect(damage).toBeGreaterThan(0);
    });

    it('applies variance (damage varies)', () => {
      const damages = new Set<number>();
      for (let i = 0; i < 20; i++) {
        damages.add(system.calculateTapDamage(100, defaultBonuses));
      }
      expect(damages.size).toBeGreaterThan(1);
    });

    it('scales with prestige tap power', () => {
      const bonusWithPrestige = {...defaultBonuses, prestigeTapPower: 3};
      const damages: number[] = [];

      for (let i = 0; i < 100; i++) {
        damages.push(system.calculateTapDamage(10, bonusWithPrestige));
      }

      const avgDamage = damages.reduce((a, b) => a + b, 0) / damages.length;
      expect(avgDamage).toBeGreaterThan(20);
    });
  });

  describe('checkBurstAttack', () => {
    it('returns triggered false most of the time with low chance', () => {
      let bursts = 0;
      for (let i = 0; i < 100; i++) {
        const result = system.checkBurstAttack(0.05, 5, defaultBonuses);
        if (result.triggered) bursts++;
      }
      expect(bursts).toBeLessThan(30);
    });

    it('returns multiplier of 1 when not triggered', () => {
      const zeroChance = {...defaultBonuses};
      let nonBurstMultiplier = 1;

      for (let i = 0; i < 10; i++) {
        const result = system.checkBurstAttack(0, 5, zeroChance);
        if (!result.triggered) {
          nonBurstMultiplier = result.multiplier;
          break;
        }
      }

      expect(nonBurstMultiplier).toBe(1);
    });

    it('returns higher multiplier when triggered', () => {
      const highChance = {...defaultBonuses};

      for (let i = 0; i < 100; i++) {
        const result = system.checkBurstAttack(1.0, 5, highChance);
        if (result.triggered) {
          expect(result.multiplier).toBeGreaterThan(1);
          return;
        }
      }
    });
  });

  describe('applyDamage', () => {
    it('reduces enemy health', () => {
      const enemy = createMockEnemy(100);
      system.applyDamage(enemy, 30);
      expect(enemy.currentHealth).toBe(70);
    });

    it('does not go below 0', () => {
      const enemy = createMockEnemy(50);
      system.applyDamage(enemy, 100);
      expect(enemy.currentHealth).toBe(0);
    });

    it('returns isDefeated true when health reaches 0', () => {
      const enemy = createMockEnemy(50);
      const result = system.applyDamage(enemy, 50);
      expect(result.isDefeated).toBe(true);
    });

    it('returns isDefeated false when health remains', () => {
      const enemy = createMockEnemy(100);
      const result = system.applyDamage(enemy, 30);
      expect(result.isDefeated).toBe(false);
    });
  });

  describe('tick', () => {
    it('returns empty result with no enemy', () => {
      const combat = createMockCombatState();
      const result = system.tick(null, [], combat, defaultBonuses, 100);
      expect(result.totalDamage).toBe(0);
    });

    it('returns empty result when combat inactive', () => {
      const enemy = createMockEnemy();
      const combat = {...createMockCombatState(), isActive: false};
      const result = system.tick(enemy, [], combat, defaultBonuses, 100);
      expect(result.totalDamage).toBe(0);
    });

    it('does not modify wave timer (timer is updated externally)', () => {
      const enemy = createMockEnemy();
      const combat = createMockCombatState();
      combat.waveTimer = 30;

      system.tick(enemy, [], combat, defaultBonuses, 1000);
      // CombatSystem tick does NOT modify waveTimer - it's done externally via store
      expect(combat.waveTimer).toBe(30);
    });

    it('triggers timer expired when timer is at 0', () => {
      const enemy = createMockEnemy();
      const combat = createMockCombatState();
      combat.waveTimer = 0; // Timer already at 0

      const result = system.tick(enemy, [], combat, defaultBonuses, 1000);
      expect(result.timerExpired).toBe(true);
    });

    it('deals damage with turret buildings', () => {
      const enemy = createMockEnemy(1000);
      const combat = createMockCombatState();
      const buildings = [createMockTurretBuilding(10)];

      const result = system.tick(enemy, buildings, combat, defaultBonuses, 1000);
      expect(result.autoDamage).toBeGreaterThan(0);
    });

    it('defeats enemy when health depleted', () => {
      const enemy = createMockEnemy(1);
      const combat = createMockCombatState();
      const buildings = [createMockTurretBuilding(10)];

      const result = system.tick(enemy, buildings, combat, defaultBonuses, 10000);
      expect(result.enemyDefeated).toBe(true);
    });
  });

  describe('createInitialCombatState', () => {
    it('creates valid initial state', () => {
      const state = system.createInitialCombatState();
      expect(state.isActive).toBe(false);
      expect(state.currentEnemy).toBeNull();
      expect(state.waveTimer).toBe(30);
      expect(state.burstChance).toBe(0.05);
    });
  });
});
