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

// Engineering Bay (cost reduction)
export const ENGINEERING_BONUS_PER_LEVEL = 0.02;
export const ENGINEERING_MAX_DISCOUNT = 0.5; // 50% max discount

// Shield Generator (wave timer extension)
export const SHIELD_BONUS_PER_LEVEL = 0.5; // seconds
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

// =============================================================================
// ENGINEERING BAY FORMULAS
// =============================================================================

/**
 * Calculate Engineering Bay cost reduction multiplier.
 *
 * Formula: 1 - min(0.5, tierBaseDiscount + (level - 1) * 0.02)
 *
 * Returns a multiplier to apply to upgrade costs (e.g., 0.85 = 15% discount).
 *
 * Examples (Tier 1 = 10% base discount):
 * - Level 1: 0.90 (10% off)
 * - Level 5: 0.82 (18% off)
 * - Level 10: 0.72 (28% off)
 *
 * Capped at 50% discount (0.5 multiplier).
 */
export function calculateEngineeringDiscount(
  tierBaseDiscount: number,
  level: number,
): number {
  const levelBonus = (level - 1) * ENGINEERING_BONUS_PER_LEVEL;
  const discountPercent = tierBaseDiscount + levelBonus;
  const cappedDiscount = Math.min(ENGINEERING_MAX_DISCOUNT, discountPercent);
  return 1 - cappedDiscount;
}

// =============================================================================
// SHIELD GENERATOR FORMULAS
// =============================================================================

/**
 * Calculate Shield Generator wave timer bonus.
 *
 * Formula: min(30, tierBaseBonus + (level - 1) * 0.5)
 *
 * Examples (Tier 1 = 5s base):
 * - Level 1: 5s
 * - Level 5: 7s
 * - Level 10: 9.5s
 *
 * Capped at 30 seconds.
 */
export function calculateShieldGeneratorBonus(
  tierBaseBonus: number,
  level: number,
): number {
  const levelBonus = (level - 1) * SHIELD_BONUS_PER_LEVEL;
  return Math.min(SHIELD_MAX_BONUS_SECONDS, tierBaseBonus + levelBonus);
}

// =============================================================================
// SPECIAL EFFECT FORMULAS
// =============================================================================

// Scrap Find configuration
export const SCRAP_FIND_BASE_COOLDOWN_MS = 30000;
export const SCRAP_FIND_COOLDOWN_PER_LEVEL_MS = 500;
export const SCRAP_FIND_COOLDOWN_PER_WORKER_MS = 200;
export const SCRAP_FIND_MIN_COOLDOWN_MS = 10000;
export const SCRAP_FIND_BASE_REWARD_PERCENT = 0.20;
export const SCRAP_FIND_TIER_MULTIPLIERS = [1.0, 1.25, 1.5, 1.75, 2.0];

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
 * Formula: waveReward * 0.20 * tierMultiplier * prestigeMultipliers
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

// Burst Boost configuration
export const BURST_BOOST_BASE_CHANCE = 0.02;
export const BURST_BOOST_CHANCE_PER_LEVEL = 0.005;
export const BURST_BOOST_CHANCE_PER_WORKER = 0.002;
export const BURST_BOOST_CHANCE_PER_TIER = 0.02;
export const BURST_BOOST_MAX_TOTAL_CHANCE = 0.50;

/**
 * Calculate Burst Boost chance from Training Facility.
 *
 * Formula: baseChance + levelBonus + workerBonus + tierBonus (capped at 50%)
 */
export function calculateBurstBoostChance(
  level: number,
  assignedBuilders: number,
  tier: number,
): number {
  const levelBonus = (level - 1) * BURST_BOOST_CHANCE_PER_LEVEL;
  const workerBonus = assignedBuilders * BURST_BOOST_CHANCE_PER_WORKER;
  const tierBonus = (tier - 1) * BURST_BOOST_CHANCE_PER_TIER;
  const totalChance = BURST_BOOST_BASE_CHANCE + levelBonus + workerBonus + tierBonus;
  return Math.min(BURST_BOOST_MAX_TOTAL_CHANCE, totalChance);
}

// Critical Weakness configuration
export const CRITICAL_WEAKNESS_BASE_CHANCE = 0.05;
export const CRITICAL_WEAKNESS_CHANCE_PER_LEVEL = 0.01;
export const CRITICAL_WEAKNESS_CHANCE_PER_WORKER = 0.005;
export const CRITICAL_WEAKNESS_CHANCE_PER_TIER = 0.03;
export const CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER = 5.0;

/**
 * Calculate Critical Weakness chance from Weak Point Scanner.
 */
export function calculateCriticalWeaknessChance(
  level: number,
  assignedBuilders: number,
  tier: number,
): number {
  const levelBonus = (level - 1) * CRITICAL_WEAKNESS_CHANCE_PER_LEVEL;
  const workerBonus = assignedBuilders * CRITICAL_WEAKNESS_CHANCE_PER_WORKER;
  const tierBonus = (tier - 1) * CRITICAL_WEAKNESS_CHANCE_PER_TIER;
  return CRITICAL_WEAKNESS_BASE_CHANCE + levelBonus + workerBonus + tierBonus;
}

// Wave Extend configuration
export const WAVE_EXTEND_BASE_CHANCE = 0.10;
export const WAVE_EXTEND_CHANCE_PER_LEVEL = 0.02;
export const WAVE_EXTEND_CHANCE_PER_TIER = 0.05;
export const WAVE_EXTEND_BONUS_TIME_PERCENT = 0.50;
export const WAVE_EXTEND_MAX_BONUS_SECONDS = 30;

/**
 * Calculate Wave Extend chance from Shield Generator.
 */
export function calculateWaveExtendChance(level: number, tier: number): number {
  const levelBonus = (level - 1) * WAVE_EXTEND_CHANCE_PER_LEVEL;
  const tierBonus = (tier - 1) * WAVE_EXTEND_CHANCE_PER_TIER;
  return WAVE_EXTEND_BASE_CHANCE + levelBonus + tierBonus;
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
