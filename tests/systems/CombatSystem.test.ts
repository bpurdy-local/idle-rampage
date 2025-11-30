import {CombatSystem, CombatBonuses, DAMAGE_SCRAP_PERCENT} from '../../src/systems/CombatSystem';
import {BuildingState, CombatState, EnemyState} from '../../src/core/GameState';

const createMockEnemy = (health: number = 100): EnemyState => ({
  id: 'enemy_1',
  tierId: 'scrap_bot',
  name: 'Test Bot',
  currentHealth: health,
  maxHealth: health,
  reward: 10,
});

// Note: weak_point_scanner does NOT provide auto-damage (it enables weak points for tap damage)
// For auto-damage tests, we use training_facility as it's the remaining combat building
const createMockWeakPointScanner = (assignedBuilders: number = 5): BuildingState => ({
  id: 'weak_point_scanner_1',
  typeId: 'weak_point_scanner',
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
  baseTapDamage: 10,
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

    it('returns 0 for weak_point_scanner (it enables weak points, not auto-damage)', () => {
      const building = createMockWeakPointScanner(5);
      const damage = system.calculateAutoDamage([building], defaultBonuses);
      expect(damage).toBe(0);
    });

    it('returns 0 for training facility (it boosts tap damage, not auto-damage)', () => {
      const building = createMockTrainingBuilding(5);
      const damage = system.calculateAutoDamage([building], defaultBonuses);
      expect(damage).toBe(0);
    });

    it('returns 0 when no auto-damage buildings exist', () => {
      // With current design, neither weak_point_scanner nor training_facility provide auto-damage
      const buildings = [createMockWeakPointScanner(5), createMockTrainingBuilding(5)];
      const damage = system.calculateAutoDamage(buildings, defaultBonuses);
      expect(damage).toBe(0);
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

    it('deals no auto-damage with current combat buildings (tap-only combat)', () => {
      const enemy = createMockEnemy(1000);
      const combat = createMockCombatState();
      // Current combat buildings (weak_point_scanner, training_facility) don't provide auto-damage
      const buildings = [createMockWeakPointScanner(10), createMockTrainingBuilding(10)];

      const result = system.tick(enemy, buildings, combat, defaultBonuses, 1000);
      expect(result.autoDamage).toBe(0);
    });

    it('enemy not defeated without player input (no auto-damage)', () => {
      const enemy = createMockEnemy(1);
      const combat = createMockCombatState();
      const buildings = [createMockWeakPointScanner(10), createMockTrainingBuilding(10)];

      const result = system.tick(enemy, buildings, combat, defaultBonuses, 10000);
      // Without auto-damage buildings, enemy won't be defeated by tick alone
      expect(result.autoDamage).toBe(0);
    });
  });

  describe('calculateScrapFromDamage', () => {
    it('returns 0 for 0 damage', () => {
      const enemy = createMockEnemy(100);
      const scrap = system.calculateScrapFromDamage(0, enemy);
      expect(scrap).toBe(0);
    });

    it('returns 0 for enemy with 0 max health', () => {
      const enemy = {...createMockEnemy(100), maxHealth: 0};
      const scrap = system.calculateScrapFromDamage(50, enemy);
      expect(scrap).toBe(0);
    });

    it('returns proportional scrap based on damage percent', () => {
      const enemy = createMockEnemy(100);
      enemy.reward = 100;

      // Deal 50% of max health in damage
      const scrap = system.calculateScrapFromDamage(50, enemy);

      // Should get 50% of the damage scrap pool (which is 50% of total reward)
      const expectedPool = 100 * DAMAGE_SCRAP_PERCENT;
      const expectedScrap = Math.floor(expectedPool * 0.5);
      expect(scrap).toBe(expectedScrap);
    });

    it('returns full damage pool when dealing 100% damage', () => {
      const enemy = createMockEnemy(100);
      enemy.reward = 100;

      const scrap = system.calculateScrapFromDamage(100, enemy);

      const expectedScrap = Math.floor(100 * DAMAGE_SCRAP_PERCENT);
      expect(scrap).toBe(expectedScrap);
    });

    it('applies reward multiplier', () => {
      const enemy = createMockEnemy(100);
      enemy.reward = 100;

      const baseScrap = system.calculateScrapFromDamage(50, enemy, 1);
      const multipliedScrap = system.calculateScrapFromDamage(50, enemy, 2);

      expect(multipliedScrap).toBe(baseScrap * 2);
    });

    it('floors the result to integer', () => {
      const enemy = createMockEnemy(100);
      enemy.reward = 7; // Odd number to create fractional result

      const scrap = system.calculateScrapFromDamage(33, enemy);
      expect(Number.isInteger(scrap)).toBe(true);
    });
  });

  describe('tick with scrapFromDamage', () => {
    it('returns 0 scrapFromDamage when no auto-damage buildings exist', () => {
      const enemy = createMockEnemy(100);
      enemy.reward = 1000;
      const combat = createMockCombatState();
      // Current combat buildings don't provide auto-damage
      const buildings = [createMockWeakPointScanner(10), createMockTrainingBuilding(10)];

      const result = system.tick(enemy, buildings, combat, defaultBonuses, 5000, 1);

      // No auto-damage means no scrap from tick
      expect(result.totalDamage).toBe(0);
      expect(result.scrapFromDamage).toBe(0);
    });

    it('scrapFromDamage is 0 without auto-damage buildings', () => {
      const enemy1 = createMockEnemy(1000);
      enemy1.reward = 100;
      const combat = createMockCombatState();
      const buildings = [createMockWeakPointScanner(10)];

      const result1 = system.tick(enemy1, buildings, combat, defaultBonuses, 1000, 1);

      // No auto-damage means no scrap
      expect(result1.totalDamage).toBe(0);
      expect(result1.scrapFromDamage).toBe(0);
    });

    it('returns 0 scrapFromDamage when no damage dealt', () => {
      const enemy = createMockEnemy(100);
      const combat = createMockCombatState();

      // No buildings = no auto damage
      const result = system.tick(enemy, [], combat, defaultBonuses, 1000);

      expect(result.scrapFromDamage).toBe(0);
    });
  });

  describe('DAMAGE_SCRAP_PERCENT constant', () => {
    it('is between 0 and 1', () => {
      expect(DAMAGE_SCRAP_PERCENT).toBeGreaterThan(0);
      expect(DAMAGE_SCRAP_PERCENT).toBeLessThanOrEqual(1);
    });

    it('is currently set to 50%', () => {
      expect(DAMAGE_SCRAP_PERCENT).toBe(0.5);
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
