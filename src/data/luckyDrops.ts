export type DropType = 'scrap' | 'blueprints' | 'boost';
export type DropRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface LuckyDrop {
  id: string;
  name: string;
  type: DropType;
  rarity: DropRarity;
  weight: number;
  minAmount: number;
  maxAmount: number;
  boostType?: string;
  boostDuration?: number;
}

export const LUCKY_DROPS: LuckyDrop[] = [
  {
    id: 'scrap_bonus',
    name: 'Scrap Bonus',
    type: 'scrap',
    rarity: 'common',
    weight: 50,
    minAmount: 2,
    maxAmount: 5,
  },
  {
    id: 'blueprint_drop',
    name: 'Blueprint',
    type: 'blueprints',
    rarity: 'uncommon',
    weight: 30,
    minAmount: 1,
    maxAmount: 3,
  },
  {
    id: 'boost_2x',
    name: '2x Boost',
    type: 'boost',
    rarity: 'rare',
    weight: 15,
    minAmount: 1,
    maxAmount: 1,
    boostType: 'all',
    boostDuration: 30,
  },
];

export const DROP_CONFIG = {
  baseDropChance: 0.75, // 75% chance for testing (was 0.25 / 25%)
  minWaveForDrops: 1,
};

export const RARITY_COLORS: Record<DropRarity, string> = {
  common: '#ffffff',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9c27b0',
};

export const DROP_ICONS: Record<DropType, string> = {
  scrap: '⚙️',
  blueprints: '📘',
  boost: '⚡',
};
