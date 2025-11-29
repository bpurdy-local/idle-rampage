/**
 * Synergy System
 *
 * Buildings can create synergies when they meet worker threshold requirements.
 * Synergies provide bonus effects that reward players for spreading workers
 * across multiple buildings rather than concentrating on one.
 */

import {BuildingState} from '../core/GameState';

export interface SynergyDefinition {
  id: string;
  name: string;
  description: string;
  requirements: SynergyRequirement[];
  effect: SynergyEffect;
}

export interface SynergyRequirement {
  buildingId: string;
  minWorkers: number;
}

export interface SynergyEffect {
  type: SynergyEffectType;
  value: number;
  targetBuildingId?: string; // For building-specific effects
}

export type SynergyEffectType =
  | 'scrap_from_auto_kills' // Bonus scrap when auto-damage defeats enemy
  | 'scrap_from_tap_kills' // Bonus scrap when tap defeats enemy
  | 'global_efficiency' // Bonus to all building efficiency
  | 'upgrade_speed' // Faster upgrades
  | 'production_multiplier' // Multiplier to production buildings
  | 'damage_multiplier'; // Multiplier to damage buildings

export interface ActiveSynergy {
  definition: SynergyDefinition;
  isActive: boolean;
  progress: SynergyProgress[];
}

export interface SynergyProgress {
  buildingId: string;
  currentWorkers: number;
  requiredWorkers: number;
  isMet: boolean;
}

export interface SynergyBonuses {
  scrapFromAutoKillsBonus: number; // Multiplier for scrap from auto-damage kills
  scrapFromTapKillsBonus: number; // Multiplier for scrap from tap kills
  globalEfficiencyBonus: number; // Added to all building efficiency
  upgradeSpeedMultiplier: number; // Multiplier for upgrade speed
  productionMultiplier: number; // Multiplier for production buildings
  damageMultiplier: number; // Multiplier for damage buildings
}

/**
 * All available synergies in the game.
 */
export const SYNERGIES: SynergyDefinition[] = [
  {
    id: 'automated_salvage',
    name: 'Automated Salvage',
    description: 'Auto-damage kills grant +50% bonus scrap',
    requirements: [
      {buildingId: 'turret_station', minWorkers: 5},
      {buildingId: 'scrap_works', minWorkers: 5},
    ],
    effect: {
      type: 'scrap_from_auto_kills',
      value: 0.5, // +50%
    },
  },
  {
    id: 'tactical_looting',
    name: 'Tactical Looting',
    description: 'Tap kills grant +100% bonus scrap',
    requirements: [
      {buildingId: 'training_facility', minWorkers: 5},
      {buildingId: 'salvage_yard', minWorkers: 5},
    ],
    effect: {
      type: 'scrap_from_tap_kills',
      value: 1.0, // +100%
    },
  },
  {
    id: 'unified_command',
    name: 'Unified Command',
    description: '+10% efficiency to all buildings with 5+ workers',
    requirements: [
      {buildingId: 'command_center', minWorkers: 3},
      // Requires at least 3 other buildings with 5+ workers (checked separately)
    ],
    effect: {
      type: 'global_efficiency',
      value: 0.1, // +10%
    },
  },
  {
    id: 'rapid_development',
    name: 'Rapid Development',
    description: '2x upgrade speed for all buildings',
    requirements: [
      {buildingId: 'engineering_bay', minWorkers: 10},
      {buildingId: 'scrap_works', minWorkers: 10},
    ],
    effect: {
      type: 'upgrade_speed',
      value: 2.0, // 2x speed
    },
  },
  {
    id: 'war_economy',
    name: 'War Economy',
    description: '+25% to all production when combat buildings are staffed',
    requirements: [
      {buildingId: 'turret_station', minWorkers: 5},
      {buildingId: 'training_facility', minWorkers: 5},
      {buildingId: 'scrap_works', minWorkers: 5},
    ],
    effect: {
      type: 'production_multiplier',
      value: 0.25, // +25%
    },
  },
  {
    id: 'focused_assault',
    name: 'Focused Assault',
    description: '+30% to all damage when production is balanced',
    requirements: [
      {buildingId: 'scrap_works', minWorkers: 5},
      {buildingId: 'salvage_yard', minWorkers: 5},
      {buildingId: 'turret_station', minWorkers: 5},
    ],
    effect: {
      type: 'damage_multiplier',
      value: 0.3, // +30%
    },
  },
];

export class SynergySystem {
  /**
   * Check if a synergy's requirements are met.
   */
  checkSynergyRequirements(
    synergy: SynergyDefinition,
    buildings: BuildingState[],
  ): SynergyProgress[] {
    return synergy.requirements.map(req => {
      const building = buildings.find(b => b.typeId === req.buildingId);
      const currentWorkers = building?.assignedBuilders ?? 0;
      const isUnlocked = building?.isUnlocked ?? false;

      return {
        buildingId: req.buildingId,
        currentWorkers,
        requiredWorkers: req.minWorkers,
        isMet: isUnlocked && currentWorkers >= req.minWorkers,
      };
    });
  }

  /**
   * Check if a synergy is fully active.
   */
  isSynergyActive(synergy: SynergyDefinition, buildings: BuildingState[]): boolean {
    // Special case for Unified Command - requires command center + 3 buildings with 5+ workers
    if (synergy.id === 'unified_command') {
      const commandCenter = buildings.find(b => b.typeId === 'command_center');
      if (!commandCenter?.isUnlocked || commandCenter.assignedBuilders < 3) {
        return false;
      }

      const buildingsWithFiveWorkers = buildings.filter(
        b => b.isUnlocked && b.typeId !== 'command_center' && b.assignedBuilders >= 5,
      );
      return buildingsWithFiveWorkers.length >= 3;
    }

    const progress = this.checkSynergyRequirements(synergy, buildings);
    return progress.every(p => p.isMet);
  }

  /**
   * Get all synergies with their current status.
   */
  getAllSynergiesStatus(buildings: BuildingState[]): ActiveSynergy[] {
    return SYNERGIES.map(synergy => ({
      definition: synergy,
      isActive: this.isSynergyActive(synergy, buildings),
      progress: this.checkSynergyRequirements(synergy, buildings),
    }));
  }

  /**
   * Get only active synergies.
   */
  getActiveSynergies(buildings: BuildingState[]): SynergyDefinition[] {
    return SYNERGIES.filter(synergy => this.isSynergyActive(synergy, buildings));
  }

  /**
   * Calculate all synergy bonuses from active synergies.
   */
  calculateSynergyBonuses(buildings: BuildingState[]): SynergyBonuses {
    const bonuses: SynergyBonuses = {
      scrapFromAutoKillsBonus: 0,
      scrapFromTapKillsBonus: 0,
      globalEfficiencyBonus: 0,
      upgradeSpeedMultiplier: 1,
      productionMultiplier: 1,
      damageMultiplier: 1,
    };

    const activeSynergies = this.getActiveSynergies(buildings);

    for (const synergy of activeSynergies) {
      switch (synergy.effect.type) {
        case 'scrap_from_auto_kills':
          bonuses.scrapFromAutoKillsBonus += synergy.effect.value;
          break;
        case 'scrap_from_tap_kills':
          bonuses.scrapFromTapKillsBonus += synergy.effect.value;
          break;
        case 'global_efficiency':
          bonuses.globalEfficiencyBonus += synergy.effect.value;
          break;
        case 'upgrade_speed':
          bonuses.upgradeSpeedMultiplier *= synergy.effect.value;
          break;
        case 'production_multiplier':
          bonuses.productionMultiplier += synergy.effect.value;
          break;
        case 'damage_multiplier':
          bonuses.damageMultiplier += synergy.effect.value;
          break;
      }
    }

    return bonuses;
  }

  /**
   * Get synergies that a specific building participates in.
   */
  getSynergiesForBuilding(buildingTypeId: string): SynergyDefinition[] {
    return SYNERGIES.filter(synergy =>
      synergy.requirements.some(req => req.buildingId === buildingTypeId),
    );
  }

  /**
   * Get the next best synergy to work towards based on current state.
   * Returns the synergy that requires the fewest additional workers to activate.
   */
  getSuggestedSynergy(
    buildings: BuildingState[],
  ): {synergy: SynergyDefinition; workersNeeded: number} | null {
    let bestSynergy: SynergyDefinition | null = null;
    let minWorkersNeeded = Infinity;

    for (const synergy of SYNERGIES) {
      if (this.isSynergyActive(synergy, buildings)) continue;

      const progress = this.checkSynergyRequirements(synergy, buildings);
      const workersNeeded = progress.reduce((total, p) => {
        if (p.isMet) return total;
        return total + (p.requiredWorkers - p.currentWorkers);
      }, 0);

      if (workersNeeded < minWorkersNeeded) {
        minWorkersNeeded = workersNeeded;
        bestSynergy = synergy;
      }
    }

    if (bestSynergy) {
      return {synergy: bestSynergy, workersNeeded: minWorkersNeeded};
    }

    return null;
  }

  /**
   * Get count of active synergies.
   */
  getActiveSynergyCount(buildings: BuildingState[]): number {
    return this.getActiveSynergies(buildings).length;
  }
}
