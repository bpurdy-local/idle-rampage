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
  boostMultiplier?: number;
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
    id: 'boost_2x',
    name: '2x Boost',
    type: 'boost',
    rarity: 'uncommon',
    weight: 35,
    minAmount: 1,
    maxAmount: 1,
    boostType: 'all',
    boostDuration: 30,
  },
  {
    id: 'mega_boost',
    name: 'Mega Boost',
    type: 'boost',
    rarity: 'rare',
    weight: 15,
    minAmount: 1,
    maxAmount: 1,
    boostType: 'all',
    boostDuration: 60,
    boostMultiplier: 3,
  },
];

export const DROP_CONFIG = {
  baseDropChance: 0.20, // 20% chance per wave clear
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
