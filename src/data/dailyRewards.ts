export type DailyRewardType = 'scrap' | 'blueprints' | 'builders';

export interface DailyRewardDefinition {
  day: number;
  type: DailyRewardType;
  baseAmount: number;
  description: string;
}

export const DAILY_REWARDS: DailyRewardDefinition[] = [
  {
    day: 1,
    type: 'scrap',
    baseAmount: 1000,
    description: 'Welcome back!',
  },
  {
    day: 2,
    type: 'scrap',
    baseAmount: 2500,
    description: 'Keep it up!',
  },
  {
    day: 3,
    type: 'blueprints',
    baseAmount: 5,
    description: 'Blueprint bonus!',
  },
  {
    day: 4,
    type: 'scrap',
    baseAmount: 5000,
    description: 'Halfway there!',
  },
  {
    day: 5,
    type: 'blueprints',
    baseAmount: 10,
    description: 'Big blueprint day!',
  },
  {
    day: 6,
    type: 'scrap',
    baseAmount: 10000,
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
