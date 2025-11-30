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

/** Level scaling: production multiplier per level above 1 */
export const LEVEL_MULTIPLIER_PER_LEVEL = 0.75;

/** Offline production efficiency (50%) */
export const OFFLINE_EFFICIENCY = 0.5;

/** Maximum offline hours to accumulate production */
export const MAX_OFFLINE_HOURS = 8;

/** Command Center bonus per level above 1 */
export const COMMAND_CENTER_BONUS_PER_LEVEL = 0.02;

// Worker efficiency constants
export const WORKER_EFFICIENCY_DECAY = 0.12;

export const WORKER_MILESTONES = [
  {threshold: 5, bonus: 0.15, name: 'Coordinated Team'},
  {threshold: 10, bonus: 0.25, name: 'Efficient Squad'},
  {threshold: 20, bonus: 0.35, name: 'Master Crew'},
] as const;

// Wave bonus constants
export const WAVE_BONUS_LOG_MULTIPLIER = 0.5;
export const WAVE_BONUS_LINEAR_PER_WAVE = 0.02;
export const WAVE_MILESTONES = [
  {wave: 25, bonus: 0.25},
  {wave: 50, bonus: 0.5},
  {wave: 75, bonus: 0.75},
  {wave: 100, bonus: 1.0},
] as const;

// =============================================================================
// WORKER EFFICIENCY FORMULAS
// =============================================================================

/**
 * Calculate efficiency of a single worker at a given position.
 *
 * Formula: efficiency = 1 / (1 + (position - 1) * decay)
 *
 * Examples (with 0.12 decay):
 * - Worker 1: 100%
 * - Worker 2: ~89%
 * - Worker 5: ~68%
 * - Worker 10: ~48%
 * - Worker 20: ~30%
 */
export function calculateSingleWorkerEfficiency(
  workerPosition: number,
  decayRate: number = WORKER_EFFICIENCY_DECAY,
): number {
  if (workerPosition <= 0) return 0;
  if (workerPosition === 1) return 1;
  return 1 / (1 + (workerPosition - 1) * decayRate);
}

/**
 * Calculate total efficiency from all assigned workers.
 * Returns the sum of each worker's individual efficiency.
 */
export function calculateTotalWorkerEfficiency(
  assignedWorkers: number,
  decayRate: number = WORKER_EFFICIENCY_DECAY,
): number {
  if (assignedWorkers <= 0) return 0;

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
}

/**
 * Calculate complete worker efficiency breakdown.
 *
 * @param assignedWorkers - Number of workers assigned to the building
 * @param includePassive - Whether to include passive baseline (1 worker equivalent)
 */
export function calculateWorkerEfficiency(
  assignedWorkers: number,
  includePassive: boolean = true,
): WorkerEfficiencyResult {
  const passiveEfficiency = includePassive ? 1 : 0;
  const workerEfficiency = calculateTotalWorkerEfficiency(assignedWorkers);
  const totalEfficiency = passiveEfficiency + workerEfficiency;
  const milestoneBonus = calculateWorkerMilestoneBonus(assignedWorkers);
  const averageEfficiency = assignedWorkers > 0 ? workerEfficiency / assignedWorkers : 1;
  const effectiveWorkers = totalEfficiency * milestoneBonus;

  return {
    totalEfficiency,
    averageEfficiency,
    milestoneBonus,
    effectiveWorkers,
  };
}

// =============================================================================
// BUILDING PRODUCTION FORMULAS
// =============================================================================

/**
 * Calculate building level multiplier.
 *
 * Formula: 1 + (level - 1) * 0.75
 *
 * Examples:
 * - Level 1: 1.0x
 * - Level 5: 4.0x
 * - Level 10: 7.75x
 */
export function calculateLevelMultiplier(level: number): number {
  return 1 + (level - 1) * LEVEL_MULTIPLIER_PER_LEVEL;
}

/**
 * Calculate building production output.
 *
 * Formula: baseProduction * levelMultiplier * effectiveWorkers * waveBonus * prestigeBonus
 */
export function calculateBuildingProduction(
  baseProduction: number,
  level: number,
  assignedBuilders: number,
  waveBonus: number = 1,
  prestigeBonus: number = 1,
  includePassive: boolean = true,
): number {
  const levelMultiplier = calculateLevelMultiplier(level);
  const efficiency = calculateWorkerEfficiency(assignedBuilders, includePassive);

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
