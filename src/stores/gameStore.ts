import {create} from 'zustand';
import {
  GameState,
  BuildingState,
  EnemyState,
  BoostState,
  DailyRewardState,
  createInitialGameState,
} from '../core/GameState';
import {eventBus, GameEvents} from '../core/EventBus';
import {
  getMaxTotalBuilders,
  getEvolvableBuildingById,
  getCurrentEvolutionTier,
  getBuildingsEvolvingAtWave,
} from '../data/buildings';
import {getTierForPrestigeCount, wouldUnlockMilestone} from '../data/prestigeMilestones';
import {PrestigeSystem} from '../systems/PrestigeSystem';

interface GameActions {
  setScrap: (amount: number) => void;
  addScrap: (amount: number) => void;
  setBlueprints: (amount: number) => void;
  addBlueprints: (amount: number) => void;

  assignBuilder: (buildingId: string) => boolean;
  unassignBuilder: (buildingId: string) => boolean;
  addBuilders: (count: number) => void;
  purchaseBuilderWithBlueprints: () => {success: boolean; cost: number};

  setBuildings: (buildings: BuildingState[]) => void;
  updateBuilding: (buildingId: string, updates: Partial<BuildingState>) => void;
  upgradeBuilding: (buildingId: string) => void;

  setCurrentEnemy: (enemy: EnemyState | null) => void;
  damageEnemy: (damage: number) => void;
  setCombatActive: (active: boolean) => void;
  setWaveTimer: (time: number) => void;
  updateCombatStats: (stats: Partial<GameState['combat']>) => void;

  setCurrentWave: (wave: number) => void;
  advanceWave: () => void;

  setPrestigeUpgrade: (upgradeId: string, level: number) => void;

  addBoost: (boost: BoostState) => void;
  removeBoost: (boostId: string) => void;
  tickBoosts: (deltaTime: number) => void;

  resetForPrestige: () => void;
  loadState: (state: GameState) => void;

  updateDailyRewards: (dailyRewards: DailyRewardState) => void;
  resetDailyClaimFlag: () => void;

  getState: () => GameState;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialGameState(),

  setScrap: (amount: number) => set({player: {...get().player, scrap: amount}}),

  addScrap: (amount: number) => {
    const player = get().player;
    set({
      player: {
        ...player,
        scrap: player.scrap + amount,
        totalScrapEarned: player.totalScrapEarned + amount,
      },
    });
    eventBus.emit(GameEvents.RESOURCE_GAINED, {type: 'scrap', amount});
  },

  setBlueprints: (amount: number) =>
    set({player: {...get().player, blueprints: amount}}),

  addBlueprints: (amount: number) => {
    const player = get().player;
    set({
      player: {
        ...player,
        blueprints: player.blueprints + amount,
        totalBlueprintsEarned: player.totalBlueprintsEarned + amount,
      },
    });
    eventBus.emit(GameEvents.RESOURCE_GAINED, {type: 'blueprints', amount});
  },

  assignBuilder: (buildingId: string) => {
    const state = get();
    if (state.player.builders.available <= 0) return false;

    const buildingIndex = state.buildings.findIndex(b => b.id === buildingId);
    if (buildingIndex === -1) return false;

    const building = state.buildings[buildingIndex];
    if (!building.isUnlocked) return false;

    // Check if building accepts workers and has capacity
    const evolvableBuilding = getEvolvableBuildingById(building.typeId);
    if (!evolvableBuilding) return false;

    // Buildings with noWorkers property (like command_center) don't accept builders
    if (evolvableBuilding.noWorkers) {
      return false;
    }

    // Check if building has reached its max builder capacity
    if (building.assignedBuilders >= evolvableBuilding.maxBuilders) {
      return false;
    }

    const updatedBuildings = [...state.buildings];
    updatedBuildings[buildingIndex] = {
      ...building,
      assignedBuilders: building.assignedBuilders + 1,
    };

    set({
      buildings: updatedBuildings,
      player: {
        ...state.player,
        builders: {
          ...state.player.builders,
          available: state.player.builders.available - 1,
        },
      },
    });

    eventBus.emit(GameEvents.BUILDER_ASSIGNED, {
      buildingId,
      assigned: building.assignedBuilders + 1,
    });
    return true;
  },

  unassignBuilder: (buildingId: string) => {
    const state = get();
    const buildingIndex = state.buildings.findIndex(b => b.id === buildingId);
    if (buildingIndex === -1) return false;

    const building = state.buildings[buildingIndex];
    if (building.assignedBuilders <= 0) return false;

    const updatedBuildings = [...state.buildings];
    updatedBuildings[buildingIndex] = {
      ...building,
      assignedBuilders: building.assignedBuilders - 1,
    };

    set({
      buildings: updatedBuildings,
      player: {
        ...state.player,
        builders: {
          ...state.player.builders,
          available: state.player.builders.available + 1,
        },
      },
    });

    eventBus.emit(GameEvents.BUILDER_ASSIGNED, {
      buildingId,
      assigned: building.assignedBuilders - 1,
    });
    return true;
  },

  addBuilders: (count: number) => {
    const player = get().player;
    const maxBuilders = getMaxTotalBuilders();
    const actualCount = Math.min(count, maxBuilders - player.builders.total);
    if (actualCount <= 0) return;
    set({
      player: {
        ...player,
        builders: {
          ...player.builders,
          total: player.builders.total + actualCount,
          available: player.builders.available + actualCount,
        },
      },
    });
  },

  purchaseBuilderWithBlueprints: () => {
    const player = get().player;
    const prestigeSystem = new PrestigeSystem();
    const maxBuilders = getMaxTotalBuilders();

    // Check if at max builders
    if (player.builders.total >= maxBuilders) {
      return {success: false, cost: 0};
    }

    const result = prestigeSystem.purchaseBuilder(
      player.blueprints,
      player.buildersPurchased,
    );

    if (result.success) {
      set({
        player: {
          ...player,
          blueprints: result.remainingBlueprints,
          buildersPurchased: player.buildersPurchased + 1,
          builders: {
            ...player.builders,
            total: player.builders.total + 1,
            available: player.builders.available + 1,
          },
        },
      });
    }

    return {success: result.success, cost: result.cost};
  },

  setBuildings: (buildings: BuildingState[]) => set({buildings}),

  updateBuilding: (buildingId: string, updates: Partial<BuildingState>) => {
    const buildings = get().buildings;
    const index = buildings.findIndex(b => b.id === buildingId);
    if (index === -1) return;

    const updatedBuildings = [...buildings];
    updatedBuildings[index] = {...buildings[index], ...updates};
    set({buildings: updatedBuildings});
  },

  upgradeBuilding: (buildingId: string) => {
    const buildings = get().buildings;
    const index = buildings.findIndex(b => b.id === buildingId);
    if (index === -1) return;

    const updatedBuildings = [...buildings];
    updatedBuildings[index] = {
      ...buildings[index],
      level: buildings[index].level + 1,
      upgradeProgress: 0,
    };
    set({buildings: updatedBuildings});
    eventBus.emit(GameEvents.BUILDING_UPGRADED, {
      buildingId,
      newLevel: updatedBuildings[index].level,
    });
  },

  setCurrentEnemy: (enemy: EnemyState | null) =>
    set({combat: {...get().combat, currentEnemy: enemy}}),

  damageEnemy: (damage: number) => {
    const combat = get().combat;
    if (!combat.currentEnemy) return;

    const newHealth = Math.max(0, combat.currentEnemy.currentHealth - damage);
    set({
      combat: {
        ...combat,
        currentEnemy: {...combat.currentEnemy, currentHealth: newHealth},
      },
    });
    eventBus.emit(GameEvents.ENEMY_DAMAGED, {damage, remainingHealth: newHealth});

    if (newHealth <= 0) {
      eventBus.emit(GameEvents.ENEMY_DEFEATED, {enemy: combat.currentEnemy});
    }
  },

  setCombatActive: (active: boolean) =>
    set({combat: {...get().combat, isActive: active}}),

  setWaveTimer: (time: number) =>
    set({combat: {...get().combat, waveTimer: time}}),

  updateCombatStats: (stats: Partial<GameState['combat']>) =>
    set({combat: {...get().combat, ...stats}}),

  setCurrentWave: (wave: number) => {
    const state = get();
    set({
      currentWave: wave,
      player: {
        ...state.player,
        highestWave: Math.max(state.player.highestWave, wave),
      },
    });
  },

  advanceWave: () => {
    const state = get();
    const newWave = state.currentWave + 1;

    // Update buildings: unlock new ones and evolve existing ones
    const updatedBuildings = state.buildings.map(building => {
      const evolvableBuilding = getEvolvableBuildingById(building.typeId);
      if (!evolvableBuilding) return building;

      let updated = {...building};

      // Unlock building if not already unlocked
      if (!building.isUnlocked) {
        const firstTier = evolvableBuilding.tiers[0];
        if (firstTier.unlockWave <= newWave) {
          updated.isUnlocked = true;
        }
      }

      // Check for evolution
      if (building.isUnlocked || updated.isUnlocked) {
        const currentTier = getCurrentEvolutionTier(evolvableBuilding, newWave);
        if (currentTier.tier > building.evolutionTier) {
          updated.evolutionTier = currentTier.tier;
        }
      }

      return updated;
    });

    set({
      currentWave: newWave,
      buildings: updatedBuildings,
      player: {
        ...state.player,
        highestWave: Math.max(state.player.highestWave, newWave),
      },
    });

    // Emit wave cleared event
    eventBus.emit(GameEvents.WAVE_CLEARED, {wave: state.currentWave});

    // Check for and emit building evolution events
    const evolutions = getBuildingsEvolvingAtWave(newWave);
    for (const {building, newTier} of evolutions) {
      eventBus.emit(GameEvents.BUILDING_EVOLVED, {
        buildingId: building.id,
        newTier: newTier,
      });
    }
  },

  setPrestigeUpgrade: (upgradeId: string, level: number) => {
    const player = get().player;
    set({
      player: {
        ...player,
        prestigeUpgrades: {
          ...player.prestigeUpgrades,
          [upgradeId]: level,
        },
      },
    });
  },

  /**
   * Add a boost to the player's active boosts.
   *
   * BOOST STACKING RULES:
   * 1. Same-type boosts: Multipliers multiply together (2x + 2x = 4x)
   * 2. Different-type boosts: Each applies independently
   * 3. Maximum effective multiplier: 10x cap (enforced at consumption)
   * 4. Duration: Each boost tracks its own remaining duration independently
   *
   * Example: 2x production boost + 2x all boost = 4x production, 2x combat
   */
  addBoost: (boost: BoostState) => {
    const player = get().player;
    set({
      player: {
        ...player,
        activeBoosts: [...player.activeBoosts, boost],
      },
    });
  },

  removeBoost: (boostId: string) => {
    const player = get().player;
    set({
      player: {
        ...player,
        activeBoosts: player.activeBoosts.filter(b => b.id !== boostId),
      },
    });
  },

  tickBoosts: (deltaTime: number) => {
    const player = get().player;
    const updatedBoosts = player.activeBoosts
      .map(b => ({...b, remainingDuration: b.remainingDuration - deltaTime}))
      .filter(b => b.remainingDuration > 0);
    set({
      player: {
        ...player,
        activeBoosts: updatedBoosts,
      },
    });
  },

  resetForPrestige: () => {
    const state = get();
    const initialState = createInitialGameState();
    const newPrestigeCount = state.player.prestigeCount + 1;

    // Check if this prestige unlocks a new milestone
    const unlockedMilestone = wouldUnlockMilestone(
      state.player.prestigeCount,
      newPrestigeCount,
    );

    // Get the new tier based on the new prestige count
    const newTier = getTierForPrestigeCount(newPrestigeCount);

    // Calculate starting scrap bonus from prestige upgrades
    const prestigeSystem = new PrestigeSystem();
    const startingScrap = prestigeSystem.getStartingScrap(
      state.player.prestigeUpgrades,
      state.player.highestWave,
    );

    set({
      player: {
        ...initialState.player,
        scrap: startingScrap,
        blueprints: state.player.blueprints,
        totalBlueprintsEarned: state.player.totalBlueprintsEarned,
        prestigeCount: newPrestigeCount,
        buildingTier: newTier.tier,
        highestWave: state.player.highestWave,
        builders: {
          total: state.player.builders.total,
          available: state.player.builders.total,
          maxBuilders: state.player.builders.maxBuilders,
        },
        prestigeUpgrades: state.player.prestigeUpgrades,
        activeBoosts: [],
        buildersPurchased: state.player.buildersPurchased,
      },
      // Reset buildings to initial state (wave 1, tier 1)
      buildings: initialState.buildings.map(b => ({
        ...b,
        level: 1,
        assignedBuilders: 0,
        productionProgress: 0,
        upgradeProgress: 0,
        evolutionTier: 1,
      })),
      combat: initialState.combat,
      currentWave: 1,
    });

    eventBus.emit(GameEvents.PRESTIGE_TRIGGERED, {
      prestigeCount: newPrestigeCount,
    });

    // Emit milestone event if a new tier was unlocked
    if (unlockedMilestone) {
      eventBus.emit(GameEvents.MILESTONE_REACHED, {
        tier: unlockedMilestone,
        prestigeCount: newPrestigeCount,
      });
    }
  },

  loadState: (state: GameState) => set(state),

  updateDailyRewards: (dailyRewards: DailyRewardState) => set({dailyRewards}),

  resetDailyClaimFlag: () => {
    const state = get();
    set({
      dailyRewards: {
        ...state.dailyRewards,
        hasClaimedToday: false,
      },
    });
  },

  getState: () => {
    const {player, buildings, combat, currentWave, dailyRewards} = get();
    return {player, buildings, combat, currentWave, dailyRewards};
  },
}));
