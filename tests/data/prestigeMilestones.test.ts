import {
  PRESTIGE_TIERS,
  getTierForPrestigeCount,
  getNextMilestone,
  wouldUnlockMilestone,
  getPrestigesUntilNextMilestone,
} from '../../src/data/prestigeMilestones';

describe('prestigeMilestones', () => {
  describe('PRESTIGE_TIERS', () => {
    it('has 10 tiers', () => {
      expect(PRESTIGE_TIERS).toHaveLength(10);
    });

    it('has tiers numbered 0-9', () => {
      PRESTIGE_TIERS.forEach((tier, index) => {
        expect(tier.tier).toBe(index);
      });
    });

    it('has increasing prestige requirements', () => {
      for (let i = 1; i < PRESTIGE_TIERS.length; i++) {
        expect(PRESTIGE_TIERS[i].prestigeRequired).toBeGreaterThan(
          PRESTIGE_TIERS[i - 1].prestigeRequired,
        );
      }
    });

    it('has increasing multipliers', () => {
      for (let i = 1; i < PRESTIGE_TIERS.length; i++) {
        expect(PRESTIGE_TIERS[i].multiplier).toBeGreaterThan(
          PRESTIGE_TIERS[i - 1].multiplier,
        );
      }
    });

    it('starts with tier 0 at prestige 0', () => {
      expect(PRESTIGE_TIERS[0].prestigeRequired).toBe(0);
      expect(PRESTIGE_TIERS[0].multiplier).toBe(1.0);
    });

    it('ends with tier 9 at prestige 100', () => {
      expect(PRESTIGE_TIERS[9].prestigeRequired).toBe(100);
      expect(PRESTIGE_TIERS[9].multiplier).toBe(15.0);
    });
  });

  describe('getTierForPrestigeCount', () => {
    it('returns tier 0 for prestige count 0', () => {
      const tier = getTierForPrestigeCount(0);
      expect(tier.tier).toBe(0);
      expect(tier.name).toBe('Base');
    });

    it('returns tier 1 for prestige count 1', () => {
      const tier = getTierForPrestigeCount(1);
      expect(tier.tier).toBe(1);
      expect(tier.name).toBe('Mk II');
    });

    it('returns tier 1 for prestige count 2', () => {
      const tier = getTierForPrestigeCount(2);
      expect(tier.tier).toBe(1);
      expect(tier.name).toBe('Mk II');
    });

    it('returns tier 2 for prestige count 3', () => {
      const tier = getTierForPrestigeCount(3);
      expect(tier.tier).toBe(2);
      expect(tier.name).toBe('Mk III');
    });

    it('returns tier 3 for prestige count 5', () => {
      const tier = getTierForPrestigeCount(5);
      expect(tier.tier).toBe(3);
      expect(tier.name).toBe('Advanced');
    });

    it('returns tier 4 for prestige count 10', () => {
      const tier = getTierForPrestigeCount(10);
      expect(tier.tier).toBe(4);
      expect(tier.name).toBe('Enhanced');
    });

    it('returns tier 9 for prestige count 100', () => {
      const tier = getTierForPrestigeCount(100);
      expect(tier.tier).toBe(9);
      expect(tier.name).toBe('Ultimate');
    });

    it('returns tier 9 for prestige count above 100', () => {
      const tier = getTierForPrestigeCount(150);
      expect(tier.tier).toBe(9);
      expect(tier.name).toBe('Ultimate');
    });
  });

  describe('getNextMilestone', () => {
    it('returns tier 1 for prestige count 0', () => {
      const next = getNextMilestone(0);
      expect(next).not.toBeNull();
      expect(next?.tier).toBe(1);
      expect(next?.prestigeRequired).toBe(1);
    });

    it('returns tier 2 for prestige count 1', () => {
      const next = getNextMilestone(1);
      expect(next).not.toBeNull();
      expect(next?.tier).toBe(2);
      expect(next?.prestigeRequired).toBe(3);
    });

    it('returns tier 2 for prestige count 2', () => {
      const next = getNextMilestone(2);
      expect(next).not.toBeNull();
      expect(next?.tier).toBe(2);
      expect(next?.prestigeRequired).toBe(3);
    });

    it('returns null for prestige count 100 (max tier)', () => {
      const next = getNextMilestone(100);
      expect(next).toBeNull();
    });

    it('returns null for prestige count above 100', () => {
      const next = getNextMilestone(150);
      expect(next).toBeNull();
    });
  });

  describe('wouldUnlockMilestone', () => {
    it('returns tier 1 when going from 0 to 1', () => {
      const result = wouldUnlockMilestone(0, 1);
      expect(result).not.toBeNull();
      expect(result?.tier).toBe(1);
      expect(result?.name).toBe('Mk II');
    });

    it('returns null when going from 1 to 2 (same tier)', () => {
      const result = wouldUnlockMilestone(1, 2);
      expect(result).toBeNull();
    });

    it('returns tier 2 when going from 2 to 3', () => {
      const result = wouldUnlockMilestone(2, 3);
      expect(result).not.toBeNull();
      expect(result?.tier).toBe(2);
      expect(result?.name).toBe('Mk III');
    });

    it('returns tier 4 when going from 9 to 10', () => {
      const result = wouldUnlockMilestone(9, 10);
      expect(result).not.toBeNull();
      expect(result?.tier).toBe(4);
      expect(result?.name).toBe('Enhanced');
    });

    it('returns tier 9 when going from 99 to 100', () => {
      const result = wouldUnlockMilestone(99, 100);
      expect(result).not.toBeNull();
      expect(result?.tier).toBe(9);
      expect(result?.name).toBe('Ultimate');
    });

    it('returns null when already at max tier', () => {
      const result = wouldUnlockMilestone(100, 101);
      expect(result).toBeNull();
    });
  });

  describe('getPrestigesUntilNextMilestone', () => {
    it('returns 1 for prestige count 0', () => {
      expect(getPrestigesUntilNextMilestone(0)).toBe(1);
    });

    it('returns 2 for prestige count 1', () => {
      expect(getPrestigesUntilNextMilestone(1)).toBe(2);
    });

    it('returns 1 for prestige count 2', () => {
      expect(getPrestigesUntilNextMilestone(2)).toBe(1);
    });

    it('returns 2 for prestige count 3', () => {
      expect(getPrestigesUntilNextMilestone(3)).toBe(2);
    });

    it('returns 0 for prestige count 100 (max tier)', () => {
      expect(getPrestigesUntilNextMilestone(100)).toBe(0);
    });

    it('returns 0 for prestige count above 100', () => {
      expect(getPrestigesUntilNextMilestone(150)).toBe(0);
    });
  });
});
