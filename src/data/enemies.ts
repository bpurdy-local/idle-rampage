import {EnemyTier} from '../models/Enemy';

export const ENEMY_TIERS: EnemyTier[] = [
  {
    id: 'scrap_bot',
    name: 'Scrap Bot',
    minWave: 1,
    maxWave: 12,
    // Wave 1: ~27 taps at 15 dmg = 400 HP
    // Wave 12: 400 * 1.25^11 = ~5,400 HP
    baseHealth: 400,
    healthMultiplierPerWave: 1.25,
    baseReward: 20,
    rewardMultiplierPerWave: 1.18,
    color: '#8B8B8B',
    iconName: 'robot',
  },
  {
    id: 'drone',
    name: 'Drone',
    minWave: 13,
    maxWave: 28,
    // Continues from scrap_bot - player should have ~level 5-10 buildings
    // Wave 13: 8,000 HP, Wave 28: 8,000 * 1.20^15 = ~123,000 HP
    baseHealth: 8000,
    healthMultiplierPerWave: 1.20,
    baseReward: 80,
    rewardMultiplierPerWave: 1.15,
    color: '#4169E1',
    iconName: 'plane',
  },
  {
    id: 'loader',
    name: 'Loader',
    minWave: 29,
    maxWave: 48,
    // Mid-game - requires strategic building investment
    // Wave 29: 200,000 HP, Wave 48: 200,000 * 1.18^19 = ~4.5M HP
    baseHealth: 200000,
    healthMultiplierPerWave: 1.18,
    baseReward: 400,
    rewardMultiplierPerWave: 1.12,
    color: '#FF8C00',
    iconName: 'truck',
  },
  {
    id: 'mech',
    name: 'Mech',
    minWave: 49,
    maxWave: 72,
    // Late game - prestige bonuses start helping significantly
    // Wave 49: 6M HP, Wave 72: 6M * 1.15^23 = ~140M HP
    baseHealth: 6000000,
    healthMultiplierPerWave: 1.15,
    baseReward: 2500,
    rewardMultiplierPerWave: 1.10,
    color: '#B22222',
    iconName: 'shield',
  },
  {
    id: 'ai_unit',
    name: 'AI Unit',
    minWave: 73,
    maxWave: 999,
    // End game - requires multiple prestiges
    // Wave 73: 200M HP, scales slower for extended play
    baseHealth: 200000000,
    healthMultiplierPerWave: 1.12,
    baseReward: 15000,
    rewardMultiplierPerWave: 1.08,
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
  timerMultiplier: 1.8,
  waveInterval: 10,
};
