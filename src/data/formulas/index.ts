/**
 * Game Formulas Index
 *
 * Centralized exports for all game balance formulas.
 * Edit these files to tweak game balance:
 *
 * - production.ts: Resource generation, worker efficiency, wave bonuses
 * - combat.ts: Tap damage, burst attacks, weak points, scrap from damage
 * - progression.ts: Enemy scaling, wave timers, wave rewards, bosses
 * - prestige.ts: Blueprints, upgrade costs/effects, builder costs
 * - economy.ts: Upgrade costs, Engineering/Shield bonuses, special effects
 */

// Production formulas
export {
  // Constants
  LEVEL_MULTIPLIER_BASE,
  LEVEL_SOFT_CAP,
  OFFLINE_EFFICIENCY,
  MAX_OFFLINE_HOURS,
  COMMAND_CENTER_BONUS_PER_LEVEL,
  COMMAND_CENTER_BONUS_PER_WORKER,
  COMMAND_CENTER_MAX_BOOST,
  WORKER_EFFICIENCY_BASE_DECAY,
  WORKER_EFFICIENCY_MIN_DECAY,
  WORKER_EFFICIENCY_SCALING_CAP,
  WORKER_MILESTONES,
  LEVEL_MILESTONES,
  WAVE_BONUS_LOG_MULTIPLIER,
  WAVE_BONUS_LINEAR_PER_WAVE,
  WAVE_MILESTONES,
  // Worker efficiency
  calculateDecayRate,
  calculateSingleWorkerEfficiency,
  calculateTotalWorkerEfficiency,
  calculateWorkerMilestoneBonus,
  calculateWorkerEfficiency,
  // Building production
  calculateLevelMilestoneBonus,
  calculateLevelMultiplier,
  calculateBuildingProduction,
  // Wave bonus
  calculateWaveBonus,
  // Command center
  calculateCommandCenterBonus,
  // Offline
  calculateOfflineProduction,
  // Types
  type WorkerEfficiencyResult,
} from './production';

// Combat formulas
export {
  // Constants
  BASE_TAP_DAMAGE,
  TAP_VARIANCE_MIN,
  TAP_VARIANCE_MAX,
  DEFAULT_BURST_CHANCE,
  DEFAULT_BURST_MULTIPLIER,
  DAMAGE_SCRAP_PERCENT,
  TAP_COOLDOWN_MS,
  WEAK_POINT_BASE_MULTIPLIER,
  WEAK_POINT_MULTIPLIER_PER_TIER,
  WEAK_POINT_MULTIPLIER_PER_LEVEL,
  WEAK_POINT_MULTIPLIER_PER_WORKER,
  WEAK_POINT_MAX_MULTIPLIER,
  CRITICAL_BURST_STACK_BONUS,
  // Tap damage
  calculateTapVariance,
  calculateTapDamage,
  // Burst attacks
  checkBurstAttack,
  // Weak points
  calculateWeakPointDamageMultiplier,
  // Critical + Burst stacking
  calculateCombinedCriticalBurstMultiplier,
  // Scrap from damage
  calculateScrapFromDamage,
} from './combat';

// Progression formulas
export {
  // Constants
  BASE_WAVE_TIMER_SECONDS,
  WAVE_TIMER_BONUS_PER_WAVE,
  MAX_WAVE_TIMER_SECONDS,
  BOSS_WAVE_INTERVAL,
  BOSS_HEALTH_MULTIPLIER,
  BOSS_REWARD_MULTIPLIER,
  BOSS_TIMER_MULTIPLIER,
  WAVE_REWARD_BASE_PER_WAVE,
  WAVE_REWARD_POLYNOMIAL_EXPONENT,
  WAVE_REWARD_MULTIPLIER_PER_20_WAVES,
  WAVE_REWARD_MULTIPLIER_CAP,
  // Enemy scaling
  calculateEnemyHealth,
  calculateEnemyReward,
  calculateBossHealth,
  calculateBossReward,
  // Wave timer
  calculateWaveTimer,
  calculateBossWaveTimer,
  isBossWave,
  getWavesUntilBoss,
  // Wave rewards
  calculateWaveCompletionBonus,
  calculateWaveReward,
  // Difficulty
  getWaveDifficulty,
} from './progression';

// Prestige formulas
export {
  // Constants
  BASE_BLUEPRINT_WAVE,
  BASE_BLUEPRINTS_REWARD,
  BLUEPRINTS_PER_WAVE_ABOVE_BASE,
  BLUEPRINT_WAVE_SCALING,
  BUILDER_COST_TIER_1,
  BUILDER_COST_TIER_2,
  BUILDER_COST_TIER_3,
  BUILDER_COST_TIER_4,
  BUILDER_COST_TIER_5,
  BUILDER_COST_TIER_6,
  BUILDER_COST_TIER_7,
  STARTING_SCRAP_PER_WAVE_PER_LEVEL,
  PRESTIGE_RANKS,
  // Blueprint earning
  canPrestige,
  calculateBlueprintsEarned,
  // Upgrade costs/effects
  calculateUpgradeCost as calculatePrestigeUpgradeCost,
  calculateUpgradeEffect,
  // Builder purchase
  calculateBuilderPurchaseCost,
  // Starting scrap
  calculateStartingScrapBonus,
  // Ranks
  calculatePrestigeLevel,
  getPrestigeRank,
} from './prestige';

// Economy formulas
export {
  // Constants
  ENGINEERING_BONUS_PER_LEVEL,
  ENGINEERING_BONUS_PER_WORKER,
  ENGINEERING_MAX_DISCOUNT,
  SHIELD_BONUS_PER_LEVEL,
  SHIELD_BONUS_PER_WORKER,
  SHIELD_MAX_BONUS_SECONDS,
  // Special effect constants
  SCRAP_FIND_BASE_COOLDOWN_MS,
  SCRAP_FIND_COOLDOWN_PER_LEVEL_MS,
  SCRAP_FIND_COOLDOWN_PER_WORKER_MS,
  SCRAP_FIND_MIN_COOLDOWN_MS,
  SCRAP_FIND_BASE_REWARD_PERCENT,
  SCRAP_FIND_TIER_MULTIPLIERS,
  BURST_BOOST_BASE_CHANCE,
  BURST_BOOST_CHANCE_PER_LEVEL,
  BURST_BOOST_CHANCE_PER_WORKER,
  BURST_BOOST_CHANCE_PER_TIER,
  BURST_BOOST_MAX_TOTAL_CHANCE,
  CRITICAL_WEAKNESS_BASE_CHANCE,
  CRITICAL_WEAKNESS_CHANCE_PER_LEVEL,
  CRITICAL_WEAKNESS_CHANCE_PER_WORKER,
  CRITICAL_WEAKNESS_CHANCE_PER_TIER,
  CRITICAL_WEAKNESS_MAX_CHANCE,
  CRITICAL_WEAKNESS_BONUS_MULTIPLIER,
  CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER,
  WAVE_EXTEND_BASE_CHANCE,
  WAVE_EXTEND_CHANCE_PER_LEVEL,
  WAVE_EXTEND_CHANCE_PER_WORKER,
  WAVE_EXTEND_CHANCE_PER_TIER,
  WAVE_EXTEND_MAX_CHANCE,
  WAVE_EXTEND_BONUS_TIME_PERCENT,
  WAVE_EXTEND_MAX_BONUS_SECONDS,
  // Building upgrade cost
  calculateUpgradeCost as calculateBuildingUpgradeCost,
  // Engineering bay
  calculateEngineeringDiscount,
  // Shield generator
  calculateShieldGeneratorBonus,
  // Special effects
  calculateScrapFindCooldown,
  calculateScrapFindAmount,
  calculateBurstBoostChance,
  calculateCriticalWeaknessChance,
  calculateWaveExtendChance,
  calculateWaveExtendBonus,
} from './economy';
