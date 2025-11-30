/**
 * Worker Efficiency System
 *
 * Re-exports worker efficiency functions from the centralized formulas.
 * All actual logic is in src/data/formulas/production.ts
 */

export {
  calculateWorkerEfficiency,
  calculateSingleWorkerEfficiency,
  calculateTotalWorkerEfficiency,
  calculateWorkerMilestoneBonus,
  type WorkerEfficiencyResult,
  WORKER_EFFICIENCY_DECAY,
  WORKER_MILESTONES,
} from '../data/formulas/production';
