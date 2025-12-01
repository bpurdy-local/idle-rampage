import {EnemyTier} from '../models/Enemy';

export const ENEMY_TIERS: EnemyTier[] = [
  {
    id: 'scrap_bot',
    name: 'Scrap Bot',
    minWave: 1,
    maxWave: 12,
    // Wave 1: ~50 taps at 8 dmg = 400 HP, ~7.5s pure tapping
    // Wave 12: 400 * 1.55^11 = ~35,000 HP - requires building upgrades
    baseHealth: 400,
    healthMultiplierPerWave: 1.55,
    baseReward: 20,
    rewardMultiplierPerWave: 1.20,
    color: '#8B8B8B',
    iconName: 'robot',
  },
  {
    id: 'drone',
    name: 'Drone',
    minWave: 13,
    maxWave: 28,
    // Continues from scrap_bot - player should have ~level 5-10 buildings
    baseHealth: 50000,
    healthMultiplierPerWave: 1.45,
    baseReward: 120,
    rewardMultiplierPerWave: 1.16,
    color: '#4169E1',
    iconName: 'plane',
  },
  {
    id: 'loader',
    name: 'Loader',
    minWave: 29,
    maxWave: 48,
    // Mid-game wall - requires strategic building investment
    baseHealth: 800000,
    healthMultiplierPerWave: 1.38,
    baseReward: 600,
    rewardMultiplierPerWave: 1.14,
    color: '#FF8C00',
    iconName: 'truck',
  },
  {
    id: 'mech',
    name: 'Mech',
    minWave: 49,
    maxWave: 72,
    // Late game - prestige bonuses start helping significantly
    baseHealth: 15000000,
    healthMultiplierPerWave: 1.30,
    baseReward: 4000,
    rewardMultiplierPerWave: 1.12,
    color: '#B22222',
    iconName: 'shield',
  },
  {
    id: 'ai_unit',
    name: 'AI Unit',
    minWave: 73,
    maxWave: 999,
    // End game - requires multiple prestiges
    baseHealth: 300000000,
    healthMultiplierPerWave: 1.22,
    baseReward: 30000,
    rewardMultiplierPerWave: 1.10,
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
