/**
 * Economy Formulas
 *
 * All formulas related to costs and economic mechanics, including:
 * - Building upgrade costs
 * - Engineering Bay discount
 * - Shield Generator wave timer bonus
 * - Special effect cooldowns and amounts
 */

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

// Engineering Bay (cost reduction) - workers are primary scaling factor
export const ENGINEERING_BONUS_PER_LEVEL = 0.008;
export const ENGINEERING_BONUS_PER_WORKER = 0.008;
export const ENGINEERING_MAX_DISCOUNT = 0.5; // 50% max discount

// Shield Generator (wave timer extension)
export const SHIELD_BONUS_PER_LEVEL = 0.4; // seconds
export const SHIELD_BONUS_PER_WORKER = 0.15; // seconds per worker
export const SHIELD_MAX_BONUS_SECONDS = 30;

// =============================================================================
// BUILDING UPGRADE COST FORMULAS
// =============================================================================

/**
 * Calculate building upgrade cost.
 *
 * Formula: baseCost * (costMultiplier ^ (currentLevel - 1))
 *
 * Examples (baseCost=100, multiplier=1.18):
 * - Level 1->2: 100
 * - Level 5->6: 193
 * - Level 10->11: 435
 * - Level 20->21: 2,179
 */
export function calculateUpgradeCost(
  baseCost: number,
  costMultiplier: number,
  currentLevel: number,
): number {
  return Math.floor(baseCost * Math.pow(costMultiplier, currentLevel - 1));
}

// Alias for clarity when called from Building.ts
export const calculateBuildingUpgradeCost = calculateUpgradeCost;

// =============================================================================
// BUILDING EVOLUTION COST FORMULAS
// =============================================================================

/**
 * Evolution cost multiplier per tier.
 * Higher tiers cost significantly more to evolve into.
 */
export const EVOLUTION_COST_MULTIPLIERS = [
  0,    // Tier 1 - no cost (starting tier)
  5,    // Tier 2 - 5x the next tier's base cost
  10,   // Tier 3 - 10x the next tier's base cost
  20,   // Tier 4 - 20x the next tier's base cost
  50,   // Tier 5 - 50x the next tier's base cost
];

/**
 * Calculate evolution cost to evolve a building to the next tier.
 *
 * Formula: nextTierBaseCost * tierMultiplier
 *
 * Examples:
 * - Evolve to Tier 2 (baseCost 400): 400 * 5 = 2,000
 * - Evolve to Tier 3 (baseCost 3000): 3000 * 10 = 30,000
 * - Evolve to Tier 4 (baseCost 25000): 25000 * 20 = 500,000
 * - Evolve to Tier 5 (baseCost 300000): 300000 * 50 = 15,000,000
 */
export function calculateEvolutionCost(
  nextTierBaseCost: number,
  targetTier: number,
): number {
  const multiplier = EVOLUTION_COST_MULTIPLIERS[targetTier - 1] ?? 1;
  return Math.floor(nextTierBaseCost * multiplier);
}

// =============================================================================
// ENGINEERING BAY FORMULAS
// =============================================================================

/**
 * Calculate Engineering Bay cost reduction multiplier.
 *
 * Formula: 1 - min(0.5, tierBaseDiscount + (level - 1) * levelBonus + workers * workerBonus)
 * Workers are primary scaling factor (equal to level bonus).
 *
 * Returns a multiplier to apply to upgrade costs (e.g., 0.85 = 15% discount).
 *
 * Examples (Tier 1 = 8% base discount):
 * - Level 1, 0 workers: 0.92 (8% off)
 * - Level 10, 10 workers: 0.778 (22.2% off)
 * - Level 25, 50 workers: 0.50 (50% off, capped)
 *
 * Capped at 50% discount (0.5 multiplier).
 */
export function calculateEngineeringDiscount(
  tierBaseDiscount: number,
  level: number,
  assignedWorkers: number = 0,
): number {
  const levelBonus = (level - 1) * ENGINEERING_BONUS_PER_LEVEL;
  const workerBonus = assignedWorkers * ENGINEERING_BONUS_PER_WORKER;
  const discountPercent = tierBaseDiscount + levelBonus + workerBonus;
  const cappedDiscount = Math.min(ENGINEERING_MAX_DISCOUNT, discountPercent);
  return 1 - cappedDiscount;
}

// =============================================================================
// SHIELD GENERATOR FORMULAS
// =============================================================================

/**
 * Calculate Shield Generator wave timer bonus.
 *
 * Formula: min(30, tierBaseBonus + (level - 1) * levelBonus + workers * workerBonus)
 * Workers provide meaningful scaling (0.15s per worker).
 *
 * Examples (Tier 1 = 3s base):
 * - Level 1, 0 workers: 3s
 * - Level 10, 10 workers: 8.1s
 * - Level 25, 50 workers: 20.1s
 *
 * Capped at 30 seconds.
 */
export function calculateShieldGeneratorBonus(
  tierBaseBonus: number,
  level: number,
  assignedWorkers: number = 0,
): number {
  const levelBonus = (level - 1) * SHIELD_BONUS_PER_LEVEL;
  const workerBonus = assignedWorkers * SHIELD_BONUS_PER_WORKER;
  return Math.min(SHIELD_MAX_BONUS_SECONDS, tierBaseBonus + levelBonus + workerBonus);
}

// =============================================================================
// SPECIAL EFFECT FORMULAS
// =============================================================================

// Scrap Find configuration - workers reduce cooldown significantly
export const SCRAP_FIND_BASE_COOLDOWN_MS = 25000;
export const SCRAP_FIND_COOLDOWN_PER_LEVEL_MS = 300;
export const SCRAP_FIND_COOLDOWN_PER_WORKER_MS = 250;
export const SCRAP_FIND_MIN_COOLDOWN_MS = 8000;
/** Base reward is 100% of wave reward (feels impactful) */
export const SCRAP_FIND_BASE_REWARD_PERCENT = 1.0;
/** Tier multipliers scale reward further at higher tiers */
export const SCRAP_FIND_TIER_MULTIPLIERS = [1.0, 1.5, 2.0, 2.5, 3.0];

/**
 * Calculate Scrap Find cooldown.
 *
 * Formula: max(minCooldown, baseCooldown - levelReduction - workerReduction)
 */
export function calculateScrapFindCooldown(
  level: number,
  assignedBuilders: number,
): number {
  const levelReduction = (level - 1) * SCRAP_FIND_COOLDOWN_PER_LEVEL_MS;
  const workerReduction = assignedBuilders * SCRAP_FIND_COOLDOWN_PER_WORKER_MS;
  const cooldown = SCRAP_FIND_BASE_COOLDOWN_MS - levelReduction - workerReduction;
  return Math.max(SCRAP_FIND_MIN_COOLDOWN_MS, cooldown);
}

/**
 * Calculate Scrap Find reward amount.
 *
 * Formula: waveReward * 1.0 * tierMultiplier * prestigeMultipliers
 * Base is 100% of wave reward to feel impactful vs passive production.
 */
export function calculateScrapFindAmount(
  waveReward: number,
  tier: number,
  prestigeProductionBonus: number = 1,
  prestigeWaveRewardBonus: number = 1,
): number {
  const tierMultiplier = SCRAP_FIND_TIER_MULTIPLIERS[tier - 1] ?? 1.0;
  const baseAmount = waveReward * SCRAP_FIND_BASE_REWARD_PERCENT;
  return Math.floor(baseAmount * tierMultiplier * prestigeProductionBonus * prestigeWaveRewardBonus);
}

// Burst Boost configuration - workers are primary scaling factor
export const BURST_BOOST_BASE_CHANCE = 0.03;
export const BURST_BOOST_CHANCE_PER_LEVEL = 0.004;
export const BURST_BOOST_CHANCE_PER_WORKER = 0.008;
export const BURST_BOOST_CHANCE_PER_TIER = 0.025;
export const BURST_BOOST_MAX_TOTAL_CHANCE = 0.60;

/**
 * Calculate Burst Boost chance from Training Facility.
 *
 * Workers are PRIMARY scaling factor (0.008 vs 0.004 per level).
 * With 50 workers + max prestige (burst_chance) + level 25 + tier 5:
 * 0.03 + (24 * 0.004) + (50 * 0.008) + (4 * 0.025) + 0.23 = ~60% (capped)
 *
 * Note: The prestige burst_chance upgrade adds to this chance directly.
 */
export function calculateBurstBoostChance(
  level: number,
  assignedBuilders: number,
  tier: number,
  prestigeBurstChance: number = 0,
): number {
  const levelBonus = (level - 1) * BURST_BOOST_CHANCE_PER_LEVEL;
  const workerBonus = assignedBuilders * BURST_BOOST_CHANCE_PER_WORKER;
  const tierBonus = (tier - 1) * BURST_BOOST_CHANCE_PER_TIER;
  const totalChance = BURST_BOOST_BASE_CHANCE + levelBonus + workerBonus + tierBonus + prestigeBurstChance;
  return Math.min(BURST_BOOST_MAX_TOTAL_CHANCE, totalChance);
}

// Critical Weakness configuration - workers are primary scaling factor
export const CRITICAL_WEAKNESS_BASE_CHANCE = 0.05;
export const CRITICAL_WEAKNESS_CHANCE_PER_LEVEL = 0.006;
export const CRITICAL_WEAKNESS_CHANCE_PER_WORKER = 0.012;
export const CRITICAL_WEAKNESS_CHANCE_PER_TIER = 0.04;
export const CRITICAL_WEAKNESS_MAX_CHANCE = 0.95;
/**
 * Critical weak points (gold) deal this multiplier on top of normal weak point damage.
 * E.g., 2.0 means critical weak points deal 2x the damage of regular weak points.
 */
export const CRITICAL_WEAKNESS_BONUS_MULTIPLIER = 2.0;
/**
 * @deprecated Use calculateWeakPointDamageMultiplier from combat.ts instead.
 * This constant is kept for backward compatibility but the actual multiplier
 * is now dynamically calculated based on tier, level, and workers.
 */
export const CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER = 4.0; // Max cap value

/**
 * Calculate Critical Weakness chance from Weak Point Scanner.
 *
 * Workers are PRIMARY scaling factor (0.012 vs 0.006 per level).
 * With 50 workers + max prestige (+12%) + level 25 + tier 5:
 * 0.05 + (24 * 0.006) + (50 * 0.012) + (4 * 0.04) + 0.12 = ~95%
 */
export function calculateCriticalWeaknessChance(
  level: number,
  assignedBuilders: number,
  tier: number,
  prestigeBonus: number = 0,
): number {
  const levelBonus = (level - 1) * CRITICAL_WEAKNESS_CHANCE_PER_LEVEL;
  const workerBonus = assignedBuilders * CRITICAL_WEAKNESS_CHANCE_PER_WORKER;
  const tierBonus = (tier - 1) * CRITICAL_WEAKNESS_CHANCE_PER_TIER;
  const total = CRITICAL_WEAKNESS_BASE_CHANCE + levelBonus + workerBonus + tierBonus + prestigeBonus;
  return Math.min(CRITICAL_WEAKNESS_MAX_CHANCE, total);
}

// Wave Extend configuration - workers are primary scaling factor
export const WAVE_EXTEND_BASE_CHANCE = 0.08;
export const WAVE_EXTEND_CHANCE_PER_LEVEL = 0.008;
export const WAVE_EXTEND_CHANCE_PER_WORKER = 0.012;
export const WAVE_EXTEND_CHANCE_PER_TIER = 0.04;
export const WAVE_EXTEND_MAX_CHANCE = 0.85;
export const WAVE_EXTEND_BONUS_TIME_PERCENT = 0.50;
export const WAVE_EXTEND_MAX_BONUS_SECONDS = 30;

/**
 * Calculate Wave Extend chance from Shield Generator.
 *
 * Workers are PRIMARY scaling factor (0.012 vs 0.008 per level).
 * With 50 workers + max prestige (+7.2%) + level 25 + tier 5:
 * 0.08 + (24 * 0.008) + (50 * 0.012) + (4 * 0.04) + 0.072 = ~85%
 */
export function calculateWaveExtendChance(
  level: number,
  tier: number,
  assignedWorkers: number = 0,
  prestigeBonus: number = 0,
): number {
  const levelBonus = (level - 1) * WAVE_EXTEND_CHANCE_PER_LEVEL;
  const workerBonus = assignedWorkers * WAVE_EXTEND_CHANCE_PER_WORKER;
  const tierBonus = (tier - 1) * WAVE_EXTEND_CHANCE_PER_TIER;
  const total = WAVE_EXTEND_BASE_CHANCE + levelBonus + workerBonus + tierBonus + prestigeBonus;
  return Math.min(WAVE_EXTEND_MAX_CHANCE, total);
}

/**
 * Calculate Wave Extend bonus seconds.
 *
 * Formula: min(maxBonus, baseWaveTime * 0.50)
 */
export function calculateWaveExtendBonus(baseWaveTime: number): number {
  const bonusTime = baseWaveTime * WAVE_EXTEND_BONUS_TIME_PERCENT;
  return Math.min(WAVE_EXTEND_MAX_BONUS_SECONDS, bonusTime);
}
