import {SpecialEffectsSystem} from '../../src/systems/SpecialEffectsSystem';
import {BuildingState} from '../../src/core/GameState';
import {SPECIAL_EFFECT_CONFIG} from '../../src/data/specialEffectConfig';

const createMockBuilding = (
  typeId: string,
  level: number = 1,
  assignedBuilders: number = 0,
  isUnlocked: boolean = true,
  evolutionTier: number = 1,
): BuildingState => ({
  id: `${typeId}_1`,
  typeId,
  level,
  assignedBuilders,
  productionProgress: 0,
  upgradeProgress: 0,
  isUnlocked,
  evolutionTier,
});

describe('SpecialEffectsSystem', () => {
  let system: SpecialEffectsSystem;

  beforeEach(() => {
    system = new SpecialEffectsSystem();
  });

  describe('Scrap Find (Scrap Works)', () => {
    describe('calculateScrapFindCooldown', () => {
      it('returns base cooldown at level 1 with no workers', () => {
        const cooldown = system.calculateScrapFindCooldown(1, 0, 1);
        expect(cooldown).toBe(SPECIAL_EFFECT_CONFIG.scrapFind.baseCooldownMs);
      });

      it('reduces cooldown with higher level', () => {
        const cooldownLevel1 = system.calculateScrapFindCooldown(1, 0, 1);
        const cooldownLevel5 = system.calculateScrapFindCooldown(5, 0, 1);

        expect(cooldownLevel5).toBeLessThan(cooldownLevel1);
      });

      it('reduces cooldown with workers', () => {
        const cooldownNoWorkers = system.calculateScrapFindCooldown(1, 0, 1);
        const cooldownWithWorkers = system.calculateScrapFindCooldown(1, 10, 1);

        expect(cooldownWithWorkers).toBeLessThan(cooldownNoWorkers);
      });

      it('does not go below minimum cooldown', () => {
        // High level + many workers should hit the floor
        const cooldown = system.calculateScrapFindCooldown(100, 100, 5);
        expect(cooldown).toBe(SPECIAL_EFFECT_CONFIG.scrapFind.minCooldownMs);
      });
    });

    describe('calculateScrapFindAmount', () => {
      it('returns correct base amount', () => {
        const waveReward = 1000;
        const amount = system.calculateScrapFindAmount(waveReward, 1);

        const expected = Math.floor(waveReward * SPECIAL_EFFECT_CONFIG.scrapFind.baseRewardPercent);
        expect(amount).toBe(expected);
      });

      it('scales with tier', () => {
        const waveReward = 1000;
        const amountTier1 = system.calculateScrapFindAmount(waveReward, 1);
        const amountTier3 = system.calculateScrapFindAmount(waveReward, 3);

        expect(amountTier3).toBeGreaterThan(amountTier1);
      });

      it('applies prestige bonuses', () => {
        const waveReward = 1000;
        const baseAmount = system.calculateScrapFindAmount(waveReward, 1, 1, 1);
        const bonusAmount = system.calculateScrapFindAmount(waveReward, 1, 2, 2);

        expect(bonusAmount).toBe(baseAmount * 4); // 2x production * 2x wave rewards
      });
    });

    describe('processScrapFind', () => {
      it('does not trigger before cooldown expires', () => {
        const building = createMockBuilding('scrap_works', 1, 0);
        const lastTriggerTime = Date.now();
        const currentTime = lastTriggerTime + 1000; // Only 1 second passed

        const result = system.processScrapFind(building, 100, lastTriggerTime, currentTime);

        expect(result.triggered).toBe(false);
        expect(result.amount).toBe(0);
      });

      it('triggers after cooldown expires', () => {
        const building = createMockBuilding('scrap_works', 1, 0);
        const lastTriggerTime = 0;
        const currentTime = SPECIAL_EFFECT_CONFIG.scrapFind.baseCooldownMs + 1000;

        const result = system.processScrapFind(building, 100, lastTriggerTime, currentTime);

        expect(result.triggered).toBe(true);
        expect(result.amount).toBeGreaterThan(0);
      });

      it('returns 0 for locked building', () => {
        const building = createMockBuilding('scrap_works', 1, 0, false);
        const result = system.processScrapFind(building, 100, 0, 100000);

        expect(result.triggered).toBe(false);
        expect(result.amount).toBe(0);
      });
    });
  });

  describe('Burst Boost (Training Facility)', () => {
    describe('calculateBurstBoostChance', () => {
      it('returns base chance at level 1 tier 1', () => {
        const chance = system.calculateBurstBoostChance(1, 0, 1);
        expect(chance).toBe(SPECIAL_EFFECT_CONFIG.burstBoost.baseChance);
      });

      it('increases with level', () => {
        const chanceLevel1 = system.calculateBurstBoostChance(1, 0, 1);
        const chanceLevel10 = system.calculateBurstBoostChance(10, 0, 1);

        expect(chanceLevel10).toBeGreaterThan(chanceLevel1);
      });

      it('increases with workers', () => {
        const chanceNoWorkers = system.calculateBurstBoostChance(1, 0, 1);
        const chanceWithWorkers = system.calculateBurstBoostChance(1, 20, 1);

        expect(chanceWithWorkers).toBeGreaterThan(chanceNoWorkers);
      });

      it('increases with tier', () => {
        const chanceTier1 = system.calculateBurstBoostChance(1, 0, 1);
        const chanceTier3 = system.calculateBurstBoostChance(1, 0, 3);

        expect(chanceTier3).toBeGreaterThan(chanceTier1);
      });
    });

    describe('getTotalBurstBoost', () => {
      it('returns 0 with no training facilities', () => {
        const buildings = [createMockBuilding('scrap_works', 1, 0)];
        const boost = system.getTotalBurstBoost(buildings);

        expect(boost).toBe(0);
      });

      it('returns boost from training facility', () => {
        const buildings = [createMockBuilding('training_facility', 5, 10)];
        const boost = system.getTotalBurstBoost(buildings);

        expect(boost).toBeGreaterThan(0);
      });

      it('caps at max total chance', () => {
        // Create a very high level building with many workers
        const buildings = [createMockBuilding('training_facility', 100, 100, true, 5)];
        const boost = system.getTotalBurstBoost(buildings);

        expect(boost).toBeLessThanOrEqual(SPECIAL_EFFECT_CONFIG.burstBoost.maxTotalChance);
      });
    });
  });

  describe('Critical Weakness (Weak Point Scanner)', () => {
    describe('calculateCriticalWeaknessChance', () => {
      it('returns base chance at level 1 tier 1', () => {
        const chance = system.calculateCriticalWeaknessChance(1, 0, 1);
        expect(chance).toBe(SPECIAL_EFFECT_CONFIG.criticalWeakness.baseChance);
      });

      it('increases with level', () => {
        const chanceLevel1 = system.calculateCriticalWeaknessChance(1, 0, 1);
        const chanceLevel10 = system.calculateCriticalWeaknessChance(10, 0, 1);

        expect(chanceLevel10).toBeGreaterThan(chanceLevel1);
      });

      it('increases with workers', () => {
        const chanceNoWorkers = system.calculateCriticalWeaknessChance(1, 0, 1);
        const chanceWithWorkers = system.calculateCriticalWeaknessChance(1, 20, 1);

        expect(chanceWithWorkers).toBeGreaterThan(chanceNoWorkers);
      });
    });

    describe('shouldSpawnCriticalWeakness', () => {
      it('returns false for non-scanner buildings', () => {
        const building = createMockBuilding('scrap_works', 10, 20);
        const result = system.shouldSpawnCriticalWeakness(building);

        expect(result.isCritical).toBe(false);
        expect(result.damageMultiplier).toBe(1);
      });

      it('returns false for locked scanner', () => {
        const building = createMockBuilding('weak_point_scanner', 10, 20, false);
        const result = system.shouldSpawnCriticalWeakness(building);

        expect(result.isCritical).toBe(false);
      });

      it('returns correct damage multiplier when critical', () => {
        // Test multiple times to hit a critical
        const building = createMockBuilding('weak_point_scanner', 100, 100, true, 5);
        let foundCritical = false;

        for (let i = 0; i < 1000; i++) {
          const result = system.shouldSpawnCriticalWeakness(building);
          if (result.isCritical) {
            expect(result.damageMultiplier).toBe(
              SPECIAL_EFFECT_CONFIG.criticalWeakness.damageMultiplier,
            );
            foundCritical = true;
            break;
          }
        }

        expect(foundCritical).toBe(true);
      });
    });

    describe('getCriticalWeaknessDamageMultiplier', () => {
      it('returns configured multiplier', () => {
        const multiplier = system.getCriticalWeaknessDamageMultiplier();
        expect(multiplier).toBe(SPECIAL_EFFECT_CONFIG.criticalWeakness.damageMultiplier);
      });
    });
  });

  describe('Wave Extension (Shield Generator)', () => {
    describe('calculateWaveExtendChance', () => {
      it('returns base chance at level 1 tier 1', () => {
        const chance = system.calculateWaveExtendChance(1, 1);
        expect(chance).toBe(SPECIAL_EFFECT_CONFIG.waveExtend.baseChance);
      });

      it('increases with level', () => {
        const chanceLevel1 = system.calculateWaveExtendChance(1, 1);
        const chanceLevel10 = system.calculateWaveExtendChance(10, 1);

        expect(chanceLevel10).toBeGreaterThan(chanceLevel1);
      });

      it('increases with tier', () => {
        const chanceTier1 = system.calculateWaveExtendChance(1, 1);
        const chanceTier3 = system.calculateWaveExtendChance(1, 3);

        expect(chanceTier3).toBeGreaterThan(chanceTier1);
      });
    });

    describe('calculateWaveExtendBonus', () => {
      it('returns percentage of base wave time', () => {
        const baseWaveTime = 30;
        const bonus = system.calculateWaveExtendBonus(baseWaveTime);

        const expected = baseWaveTime * SPECIAL_EFFECT_CONFIG.waveExtend.bonusTimePercent;
        expect(bonus).toBe(expected);
      });

      it('caps at max bonus seconds', () => {
        const veryLongWaveTime = 1000;
        const bonus = system.calculateWaveExtendBonus(veryLongWaveTime);

        expect(bonus).toBe(SPECIAL_EFFECT_CONFIG.waveExtend.maxBonusSeconds);
      });
    });

    describe('checkWaveExtension', () => {
      it('returns false for non-shield buildings', () => {
        const building = createMockBuilding('scrap_works', 10, 20);
        const result = system.checkWaveExtension(building, 30);

        expect(result.triggered).toBe(false);
        expect(result.bonusSeconds).toBe(0);
      });

      it('returns false for locked shield generator', () => {
        const building = createMockBuilding('shield_generator', 10, 20, false);
        const result = system.checkWaveExtension(building, 30);

        expect(result.triggered).toBe(false);
      });

      it('can trigger for shield generator', () => {
        // Test multiple times to hit the chance
        const building = createMockBuilding('shield_generator', 50, 20, true, 3);
        let triggered = false;

        for (let i = 0; i < 1000; i++) {
          const result = system.checkWaveExtension(building, 30);
          if (result.triggered) {
            expect(result.bonusSeconds).toBeGreaterThan(0);
            triggered = true;
            break;
          }
        }

        expect(triggered).toBe(true);
      });
    });

    describe('checkWaveExtensionFromBuildings', () => {
      it('returns false with no shield generators', () => {
        const buildings = [
          createMockBuilding('scrap_works', 1, 0),
          createMockBuilding('training_facility', 1, 0),
        ];
        const result = system.checkWaveExtensionFromBuildings(buildings, 30);

        expect(result.triggered).toBe(false);
      });

      it('checks shield generator in building array when random succeeds', () => {
        // Mock Math.random to always return 0 (will always pass the chance check)
        const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);

        const buildings = [
          createMockBuilding('scrap_works', 1, 0),
          createMockBuilding('shield_generator', 1, 0, true, 1),
        ];

        const result = system.checkWaveExtensionFromBuildings(buildings, 30);

        expect(result.triggered).toBe(true);
        expect(result.bonusSeconds).toBeGreaterThan(0);

        mockRandom.mockRestore();
      });

      it('returns false when random fails', () => {
        // Mock Math.random to always return 1 (will always fail the chance check)
        const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(1);

        const buildings = [
          createMockBuilding('scrap_works', 1, 0),
          createMockBuilding('shield_generator', 1, 0, true, 1),
        ];

        const result = system.checkWaveExtensionFromBuildings(buildings, 30);

        expect(result.triggered).toBe(false);

        mockRandom.mockRestore();
      });
    });
  });
});
