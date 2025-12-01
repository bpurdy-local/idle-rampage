/**
 * Combat Formulas
 *
 * All formulas related to damage dealing, including:
 * - Tap damage calculation
 * - Auto damage from buildings
 * - Burst attack mechanics
 * - Weak point damage multipliers
 * - Scrap earned from damage
 */

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

/** Base tap damage before any modifiers */
export const BASE_TAP_DAMAGE = 500_000;

/** Minimum tap variance (80% of base) */
export const TAP_VARIANCE_MIN = 0.8;

/** Maximum tap variance (120% of base) */
export const TAP_VARIANCE_MAX = 1.2;

/** Default burst attack chance (0% - burst only available from Training Facility) */
export const DEFAULT_BURST_CHANCE = 0;

/** Default burst attack damage multiplier (6x) */
export const DEFAULT_BURST_MULTIPLIER = 6;

/**
 * Percentage of enemy reward available from dealing damage.
 * Remaining 50% comes from wave completion.
 *
 * DESIGN NOTE: 50/50 split creates balanced incentives:
 * - Rewards maximizing DPS and active play
 * - Rewards finishing waves efficiently
 */
export const DAMAGE_SCRAP_PERCENT = 0.5;

/** Tap cooldown in milliseconds (prevents auto-clicker abuse) */
export const TAP_COOLDOWN_MS = 150;

// Weak point configuration - workers are primary scaling factor
export const WEAK_POINT_BASE_MULTIPLIER = 1.5;
export const WEAK_POINT_MULTIPLIER_PER_TIER = 0.5;
export const WEAK_POINT_MULTIPLIER_PER_LEVEL = 0.02;
export const WEAK_POINT_MULTIPLIER_PER_WORKER = 0.4;
export const WEAK_POINT_MAX_MULTIPLIER = 15.0;

/**
 * DAMAGE STACKING RULE:
 * Critical (Weak Point) and Burst do NOT stack multiplicatively.
 * When both trigger, use: max(criticalMultiplier, burstMultiplier) + 0.5 * min(...)
 * This prevents exponential damage explosion.
 */
export const CRITICAL_BURST_STACK_BONUS = 0.5;

// =============================================================================
// TAP DAMAGE FORMULAS
// =============================================================================

/**
 * Calculate tap damage variance.
 *
 * Returns a random multiplier between 0.9 and 1.1 (90%-110%)
 */
export function calculateTapVariance(): number {
  return TAP_VARIANCE_MIN + Math.random() * (TAP_VARIANCE_MAX - TAP_VARIANCE_MIN);
}

/**
 * Calculate final tap damage.
 *
 * Formula: baseDamage * prestigeMultiplier * boostMultiplier * tierMultiplier * variance
 */
export function calculateTapDamage(
  baseTapDamage: number,
  prestigeTapPower: number,
  boostMultiplier: number,
  tierMultiplier: number,
): number {
  const variance = calculateTapVariance();
  return Math.floor(baseTapDamage * prestigeTapPower * boostMultiplier * tierMultiplier * variance);
}

// =============================================================================
// BURST ATTACK FORMULAS
// =============================================================================

/**
 * Check if a burst attack triggers and calculate its multiplier.
 *
 * @param burstChance - Base burst chance (0-1)
 * @param burstMultiplier - Base burst damage multiplier
 * @param prestigeBurstChance - Additional chance from prestige upgrades
 * @param prestigeBurstDamage - Damage multiplier from prestige upgrades
 * @param trainingFacilityBoost - Additional chance from Training Facility special effect
 */
export function checkBurstAttack(
  burstChance: number,
  burstMultiplier: number,
  prestigeBurstChance: number = 0,
  prestigeBurstDamage: number = 1,
  trainingFacilityBoost: number = 0,
): {triggered: boolean; multiplier: number} {
  const effectiveChance = burstChance + prestigeBurstChance + trainingFacilityBoost;
  const triggered = Math.random() < effectiveChance;
  const multiplier = triggered ? burstMultiplier * prestigeBurstDamage : 1;

  return {triggered, multiplier};
}

// =============================================================================
// WEAK POINT FORMULAS
// =============================================================================

/**
 * Calculate weak point damage multiplier based on scanner stats.
 *
 * Formula: base + (tier - 1) * tierBonus + (level - 1) * levelBonus + workers * workerBonus
 * Workers are the PRIMARY scaling factor (0.08 per worker vs 0.02 per level)
 *
 * Examples:
 * - Tier 1, Level 1, 0 workers: 1.5x
 * - Tier 1, Level 1, 10 workers: 2.3x
 * - Tier 3, Level 10, 20 workers: 4.28x
 * - Tier 5, Level 25, 50 workers: 8.0x (capped)
 */
export function calculateWeakPointDamageMultiplier(
  scannerTier: number,
  scannerLevel: number,
  assignedBuilders: number,
): number {
  const tierBonus = (scannerTier - 1) * WEAK_POINT_MULTIPLIER_PER_TIER;
  const levelBonus = (scannerLevel - 1) * WEAK_POINT_MULTIPLIER_PER_LEVEL;
  const workerBonus = assignedBuilders * WEAK_POINT_MULTIPLIER_PER_WORKER;

  const multiplier = WEAK_POINT_BASE_MULTIPLIER + tierBonus + levelBonus + workerBonus;
  return Math.min(WEAK_POINT_MAX_MULTIPLIER, multiplier);
}

/**
 * Calculate combined damage multiplier when both critical and burst trigger.
 *
 * Instead of multiplying (which causes exponential damage explosion),
 * we use: max(critical, burst) + 0.5 * min(critical, burst)
 *
 * Examples:
 * - Critical 2x, Burst 6x: 6 + 0.5*2 = 7x (not 12x)
 * - Critical 4x, Burst 6x: 6 + 0.5*4 = 8x (not 24x)
 */
export function calculateCombinedCriticalBurstMultiplier(
  criticalMultiplier: number,
  burstMultiplier: number,
): number {
  const maxMultiplier = Math.max(criticalMultiplier, burstMultiplier);
  const minMultiplier = Math.min(criticalMultiplier, burstMultiplier);
  return maxMultiplier + CRITICAL_BURST_STACK_BONUS * minMultiplier;
}

// =============================================================================
// SCRAP FROM DAMAGE FORMULAS
// =============================================================================

/**
 * Calculate scrap earned from dealing damage to an enemy.
 *
 * Formula: (enemyReward * 0.5) * (damage / maxHealth) * rewardMultiplier
 *
 * This means:
 * - 50% of enemy reward is available from damage
 * - Scrap is proportional to damage dealt vs max health
 * - Multiplied by any prestige/boost multipliers
 */
export function calculateScrapFromDamage(
  damage: number,
  enemyMaxHealth: number,
  enemyReward: number,
  rewardMultiplier: number = 1,
): number {
  if (damage <= 0 || enemyMaxHealth <= 0) return 0;

  const damageScrapPool = enemyReward * DAMAGE_SCRAP_PERCENT;
  const damagePercent = damage / enemyMaxHealth;
  const scrapEarned = damageScrapPool * damagePercent * rewardMultiplier;

  return Math.floor(scrapEarned);
}
