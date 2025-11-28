import {EnemyTier} from '../models/Enemy';

export const ENEMY_TIERS: EnemyTier[] = [
  {
    id: 'scrap_bot',
    name: 'Scrap Bot',
    minWave: 1,
    maxWave: 10,
    baseHealth: 200,
    healthMultiplierPerWave: 1.4,
    baseReward: 10,
    rewardMultiplierPerWave: 1.2,
    color: '#8B8B8B',
    iconName: 'robot',
  },
  {
    id: 'drone',
    name: 'Drone',
    minWave: 11,
    maxWave: 25,
    baseHealth: 200,
    healthMultiplierPerWave: 1.35,
    baseReward: 50,
    rewardMultiplierPerWave: 1.25,
    color: '#4169E1',
    iconName: 'plane',
  },
  {
    id: 'loader',
    name: 'Loader',
    minWave: 26,
    maxWave: 50,
    baseHealth: 1000,
    healthMultiplierPerWave: 1.4,
    baseReward: 200,
    rewardMultiplierPerWave: 1.3,
    color: '#FF8C00',
    iconName: 'truck',
  },
  {
    id: 'mech',
    name: 'Mech',
    minWave: 51,
    maxWave: 100,
    baseHealth: 5000,
    healthMultiplierPerWave: 1.45,
    baseReward: 1000,
    rewardMultiplierPerWave: 1.35,
    color: '#B22222',
    iconName: 'shield',
  },
  {
    id: 'ai_unit',
    name: 'AI Unit',
    minWave: 101,
    maxWave: Infinity,
    baseHealth: 50000,
    healthMultiplierPerWave: 1.5,
    baseReward: 10000,
    rewardMultiplierPerWave: 1.4,
    color: '#800080',
    iconName: 'brain',
  },
];

export const getEnemyTierForWave = (wave: number): EnemyTier => {
  const tier = ENEMY_TIERS.find(t => wave >= t.minWave && wave <= t.maxWave);
  return tier ?? ENEMY_TIERS[ENEMY_TIERS.length - 1];
};

export const getEnemyTierById = (id: string): EnemyTier | undefined => {
  return ENEMY_TIERS.find(t => t.id === id);
};
