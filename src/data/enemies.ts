import {EnemyTier} from '../models/Enemy';

export const ENEMY_TIERS: EnemyTier[] = [
  {
    id: 'scrap_bot',
    name: 'Scrap Bot',
    minWave: 1,
    maxWave: 10,
    baseHealth: 200,
    healthMultiplierPerWave: 1.50,
    baseReward: 10,
    rewardMultiplierPerWave: 1.15,
    color: '#8B8B8B',
    iconName: 'robot',
  },
  {
    id: 'drone',
    name: 'Drone',
    minWave: 11,
    maxWave: 25,
    baseHealth: 1000,
    healthMultiplierPerWave: 1.45,
    baseReward: 30,
    rewardMultiplierPerWave: 1.12,
    color: '#4169E1',
    iconName: 'plane',
  },
  {
    id: 'loader',
    name: 'Loader',
    minWave: 26,
    maxWave: 50,
    baseHealth: 8000,
    healthMultiplierPerWave: 1.42,
    baseReward: 100,
    rewardMultiplierPerWave: 1.15,
    color: '#FF8C00',
    iconName: 'truck',
  },
  {
    id: 'mech',
    name: 'Mech',
    minWave: 51,
    maxWave: 75,
    baseHealth: 80000,
    healthMultiplierPerWave: 1.38,
    baseReward: 500,
    rewardMultiplierPerWave: 1.18,
    color: '#B22222',
    iconName: 'shield',
  },
  {
    id: 'ai_unit',
    name: 'AI Unit',
    minWave: 76,
    maxWave: 95,
    baseHealth: 800000,
    healthMultiplierPerWave: 1.35,
    baseReward: 2000,
    rewardMultiplierPerWave: 1.15,
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

export interface FinalBoss {
  wave: number;
  id: string;
  name: string;
  health: number;
  reward: number;
  timerSeconds: number;
  color: string;
  iconName: string;
  guaranteedDrop: {
    type: 'boost' | 'blueprints';
    multiplier?: number;
    duration?: number;
    amount?: number;
  };
}

export const FINAL_BOSSES: FinalBoss[] = [
  {
    wave: 96,
    id: 'sentinel_prime',
    name: 'Sentinel Prime',
    health: 500000,
    reward: 100000,
    timerSeconds: 120,
    color: '#DC143C',
    iconName: 'shield-alt',
    guaranteedDrop: {type: 'boost', multiplier: 2, duration: 60},
  },
  {
    wave: 97,
    id: 'war_machine',
    name: 'War Machine',
    health: 750000,
    reward: 150000,
    timerSeconds: 120,
    color: '#8B0000',
    iconName: 'cogs',
    guaranteedDrop: {type: 'boost', multiplier: 3, duration: 60},
  },
  {
    wave: 98,
    id: 'omega_destroyer',
    name: 'Omega Destroyer',
    health: 1000000,
    reward: 200000,
    timerSeconds: 150,
    color: '#4B0082',
    iconName: 'bomb',
    guaranteedDrop: {type: 'boost', multiplier: 2, duration: 90},
  },
  {
    wave: 99,
    id: 'apex_predator',
    name: 'Apex Predator',
    health: 1500000,
    reward: 300000,
    timerSeconds: 150,
    color: '#2F4F4F',
    iconName: 'skull',
    guaranteedDrop: {type: 'boost', multiplier: 3, duration: 90},
  },
  {
    wave: 100,
    id: 'the_architect',
    name: 'The Architect',
    health: 2500000,
    reward: 500000,
    timerSeconds: 180,
    color: '#FFD700',
    iconName: 'crown',
    guaranteedDrop: {type: 'blueprints', amount: 25},
  },
];

export const getFinalBossForWave = (wave: number): FinalBoss | undefined => {
  return FINAL_BOSSES.find(b => b.wave === wave);
};

export const isFinalBossWave = (wave: number): boolean => {
  return wave >= 96 && wave <= 100;
};

export const BOSS_CONFIG = {
  healthMultiplier: 2.0,
  rewardMultiplier: 4.0,
  timerMultiplier: 1.5,
  waveInterval: 10,
};
