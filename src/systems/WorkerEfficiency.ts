/**
 * Worker Efficiency System
 *
 * Implements diminishing returns for workers assigned to buildings.
 * More workers = less efficiency per worker, encouraging players to spread workers.
 *
 * Key features:
 * - Diminishing returns: Each additional worker is less efficient than the previous
 * - Milestone bonuses: Bonuses at 5, 10, 20 workers to create meaningful breakpoints
 * - First worker is always 100% efficient
 */

export interface WorkerEfficiencyResult {
  totalEfficiency: number; // Total effective workers (accounting for diminishing returns)
  averageEfficiency: number; // Average efficiency per worker (0-1)
  milestoneBonus: number; // Bonus multiplier from milestones
  effectiveWorkers: number; // Final effective worker count (totalEfficiency * milestoneBonus)
}

// Milestone thresholds and their bonuses
export const WORKER_MILESTONES: {threshold: number; bonus: number; name: string}[] = [
  {threshold: 5, bonus: 0.15, name: 'Coordinated Team'}, // +15% at 5 workers
  {threshold: 10, bonus: 0.25, name: 'Efficient Squad'}, // +25% at 10 workers (total +40%)
  {threshold: 20, bonus: 0.35, name: 'Master Crew'}, // +35% at 20 workers (total +75%)
];

// Decay rate for diminishing returns
// Higher = faster diminishing returns
const EFFICIENCY_DECAY = 0.12;

/**
 * Calculate the efficiency of a single worker at a given position.
 * First worker = 100% efficiency, subsequent workers have diminishing returns.
 *
 * Formula: efficiency = 1 / (1 + (position - 1) * decay)
 * - Worker 1: 100%
 * - Worker 2: ~89% (with 0.12 decay)
 * - Worker 5: ~68%
 * - Worker 10: ~48%
 * - Worker 20: ~30%
 */
export function calculateSingleWorkerEfficiency(
  workerPosition: number,
  decayRate: number = EFFICIENCY_DECAY,
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
  decayRate: number = EFFICIENCY_DECAY,
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
export function calculateMilestoneBonus(assignedWorkers: number): number {
  let bonus = 0;
  for (const milestone of WORKER_MILESTONES) {
    if (assignedWorkers >= milestone.threshold) {
      bonus += milestone.bonus;
    }
  }
  return 1 + bonus;
}

/**
 * Get the next milestone the player is working towards.
 */
export function getNextMilestone(
  assignedWorkers: number,
): {threshold: number; bonus: number; name: string; workersNeeded: number} | null {
  for (const milestone of WORKER_MILESTONES) {
    if (assignedWorkers < milestone.threshold) {
      return {
        ...milestone,
        workersNeeded: milestone.threshold - assignedWorkers,
      };
    }
  }
  return null; // All milestones achieved
}

/**
 * Get all achieved milestones for a building.
 */
export function getAchievedMilestones(
  assignedWorkers: number,
): {threshold: number; bonus: number; name: string}[] {
  return WORKER_MILESTONES.filter(m => assignedWorkers >= m.threshold);
}

/**
 * Calculate complete worker efficiency breakdown.
 * This is the main function to use when calculating building output.
 *
 * @param assignedWorkers - Number of workers assigned to the building
 * @param includePassive - Whether to include the passive baseline (1 worker equivalent)
 * @returns Complete efficiency breakdown
 */
export function calculateWorkerEfficiency(
  assignedWorkers: number,
  includePassive: boolean = true,
): WorkerEfficiencyResult {
  // Passive baseline provides 1 effective worker at 100% efficiency
  const passiveEfficiency = includePassive ? 1 : 0;

  // Calculate diminishing returns for assigned workers
  const workerEfficiency = calculateTotalWorkerEfficiency(assignedWorkers);

  // Total efficiency before milestones
  const totalEfficiency = passiveEfficiency + workerEfficiency;

  // Calculate milestone bonus (only based on assigned workers, not passive)
  const milestoneBonus = calculateMilestoneBonus(assignedWorkers);

  // Average efficiency per worker (for display purposes)
  const averageEfficiency =
    assignedWorkers > 0 ? workerEfficiency / assignedWorkers : 1;

  // Final effective workers
  const effectiveWorkers = totalEfficiency * milestoneBonus;

  return {
    totalEfficiency,
    averageEfficiency,
    milestoneBonus,
    effectiveWorkers,
  };
}

/**
 * Format efficiency as a percentage string for display.
 */
export function formatEfficiency(efficiency: number): string {
  return `${Math.round(efficiency * 100)}%`;
}

/**
 * Calculate the marginal efficiency of adding one more worker.
 * Useful for showing players the value of their next worker assignment.
 */
export function calculateMarginalEfficiency(
  currentWorkers: number,
): {efficiency: number; triggersMilestone: boolean; milestoneName?: string} {
  const nextWorkerPosition = currentWorkers + 1;
  const efficiency = calculateSingleWorkerEfficiency(nextWorkerPosition);

  // Check if adding this worker triggers a milestone
  const currentMilestoneBonus = calculateMilestoneBonus(currentWorkers);
  const nextMilestoneBonus = calculateMilestoneBonus(nextWorkerPosition);
  const triggersMilestone = nextMilestoneBonus > currentMilestoneBonus;

  const milestone = WORKER_MILESTONES.find(m => m.threshold === nextWorkerPosition);

  return {
    efficiency,
    triggersMilestone,
    milestoneName: milestone?.name,
  };
}

/**
 * Calculate optimal worker distribution across buildings.
 * This helps with AI suggestions or auto-assign features.
 *
 * Returns suggested worker counts for each building to maximize total output.
 */
export function suggestOptimalDistribution(
  totalWorkers: number,
  buildingCount: number,
): number[] {
  if (buildingCount <= 0) return [];
  if (totalWorkers <= 0) return new Array(buildingCount).fill(0);

  // Start with even distribution
  const basePerBuilding = Math.floor(totalWorkers / buildingCount);
  const remainder = totalWorkers % buildingCount;

  const distribution = new Array(buildingCount).fill(basePerBuilding);

  // Distribute remainder to first buildings
  for (let i = 0; i < remainder; i++) {
    distribution[i]++;
  }

  return distribution;
}
