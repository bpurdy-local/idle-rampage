/**
 * Prestige Formulas
 *
 * All formulas related to the prestige system, including:
 * - Blueprint earning
 * - Prestige upgrade costs and effects
 * - Builder purchase costs
 * - Starting scrap bonus
 */

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

// Blueprint earning - gradual curve to ~1000 at wave 100 (capped at 1000)
export const BASE_BLUEPRINT_WAVE = 30;
export const BASE_BLUEPRINTS_REWARD = 10;
export const BLUEPRINTS_PER_WAVE_ABOVE_BASE = 7;
export const BLUEPRINT_WAVE_SCALING = 1.0195;
export const MAX_BLUEPRINTS_PER_PRESTIGE = 1000;

// Builder purchase costs (escalating tiers, max 500)
export const BUILDER_COST_TIER_1 = 5; // Builders 1-10
export const BUILDER_COST_TIER_2 = 10; // Builders 11-25
export const BUILDER_COST_TIER_3 = 25; // Builders 26-50
export const BUILDER_COST_TIER_4 = 50; // Builders 51-100
export const BUILDER_COST_TIER_5 = 100; // Builders 101-150
export const BUILDER_COST_TIER_6 = 250; // Builders 151-200
export const BUILDER_COST_TIER_7 = 500; // Builders 201-250

// Starting scrap bonus
export const STARTING_SCRAP_PER_WAVE_PER_LEVEL = 100;

// Prestige ranks
export const PRESTIGE_RANKS = [
  'Rookie',
  'Scavenger',
  'Mechanic',
  'Engineer',
  'Master',
  'Elite',
  'Champion',
  'Legend',
  'Mythic',
  'Transcendent',
] as const;

// =============================================================================
// BLUEPRINT EARNING FORMULAS
// =============================================================================

/**
 * Check if player can prestige.
 *
 * Requirement: Wave 30+
 */
export function canPrestige(waveReached: number): boolean {
  return waveReached >= BASE_BLUEPRINT_WAVE;
}

/**
 * Calculate blueprints earned from prestiging.
 *
 * Formula:
 * - Below wave 30: 0 blueprints
 * - Wave 30: 10 blueprints
 * - Each wave above 30: +7 * (1.0195 ^ wavesAbove30)
 * - Capped at 1000 blueprints (endless mode gives no extra)
 *
 * Examples:
 * - Wave 30: 10 blueprints
 * - Wave 50: ~170 blueprints
 * - Wave 75: ~485 blueprints
 * - Wave 100: ~1000 blueprints (capped)
 */
export function calculateBlueprintsEarned(waveReached: number): number {
  if (waveReached < BASE_BLUEPRINT_WAVE) return 0;

  let blueprints = BASE_BLUEPRINTS_REWARD;
  const wavesAboveBase = waveReached - BASE_BLUEPRINT_WAVE;

  for (let i = 1; i <= wavesAboveBase; i++) {
    blueprints += Math.floor(
      BLUEPRINTS_PER_WAVE_ABOVE_BASE * Math.pow(BLUEPRINT_WAVE_SCALING, i - 1),
    );
  }

  return Math.min(blueprints, MAX_BLUEPRINTS_PER_PRESTIGE);
}

// =============================================================================
// PRESTIGE UPGRADE FORMULAS
// =============================================================================

/**
 * Calculate cost of next prestige upgrade level.
 *
 * Formula: baseCost * (costMultiplier ^ currentLevel)
 */
export function calculateUpgradeCost(
  baseCost: number,
  costMultiplier: number,
  currentLevel: number,
): number {
  return Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
}

/**
 * Calculate prestige upgrade effect at a given level.
 *
 * Formula: baseEffect + (effectPerLevel * level)
 *
 * Returns 1 (neutral) at level 0 for multiplier types.
 */
export function calculateUpgradeEffect(
  baseEffect: number,
  effectPerLevel: number,
  level: number,
): number {
  if (level === 0) return 1;
  return baseEffect + effectPerLevel * level;
}

// =============================================================================
// BUILDER PURCHASE FORMULAS
// =============================================================================

/**
 * Calculate cost to purchase a builder with blueprints.
 *
 * Escalating pricing (max 500):
 * - Builders 1-10: 5 blueprints
 * - Builders 11-25: 10 blueprints
 * - Builders 26-50: 25 blueprints
 * - Builders 51-100: 50 blueprints
 * - Builders 101-150: 100 blueprints
 * - Builders 151-200: 250 blueprints
 * - Builders 201-250: 500 blueprints
 */
export function calculateBuilderPurchaseCost(buildersPurchased: number): number {
  if (buildersPurchased < 10) return BUILDER_COST_TIER_1;
  if (buildersPurchased < 25) return BUILDER_COST_TIER_2;
  if (buildersPurchased < 50) return BUILDER_COST_TIER_3;
  if (buildersPurchased < 100) return BUILDER_COST_TIER_4;
  if (buildersPurchased < 150) return BUILDER_COST_TIER_5;
  if (buildersPurchased < 200) return BUILDER_COST_TIER_6;
  return BUILDER_COST_TIER_7;
}

// =============================================================================
// STARTING SCRAP BONUS FORMULAS
// =============================================================================

/**
 * Calculate starting scrap bonus from prestige upgrade.
 *
 * Formula: highestWave * 50 * upgradeLevel
 *
 * Examples (with max level 10):
 * - Wave 100, Level 5: 25,000 scrap
 * - Wave 100, Level 10: 50,000 scrap
 * - Wave 200, Level 10: 100,000 scrap
 */
export function calculateStartingScrapBonus(
  upgradeLevel: number,
  highestWave: number,
): number {
  if (upgradeLevel === 0) return 0;
  return Math.floor(highestWave * STARTING_SCRAP_PER_WAVE_PER_LEVEL * upgradeLevel);
}

// =============================================================================
// PRESTIGE RANK FORMULAS
// =============================================================================

/**
 * Calculate prestige level based on total blueprints earned.
 *
 * Uses log10 scaling for gradual progression.
 */
export function calculatePrestigeLevel(totalBlueprintsEarned: number): number {
  if (totalBlueprintsEarned < 10) return 0;
  return Math.floor(Math.log10(totalBlueprintsEarned));
}

/**
 * Get prestige rank name.
 */
export function getPrestigeRank(level: number): string {
  return PRESTIGE_RANKS[Math.min(level, PRESTIGE_RANKS.length - 1)];
}
