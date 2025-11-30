export interface ScrapFindConfig {
  baseCooldownMs: number;
  cooldownPerLevelMs: number;
  cooldownPerWorkerMs: number;
  minCooldownMs: number;
  baseRewardPercent: number;
  tierMultipliers: number[];
}

export interface BurstBoostConfig {
  baseChance: number;
  chancePerLevel: number;
  chancePerWorker: number;
  chancePerTier: number;
  maxTotalChance: number;
}

export interface CriticalWeaknessConfig {
  baseChance: number;
  chancePerLevel: number;
  chancePerWorker: number;
  chancePerTier: number;
  damageMultiplier: number;
}

export interface WaveExtendConfig {
  baseChance: number;
  chancePerLevel: number;
  chancePerTier: number;
  bonusTimePercent: number;
  maxBonusSeconds: number;
}

export interface SpecialEffectBalanceConfig {
  scrapFind: ScrapFindConfig;
  burstBoost: BurstBoostConfig;
  criticalWeakness: CriticalWeaknessConfig;
  waveExtend: WaveExtendConfig;
  tierBonusPercent: number;
}

export const SPECIAL_EFFECT_CONFIG: SpecialEffectBalanceConfig = {
  scrapFind: {
    // Base cooldown in milliseconds (30 seconds)
    baseCooldownMs: 30000,
    // Cooldown reduction per building level (500ms = 0.5s per level)
    cooldownPerLevelMs: 500,
    // Cooldown reduction per assigned worker (200ms = 0.2s per worker)
    cooldownPerWorkerMs: 200,
    // Minimum cooldown floor (10 seconds)
    minCooldownMs: 10000,
    // Base reward as percent of wave completion reward (20%)
    baseRewardPercent: 0.20,
    // Multiplier per tier: [Tier1, Tier2, Tier3, Tier4, Tier5]
    tierMultipliers: [1.0, 1.25, 1.5, 1.75, 2.0],
  },

  burstBoost: {
    // Base burst chance bonus at Tier 1 (2%)
    baseChance: 0.02,
    // Additional chance per building level (0.5%)
    chancePerLevel: 0.005,
    // Additional chance per assigned worker (0.2%)
    chancePerWorker: 0.002,
    // Additional chance per evolution tier above 1 (2%)
    chancePerTier: 0.02,
    // Maximum total burst chance cap (50%)
    maxTotalChance: 0.50,
  },

  criticalWeakness: {
    // Base chance for weak point to be critical at Tier 1 (5%)
    baseChance: 0.05,
    // Additional chance per building level (1%)
    chancePerLevel: 0.01,
    // Additional chance per assigned worker (0.5%)
    chancePerWorker: 0.005,
    // Additional chance per evolution tier above 1 (3%)
    chancePerTier: 0.03,
    // Damage multiplier for critical weak points (5x)
    damageMultiplier: 5.0,
  },

  waveExtend: {
    // Base chance to extend wave at Tier 1 (10%)
    baseChance: 0.10,
    // Additional chance per building level (2%)
    chancePerLevel: 0.02,
    // Additional chance per evolution tier above 1 (5%)
    chancePerTier: 0.05,
    // Bonus time as percent of base wave time (50%)
    bonusTimePercent: 0.50,
    // Maximum bonus seconds cap
    maxBonusSeconds: 30,
  },

  // Bonus per evolution tier for general scaling (2% per tier above 1)
  tierBonusPercent: 0.02,
};
