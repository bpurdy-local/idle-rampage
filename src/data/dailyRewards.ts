export type DailyRewardType = 'scrap' | 'blueprints' | 'builders';

export interface DailyRewardDefinition {
  day: number;
  type: DailyRewardType;
  amount: number;
  description: string;
}

export const DAILY_REWARDS: DailyRewardDefinition[] = [
  {
    day: 1,
    type: 'scrap',
    amount: 100,
    description: 'Welcome back!',
  },
  {
    day: 2,
    type: 'scrap',
    amount: 250,
    description: 'Keep it up!',
  },
  {
    day: 3,
    type: 'blueprints',
    amount: 5,
    description: 'Blueprint bonus!',
  },
  {
    day: 4,
    type: 'scrap',
    amount: 500,
    description: 'Halfway there!',
  },
  {
    day: 5,
    type: 'blueprints',
    amount: 10,
    description: 'Big blueprint day!',
  },
  {
    day: 6,
    type: 'scrap',
    amount: 1000,
    description: 'Almost there!',
  },
  {
    day: 7,
    type: 'builders',
    amount: 1,
    description: 'Weekly bonus builder!',
  },
];

export const getRewardForDay = (streak: number): DailyRewardDefinition => {
  const cycleDay = ((streak - 1) % 7) + 1;
  return DAILY_REWARDS.find(r => r.day === cycleDay) ?? DAILY_REWARDS[0];
};
