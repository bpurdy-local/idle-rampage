import {DailyRewardSystem} from '../../src/systems/DailyRewardSystem';
import {DailyRewardState} from '../../src/core/GameState';
import {DAILY_REWARDS, getRewardForDay} from '../../src/data/dailyRewards';

const createMockDailyRewardState = (
  overrides: Partial<DailyRewardState> = {},
): DailyRewardState => ({
  lastLoginDate: null,
  currentStreak: 0,
  totalDaysLoggedIn: 0,
  hasClaimedToday: false,
  ...overrides,
});

const getDateString = (daysOffset: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

describe('DailyRewardSystem', () => {
  let system: DailyRewardSystem;

  beforeEach(() => {
    system = new DailyRewardSystem();
  });

  describe('checkForReward', () => {
    it('returns day 1 reward for first-ever login', () => {
      const state = createMockDailyRewardState();
      const result = system.checkForReward(state);

      expect(result.hasReward).toBe(true);
      expect(result.newStreak).toBe(1);
      expect(result.reward).toBeDefined();
      expect(result.reward?.day).toBe(1);
      expect(result.isStreakBroken).toBe(false);
    });

    it('returns no reward if already claimed today', () => {
      const state = createMockDailyRewardState({
        lastLoginDate: getDateString(0),
        currentStreak: 3,
        hasClaimedToday: true,
      });
      const result = system.checkForReward(state);

      expect(result.hasReward).toBe(false);
      expect(result.reward).toBeNull();
      expect(result.newStreak).toBe(3);
    });

    it('increments streak for consecutive day login', () => {
      const state = createMockDailyRewardState({
        lastLoginDate: getDateString(-1),
        currentStreak: 3,
      });
      const result = system.checkForReward(state);

      expect(result.hasReward).toBe(true);
      expect(result.newStreak).toBe(4);
      expect(result.isStreakBroken).toBe(false);
    });

    it('resets streak when a day is missed', () => {
      const state = createMockDailyRewardState({
        lastLoginDate: getDateString(-3),
        currentStreak: 5,
      });
      const result = system.checkForReward(state);

      expect(result.hasReward).toBe(true);
      expect(result.newStreak).toBe(1);
      expect(result.isStreakBroken).toBe(true);
    });

    it('does not mark streak broken if previous streak was 1', () => {
      const state = createMockDailyRewardState({
        lastLoginDate: getDateString(-3),
        currentStreak: 1,
      });
      const result = system.checkForReward(state);

      expect(result.newStreak).toBe(1);
      expect(result.isStreakBroken).toBe(false);
    });

    it('returns correct reward for each day 1-7 of cycle', () => {
      for (let day = 1; day <= 7; day++) {
        const state = createMockDailyRewardState({
          lastLoginDate: getDateString(-1),
          currentStreak: day - 1,
        });
        const result = system.checkForReward(state);

        expect(result.newStreak).toBe(day);
        expect(result.reward?.day).toBe(day);
      }
    });

    it('cycles rewards after day 7', () => {
      const state = createMockDailyRewardState({
        lastLoginDate: getDateString(-1),
        currentStreak: 7,
      });
      const result = system.checkForReward(state);

      expect(result.newStreak).toBe(8);
      expect(result.reward?.day).toBe(1);
    });

    it('handles day 14 correctly (second cycle day 7)', () => {
      const state = createMockDailyRewardState({
        lastLoginDate: getDateString(-1),
        currentStreak: 13,
      });
      const result = system.checkForReward(state);

      expect(result.newStreak).toBe(14);
      expect(result.reward?.day).toBe(7);
    });
  });

  describe('claimReward', () => {
    it('updates state correctly when claiming', () => {
      const state = createMockDailyRewardState({
        lastLoginDate: null,
        currentStreak: 0,
        totalDaysLoggedIn: 5,
      });
      const newState = system.claimReward(state, 1);

      expect(newState.lastLoginDate).toBe(getDateString(0));
      expect(newState.currentStreak).toBe(1);
      expect(newState.totalDaysLoggedIn).toBe(6);
      expect(newState.hasClaimedToday).toBe(true);
    });

    it('preserves streak count passed in', () => {
      const state = createMockDailyRewardState({
        currentStreak: 5,
      });
      const newState = system.claimReward(state, 6);

      expect(newState.currentStreak).toBe(6);
    });
  });
});

describe('getRewardForDay', () => {
  it('returns correct reward for day 1', () => {
    const reward = getRewardForDay(1);
    expect(reward.day).toBe(1);
    expect(reward.type).toBe('scrap');
    expect(reward.amount).toBe(100);
  });

  it('returns correct reward for day 7', () => {
    const reward = getRewardForDay(7);
    expect(reward.day).toBe(7);
    expect(reward.type).toBe('builders');
    expect(reward.amount).toBe(1);
  });

  it('cycles correctly for streaks beyond 7', () => {
    expect(getRewardForDay(8).day).toBe(1);
    expect(getRewardForDay(14).day).toBe(7);
    expect(getRewardForDay(15).day).toBe(1);
    expect(getRewardForDay(21).day).toBe(7);
  });
});

describe('DAILY_REWARDS data', () => {
  it('has exactly 7 rewards defined', () => {
    expect(DAILY_REWARDS.length).toBe(7);
  });

  it('has rewards for days 1-7', () => {
    for (let day = 1; day <= 7; day++) {
      const reward = DAILY_REWARDS.find(r => r.day === day);
      expect(reward).toBeDefined();
    }
  });

  it('day 7 reward is builders type', () => {
    const day7 = DAILY_REWARDS.find(r => r.day === 7);
    expect(day7?.type).toBe('builders');
  });

  it('all rewards have required fields', () => {
    for (const reward of DAILY_REWARDS) {
      expect(reward.day).toBeGreaterThan(0);
      expect(reward.type).toBeDefined();
      expect(reward.amount).toBeGreaterThan(0);
      expect(reward.description).toBeDefined();
    }
  });
});
