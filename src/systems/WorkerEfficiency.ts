/**
 * Worker Efficiency System
 *
 * Re-exports worker efficiency functions from the centralized formulas.
 * All actual logic is in src/data/formulas/production.ts
 */

export {
  calculateDecayRate,
  calculateWorkerEfficiency,
  calculateSingleWorkerEfficiency,
  calculateTotalWorkerEfficiency,
  calculateWorkerMilestoneBonus,
  type WorkerEfficiencyResult,
  WORKER_EFFICIENCY_BASE_DECAY,
  WORKER_EFFICIENCY_MIN_DECAY,
  WORKER_EFFICIENCY_SCALING_CAP,
  WORKER_MILESTONES,
} from '../data/formulas/production';
