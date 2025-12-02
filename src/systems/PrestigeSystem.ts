import {PlayerState} from '../core/GameState';
import {PRESTIGE_UPGRADES} from '../data/prestigeUpgrades';
import {PrestigeUpgradeDefinition, getUpgradeCost, getUpgradeEffect} from '../models/PrestigeUpgrade';
import {
  calculateBlueprintsEarned as calculateBlueprintsEarnedFormula,
  canPrestige as canPrestigeFormula,
  calculateStartingScrapBonus,
  calculateBuilderPurchaseCost,
  calculatePrestigeLevel as calculatePrestigeLevelFormula,
  getPrestigeRank as getPrestigeRankFormula,
  BASE_BLUEPRINT_WAVE,
} from '../data/formulas';

export interface PrestigeBonuses {
  productionMultiplier: number;
  autoDamageMultiplier: number;
  tapPowerMultiplier: number;
  burstChanceBonus: number;
  burstDamageMultiplier: number;
  startingScrapBonus: number;
  waveRewardsMultiplier: number;
}

export interface PrestigeResetResult {
  blueprintsEarned: number;
  totalBlueprints: number;
  waveReached: number;
}

export class PrestigeSystem {
  /**
   * Calculate blueprints earned based on wave reached.
   * Uses centralized formula from src/data/formulas/prestige.ts
   */
  calculateBlueprintsEarned(waveReached: number): number {
    return calculateBlueprintsEarnedFormula(waveReached);
  }

  /**
   * Check if player can prestige (must reach minimum wave).
   * Uses centralized formula from src/data/formulas/prestige.ts
   */
  canPrestige(waveReached: number): boolean {
    return canPrestigeFormula(waveReached);
  }

  /**
   * Get minimum wave required to prestige
   */
  getPrestigeRequirement(): number {
    return BASE_BLUEPRINT_WAVE;
  }

  /**
   * Preview blueprints that would be earned without actually prestiging
   */
  previewPrestige(waveReached: number): {canPrestige: boolean; blueprintsEarned: number} {
    return {
      canPrestige: this.canPrestige(waveReached),
      blueprintsEarned: this.calculateBlueprintsEarned(waveReached),
    };
  }

  /**
   * Execute prestige reset
   */
  executePrestige(
    player: PlayerState,
    currentWave: number,
  ): PrestigeResetResult {
    const blueprintsEarned = this.calculateBlueprintsEarned(currentWave);

    return {
      blueprintsEarned,
      totalBlueprints: player.blueprints + blueprintsEarned,
      waveReached: currentWave,
    };
  }

  /**
   * Check if player can afford a prestige upgrade
   */
  canAffordUpgrade(
    upgradeId: string,
    currentLevel: number,
    blueprints: number,
  ): boolean {
    const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    if (currentLevel >= upgrade.maxLevel) return false;

    const cost = getUpgradeCost(upgrade, currentLevel);
    return blueprints >= cost;
  }

  /**
   * Purchase a prestige upgrade
   */
  purchaseUpgrade(
    upgradeId: string,
    currentLevel: number,
    blueprints: number,
  ): {success: boolean; newLevel: number; remainingBlueprints: number; cost: number} {
    const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);

    if (!upgrade) {
      return {success: false, newLevel: currentLevel, remainingBlueprints: blueprints, cost: 0};
    }

    if (currentLevel >= upgrade.maxLevel) {
      return {success: false, newLevel: currentLevel, remainingBlueprints: blueprints, cost: 0};
    }

    const cost = getUpgradeCost(upgrade, currentLevel);

    if (blueprints < cost) {
      return {success: false, newLevel: currentLevel, remainingBlueprints: blueprints, cost};
    }

    return {
      success: true,
      newLevel: currentLevel + 1,
      remainingBlueprints: blueprints - cost,
      cost,
    };
  }

  /**
   * Calculate all prestige bonuses from owned upgrades
   */
  calculateBonuses(ownedUpgrades: Record<string, number>): PrestigeBonuses {
    const bonuses: PrestigeBonuses = {
      productionMultiplier: 1,
      autoDamageMultiplier: 1,
      tapPowerMultiplier: 1,
      burstChanceBonus: 0,
      burstDamageMultiplier: 1,
      startingScrapBonus: 0,
      waveRewardsMultiplier: 1,
    };

    for (const upgrade of PRESTIGE_UPGRADES) {
      const level = ownedUpgrades[upgrade.id] ?? 0;
      if (level === 0) continue;

      const effect = getUpgradeEffect(upgrade, level);

      switch (upgrade.effectType) {
        case 'production_multiplier':
          bonuses.productionMultiplier *= effect;
          break;
        case 'auto_damage':
          bonuses.autoDamageMultiplier *= effect;
          break;
        case 'tap_power':
          bonuses.tapPowerMultiplier *= effect;
          break;
        case 'burst_chance':
          bonuses.burstChanceBonus += effect;
          break;
        case 'burst_damage':
          bonuses.burstDamageMultiplier *= effect;
          break;
        case 'starting_scrap':
          bonuses.startingScrapBonus += effect;
          break;
        case 'wave_rewards':
          bonuses.waveRewardsMultiplier *= effect;
          break;
      }
    }

    return bonuses;
  }

  /**
   * Get starting scrap bonus from prestige upgrades.
   * Uses centralized formula from src/data/formulas/prestige.ts
   */
  getStartingScrap(ownedUpgrades: Record<string, number>, highestWave: number = 0): number {
    const upgradeLevel = ownedUpgrades.starting_scrap ?? 0;
    return calculateStartingScrapBonus(upgradeLevel, highestWave);
  }

  /**
   * Get all available prestige upgrades with current status
   */
  getUpgradeStatus(
    blueprints: number,
    ownedUpgrades: Record<string, number>,
  ): Array<{
    upgrade: PrestigeUpgradeDefinition;
    currentLevel: number;
    nextCost: number | null;
    canAfford: boolean;
    isMaxed: boolean;
    currentEffect: number;
    nextEffect: number | null;
  }> {
    return PRESTIGE_UPGRADES.map(upgrade => {
      const currentLevel = ownedUpgrades[upgrade.id] ?? 0;
      const isMaxed = currentLevel >= upgrade.maxLevel;
      const nextCost = isMaxed ? null : getUpgradeCost(upgrade, currentLevel);
      const canAfford = nextCost !== null && blueprints >= nextCost;

      return {
        upgrade,
        currentLevel,
        nextCost,
        canAfford,
        isMaxed,
        currentEffect: currentLevel > 0 ? getUpgradeEffect(upgrade, currentLevel) : 0,
        nextEffect: isMaxed ? null : getUpgradeEffect(upgrade, currentLevel + 1),
      };
    });
  }

  /**
   * Get total blueprints spent on upgrades
   */
  getTotalBlueprintsSpent(ownedUpgrades: Record<string, number>): number {
    let total = 0;

    for (const upgrade of PRESTIGE_UPGRADES) {
      const level = ownedUpgrades[upgrade.id] ?? 0;
      for (let i = 0; i < level; i++) {
        total += getUpgradeCost(upgrade, i);
      }
    }

    return total;
  }

  /**
   * Calculate prestige level based on total blueprints earned.
   * Uses centralized formula from src/data/formulas/prestige.ts
   */
  calculatePrestigeLevel(totalBlueprintsEarned: number): number {
    return calculatePrestigeLevelFormula(totalBlueprintsEarned);
  }

  /**
   * Get prestige rank name based on level.
   * Uses centralized formula from src/data/formulas/prestige.ts
   */
  getPrestigeRank(level: number): string {
    return getPrestigeRankFormula(level);
  }

  /**
   * Calculate the cost to purchase a builder with blueprints.
   * Uses centralized formula from src/data/formulas/prestige.ts
   */
  getBuilderPurchaseCost(buildersPurchased: number): number {
    return calculateBuilderPurchaseCost(buildersPurchased);
  }

  /**
   * Check if player can afford to purchase a builder with blueprints.
   */
  canAffordBuilder(blueprints: number, buildersPurchased: number): boolean {
    return blueprints >= this.getBuilderPurchaseCost(buildersPurchased);
  }

  /**
   * Purchase a builder with blueprints.
   */
  purchaseBuilder(
    blueprints: number,
    buildersPurchased: number,
  ): {success: boolean; cost: number; remainingBlueprints: number} {
    const cost = this.getBuilderPurchaseCost(buildersPurchased);
    if (blueprints < cost) {
      return {success: false, cost, remainingBlueprints: blueprints};
    }
    return {success: true, cost, remainingBlueprints: blueprints - cost};
  }

  /**
   * Create initial player state with prestige bonuses applied
   */
  createPostPrestigeState(
    previousPlayer: PlayerState,
    blueprintsEarned: number,
    baseBuilders: number,
  ): PlayerState {
    const newTotalBlueprints = previousPlayer.blueprints + blueprintsEarned;
    const startingScrap = this.getStartingScrap(previousPlayer.prestigeUpgrades, previousPlayer.highestWave);

    return {
      scrap: startingScrap,
      blueprints: newTotalBlueprints,
      totalBlueprintsEarned: previousPlayer.totalBlueprintsEarned + blueprintsEarned,
      prestigeCount: previousPlayer.prestigeCount + 1,
      buildingTier: 0,
      highestWave: Math.max(previousPlayer.highestWave, 0),
      totalTaps: 0,
      totalEnemiesDefeated: 0,
      totalScrapEarned: 0,
      builders: {
        total: baseBuilders,
        available: baseBuilders,
        maxBuilders: previousPlayer.builders.maxBuilders,
      },
      prestigeUpgrades: {...previousPlayer.prestigeUpgrades},
      activeBoosts: [],
      buildersPurchased: previousPlayer.buildersPurchased,
    };
  }
}
