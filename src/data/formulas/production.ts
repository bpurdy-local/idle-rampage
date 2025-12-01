/**
 * Production Formulas
 *
 * All formulas related to resource generation, including:
 * - Building production output
 * - Worker efficiency and diminishing returns
 * - Wave-based bonuses
 * - Command center boost
 * - Offline earnings
 */

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

/** Level scaling: exponential base for production multiplier */
export const LEVEL_MULTIPLIER_BASE = 1.04;

/** Soft cap for level scaling - growth slows after this */
export const LEVEL_SOFT_CAP = 50;

/** Offline production efficiency (50%) */
export const OFFLINE_EFFICIENCY = 0.5;

/** Maximum offline hours to accumulate production */
export const MAX_OFFLINE_HOURS = 8;

/** Command Center bonus per level above 1 */
export const COMMAND_CENTER_BONUS_PER_LEVEL = 0.01;

/** Command Center bonus per worker */
export const COMMAND_CENTER_BONUS_PER_WORKER = 0.01;

/** Command Center max boost cap */
export const COMMAND_CENTER_MAX_BOOST = 0.80;

// =============================================================================
// WORKER EFFICIENCY CONSTANTS
// =============================================================================
// Decay rate scales based on total workers owned (not per-building).
// Players with few workers face steep diminishing returns for stacking,
// incentivizing spreading workers across buildings.
// Players who purchase more workers get a gentler decay curve as a reward.

/** Decay rate when player has minimum workers (high penalty for stacking) */
export const WORKER_EFFICIENCY_BASE_DECAY = 0.20;

/** Decay rate when player has many workers (reward for purchasing) */
export const WORKER_EFFICIENCY_MIN_DECAY = 0.04;

/** Total workers at which decay reaches minimum rate */
export const WORKER_EFFICIENCY_SCALING_CAP = 50;

/** Worker milestone bonuses for assigning many workers to a single building */
export const WORKER_MILESTONES = [
  {threshold: 5, bonus: 0.15, name: 'Coordinated Team'},
  {threshold: 10, bonus: 0.30, name: 'Efficient Squad'},
  {threshold: 20, bonus: 0.50, name: 'Master Crew'},
] as const;

// Level milestones for production bonus
export const LEVEL_MILESTONES = [
  {level: 25, bonus: 0.20},
  {level: 50, bonus: 0.40},
  {level: 75, bonus: 0.60},
  {level: 100, bonus: 0.80},
] as const;

// Wave bonus constants
export const WAVE_BONUS_LOG_MULTIPLIER = 0.6;
export const WAVE_BONUS_LINEAR_PER_WAVE = 0.025;
export const WAVE_MILESTONES = [
  {wave: 15, bonus: 0.15},
  {wave: 25, bonus: 0.25},
  {wave: 40, bonus: 0.40},
  {wave: 50, bonus: 0.50},
  {wave: 75, bonus: 0.75},
  {wave: 100, bonus: 1.0},
] as const;

// =============================================================================
// WORKER EFFICIENCY FORMULAS
// =============================================================================

/**
 * Calculate the decay rate based on total workers owned.
 *
 * Formula: decayRate = baseDecay - (baseDecay - minDecay) * (totalWorkers / cap)
 *
 * With fewer workers, decay is high (stacking is punished).
 * With more workers, decay is low (reward for purchasing).
 *
 * Examples (with base=0.20, min=0.04, cap=50):
 * - 5 total workers: 0.184 decay
 * - 10 total workers: 0.168 decay
 * - 20 total workers: 0.136 decay
 * - 50 total workers: 0.040 decay (minimum)
 */
export function calculateDecayRate(totalWorkersOwned: number): number {
  const cappedWorkers = Math.min(totalWorkersOwned, WORKER_EFFICIENCY_SCALING_CAP);
  const scalingFactor = cappedWorkers / WORKER_EFFICIENCY_SCALING_CAP;
  return (
    WORKER_EFFICIENCY_BASE_DECAY -
    (WORKER_EFFICIENCY_BASE_DECAY - WORKER_EFFICIENCY_MIN_DECAY) * scalingFactor
  );
}

/**
 * Calculate efficiency of a single worker at a given position.
 *
 * Formula: efficiency = 1 / (1 + (position - 1) * decay)
 *
 * @param workerPosition - The position of this worker (1st, 2nd, etc.)
 * @param decayRate - The decay rate (use calculateDecayRate to get this)
 *
 * Examples (with 0.184 decay at 5 total workers):
 * - Worker 1: 100%
 * - Worker 2: 84%
 * - Worker 3: 73%
 * - Worker 4: 65%
 * - Worker 5: 58%
 */
export function calculateSingleWorkerEfficiency(
  workerPosition: number,
  decayRate: number,
): number {
  if (workerPosition <= 0) return 0;
  if (workerPosition === 1) return 1;
  return 1 / (1 + (workerPosition - 1) * decayRate);
}

/**
 * Calculate total efficiency from all assigned workers.
 * Returns the sum of each worker's individual efficiency.
 *
 * @param assignedWorkers - Workers assigned to this building
 * @param totalWorkersOwned - Total workers the player owns (for decay calculation)
 */
export function calculateTotalWorkerEfficiency(
  assignedWorkers: number,
  totalWorkersOwned: number,
): number {
  if (assignedWorkers <= 0) return 0;

  const decayRate = calculateDecayRate(totalWorkersOwned);
  let total = 0;
  for (let i = 1; i <= assignedWorkers; i++) {
    total += calculateSingleWorkerEfficiency(i, decayRate);
  }
  return total;
}

/**
 * Calculate milestone bonus multiplier based on worker count.
 * Bonuses stack additively.
 */
export function calculateWorkerMilestoneBonus(assignedWorkers: number): number {
  let bonus = 0;
  for (const milestone of WORKER_MILESTONES) {
    if (assignedWorkers >= milestone.threshold) {
      bonus += milestone.bonus;
    }
  }
  return 1 + bonus;
}

export interface WorkerEfficiencyResult {
  totalEfficiency: number;
  averageEfficiency: number;
  milestoneBonus: number;
  effectiveWorkers: number;
  decayRate: number;
}

/**
 * Calculate complete worker efficiency breakdown.
 *
 * @param assignedWorkers - Number of workers assigned to the building
 * @param totalWorkersOwned - Total workers the player owns (for decay calculation)
 * @param includePassive - Whether to include passive baseline (1 worker equivalent)
 */
export function calculateWorkerEfficiency(
  assignedWorkers: number,
  totalWorkersOwned: number,
  includePassive: boolean = true,
): WorkerEfficiencyResult {
  const decayRate = calculateDecayRate(totalWorkersOwned);
  const passiveEfficiency = includePassive ? 1 : 0;
  const workerEfficiency = calculateTotalWorkerEfficiency(assignedWorkers, totalWorkersOwned);
  const totalEfficiency = passiveEfficiency + workerEfficiency;
  const milestoneBonus = calculateWorkerMilestoneBonus(assignedWorkers);
  const averageEfficiency = assignedWorkers > 0 ? workerEfficiency / assignedWorkers : 1;
  const effectiveWorkers = totalEfficiency * milestoneBonus;

  return {
    totalEfficiency,
    averageEfficiency,
    milestoneBonus,
    effectiveWorkers,
    decayRate,
  };
}

// =============================================================================
// BUILDING PRODUCTION FORMULAS
// =============================================================================

/**
 * Calculate level milestone bonus.
 * Bonuses stack additively at levels 25, 50, 75, 100.
 */
export function calculateLevelMilestoneBonus(level: number): number {
  let bonus = 0;
  for (const milestone of LEVEL_MILESTONES) {
    if (level >= milestone.level) {
      bonus += milestone.bonus;
    }
  }
  return 1 + bonus;
}

/**
 * Calculate building level multiplier.
 *
 * Formula: 1.04^(level-1) with soft cap at level 50
 * After soft cap, growth is logarithmic.
 *
 * Examples:
 * - Level 1: 1.0x
 * - Level 10: 1.48x
 * - Level 25: 2.56x
 * - Level 50: 7.1x
 * - Level 100: ~12x (diminishing after soft cap)
 */
export function calculateLevelMultiplier(level: number): number {
  if (level <= 1) return 1;

  if (level <= LEVEL_SOFT_CAP) {
    // Exponential growth before soft cap
    return Math.pow(LEVEL_MULTIPLIER_BASE, level - 1);
  }

  // After soft cap: base exponential + logarithmic growth
  const softCapMultiplier = Math.pow(LEVEL_MULTIPLIER_BASE, LEVEL_SOFT_CAP - 1);
  const levelsAboveCap = level - LEVEL_SOFT_CAP;
  const logarithmicBonus = Math.log10(levelsAboveCap + 1) * 2;

  return softCapMultiplier * (1 + logarithmicBonus * 0.1);
}

/**
 * Calculate building production output.
 *
 * Formula: baseProduction * levelMultiplier * effectiveWorkers * waveBonus * prestigeBonus
 *
 * @param baseProduction - Base production value of the building
 * @param level - Building level
 * @param assignedBuilders - Workers assigned to this building
 * @param totalWorkersOwned - Total workers the player owns (for decay calculation)
 * @param waveBonus - Wave-based production bonus multiplier
 * @param prestigeBonus - Prestige-based production bonus multiplier
 * @param includePassive - Whether to include passive baseline (1 worker equivalent)
 */
export function calculateBuildingProduction(
  baseProduction: number,
  level: number,
  assignedBuilders: number,
  totalWorkersOwned: number,
  waveBonus: number = 1,
  prestigeBonus: number = 1,
  includePassive: boolean = true,
): number {
  const levelMultiplier = calculateLevelMultiplier(level);
  const efficiency = calculateWorkerEfficiency(assignedBuilders, totalWorkersOwned, includePassive);

  if (efficiency.effectiveWorkers === 0) return 0;

  return baseProduction * levelMultiplier * efficiency.effectiveWorkers * waveBonus * prestigeBonus;
}

// =============================================================================
// WAVE BONUS FORMULAS
// =============================================================================

/**
 * Calculate wave-based efficiency bonus for buildings.
 *
 * Components:
 * - Logarithmic bonus: log10(wave + 1) * 0.5 (smooth early game)
 * - Linear bonus: wave * 0.02 (consistent growth)
 * - Milestone bonuses at waves 25, 50, 75, 100
 *
 * Examples:
 * - Wave 1: ~1.15x
 * - Wave 25: ~2.2x
 * - Wave 50: ~3.85x
 * - Wave 100: ~6.5x
 */
export function calculateWaveBonus(currentWave: number): number {
  const logBonus = Math.log10(currentWave + 1) * WAVE_BONUS_LOG_MULTIPLIER;
  const linearBonus = currentWave * WAVE_BONUS_LINEAR_PER_WAVE;

  let milestoneBonus = 0;
  for (const milestone of WAVE_MILESTONES) {
    if (currentWave >= milestone.wave) {
      milestoneBonus += milestone.bonus;
    }
  }

  return 1 + logBonus + linearBonus + milestoneBonus;
}

// =============================================================================
// COMMAND CENTER FORMULAS
// =============================================================================

/**
 * Calculate Command Center production boost.
 *
 * Formula: 1 + (tierBaseBonus + (level - 1) * 0.02)
 *
 * Examples (Tier 1 = 15% base):
 * - Level 1: 1.15x
 * - Level 5: 1.23x
 * - Level 10: 1.33x
 */
export function calculateCommandCenterBonus(
  tierBaseBonus: number,
  level: number,
): number {
  const levelBonus = (level - 1) * COMMAND_CENTER_BONUS_PER_LEVEL;
  return 1 + tierBaseBonus + levelBonus;
}

// =============================================================================
// OFFLINE PRODUCTION FORMULAS
// =============================================================================

/**
 * Calculate offline production earnings.
 *
 * Formula: productionPerSecond * cappedSeconds * 0.5
 *
 * - Capped at 8 hours
 * - 50% efficiency while offline
 */
export function calculateOfflineProduction(
  productionPerSecond: number,
  offlineSeconds: number,
): number {
  const maxOfflineSeconds = MAX_OFFLINE_HOURS * 3600;
  const cappedSeconds = Math.min(offlineSeconds, maxOfflineSeconds);
  return Math.floor(productionPerSecond * cappedSeconds * OFFLINE_EFFICIENCY);
}
