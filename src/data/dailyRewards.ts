export type DailyRewardType = 'scrap' | 'blueprints' | 'builders';

export interface DailyRewardDefinition {
  day: number;
  type: DailyRewardType;
  baseAmount: number;
  description: string;
}

// Daily rewards balanced for ~2hr first prestige economy
// Day 1 scrap (100) = ~1-2 building upgrades, not game-breaking
export const DAILY_REWARDS: DailyRewardDefinition[] = [
  {
    day: 1,
    type: 'scrap',
    baseAmount: 100,
    description: 'Welcome back!',
  },
  {
    day: 2,
    type: 'scrap',
    baseAmount: 250,
    description: 'Keep it up!',
  },
  {
    day: 3,
    type: 'blueprints',
    baseAmount: 3,
    description: 'Blueprint bonus!',
  },
  {
    day: 4,
    type: 'scrap',
    baseAmount: 500,
    description: 'Halfway there!',
  },
  {
    day: 5,
    type: 'blueprints',
    baseAmount: 5,
    description: 'Big blueprint day!',
  },
  {
    day: 6,
    type: 'scrap',
    baseAmount: 1000,
    description: 'Almost there!',
  },
  {
    day: 7,
    type: 'builders',
    baseAmount: 1,
    description: 'Weekly bonus builder!',
  },
];

// Calculate wave scaling multiplier for scrap rewards
// Scales exponentially with wave progression to stay relevant
// Capped at wave 50 to prevent excessive late-game scaling (~1M scrap max)
export const calculateWaveScaling = (currentWave: number): number => {
  if (currentWave <= 1) return 1;
  // Cap wave at 50 for scaling calculation to prevent excessive rewards
  const cappedWave = Math.min(currentWave, 50);
  // Every 10 waves doubles the reward, with some base scaling
  return Math.pow(1.15, cappedWave - 1);
};

export const getRewardForDay = (streak: number): DailyRewardDefinition => {
  const cycleDay = ((streak - 1) % 7) + 1;
  return DAILY_REWARDS.find(r => r.day === cycleDay) ?? DAILY_REWARDS[0];
};

// Get the actual reward amount, scaled by wave for scrap rewards
export const getScaledRewardAmount = (
  reward: DailyRewardDefinition,
  currentWave: number,
): number => {
  if (reward.type === 'scrap') {
    return Math.floor(reward.baseAmount * calculateWaveScaling(currentWave));
  }
  return reward.baseAmount;
};
