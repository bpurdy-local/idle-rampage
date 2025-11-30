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

// Blueprint earning
export const BASE_BLUEPRINT_WAVE = 100;
export const BASE_BLUEPRINTS_REWARD = 100;
export const BLUEPRINTS_PER_WAVE_ABOVE_BASE = 10;
export const BLUEPRINT_WAVE_SCALING = 1.10;

// Builder purchase costs (escalating)
export const BUILDER_COST_TIER_1 = 30; // First 5 builders
export const BUILDER_COST_TIER_2 = 50; // Builders 6-10
export const BUILDER_COST_TIER_3 = 75; // Builders 11-20
export const BUILDER_COST_TIER_4 = 100; // Builders 21+

// Starting scrap bonus
export const STARTING_SCRAP_PER_WAVE_PER_LEVEL = 50;

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
 * Requirement: Wave 100+
 */
export function canPrestige(waveReached: number): boolean {
  return waveReached >= BASE_BLUEPRINT_WAVE;
}

/**
 * Calculate blueprints earned from prestiging.
 *
 * Formula:
 * - Below wave 100: 0 blueprints
 * - Wave 100: 100 blueprints
 * - Each wave above 100: +10 * (1.1 ^ wavesAbove100)
 *
 * Examples:
 * - Wave 100: 100 blueprints
 * - Wave 110: 259 blueprints
 * - Wave 120: 475 blueprints
 * - Wave 150: 1,640 blueprints
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

  return blueprints;
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
 * Escalating pricing:
 * - Builders 1-5: 30 blueprints
 * - Builders 6-10: 50 blueprints
 * - Builders 11-20: 75 blueprints
 * - Builders 21+: 100 blueprints
 */
export function calculateBuilderPurchaseCost(buildersPurchased: number): number {
  if (buildersPurchased < 5) return BUILDER_COST_TIER_1;
  if (buildersPurchased < 10) return BUILDER_COST_TIER_2;
  if (buildersPurchased < 20) return BUILDER_COST_TIER_3;
  return BUILDER_COST_TIER_4;
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
