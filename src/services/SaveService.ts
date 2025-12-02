import AsyncStorage from '@react-native-async-storage/async-storage';
import {GameState, createInitialGameState} from '../core/GameState';
import {eventBus, GameEvents} from '../core/EventBus';

const SAVE_KEY = '@idle_rampage_save';
const SAVE_VERSION = 1;

interface SaveData {
  version: number;
  timestamp: number;
  gameState: GameState;
}

export interface SaveResult {
  success: boolean;
  error?: string;
  timestamp?: number;
}

export interface LoadResult {
  success: boolean;
  gameState?: GameState;
  error?: string;
  wasOffline?: boolean;
  offlineTime?: number;
}

export class SaveService {
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private readonly AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Save game state to AsyncStorage
   */
  async save(gameState: GameState): Promise<SaveResult> {
    try {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        gameState,
      };

      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

      eventBus.emit(GameEvents.GAME_SAVED, {timestamp: saveData.timestamp});

      return {
        success: true,
        timestamp: saveData.timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error saving game';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Load game state from AsyncStorage
   */
  async load(): Promise<LoadResult> {
    try {
      const savedJson = await AsyncStorage.getItem(SAVE_KEY);

      if (!savedJson) {
        return {
          success: true,
          gameState: createInitialGameState(),
          wasOffline: false,
        };
      }

      const saveData: SaveData = JSON.parse(savedJson);
      const migratedState = this.migrateState(saveData);

      const offlineTime = Date.now() - saveData.timestamp;

      eventBus.emit(GameEvents.GAME_LOADED, {
        timestamp: saveData.timestamp,
        offlineTime,
      });

      return {
        success: true,
        gameState: migratedState,
        wasOffline: offlineTime > 60000, // More than 1 minute offline
        offlineTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading game';
      return {
        success: false,
        error: errorMessage,
        gameState: createInitialGameState(),
      };
    }
  }

  /**
   * Check if a save exists
   */
  async hasSave(): Promise<boolean> {
    try {
      const savedJson = await AsyncStorage.getItem(SAVE_KEY);
      return savedJson !== null;
    } catch {
      return false;
    }
  }

  /**
   * Delete save data (for testing or reset)
   */
  async deleteSave(): Promise<SaveResult> {
    try {
      await AsyncStorage.removeItem(SAVE_KEY);
      return {success: true};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error deleting save';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Start auto-saving at regular intervals
   */
  startAutoSave(getState: () => GameState): void {
    this.stopAutoSave();

    this.autoSaveInterval = setInterval(async () => {
      try {
        const state = getState();
        await this.save(state);
      } catch (error) {
        console.error('[SaveService] Auto-save failed:', error);
      }
    }, this.AUTO_SAVE_INTERVAL_MS);
  }

  /**
   * Stop auto-saving
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Migrate old save formats to current version
   */
  private migrateState(saveData: SaveData): GameState {
    let state = saveData.gameState;

    // Migration: Add dailyRewards if missing (for saves before this feature)
    if (!state.dailyRewards) {
      state = {
        ...state,
        dailyRewards: {
          lastLoginDate: null,
          currentStreak: 0,
          totalDaysLoggedIn: 0,
          hasClaimedToday: false,
        },
      };
    }

    // Migration: Update buildings array for new building types
    state = this.migrateBuildingsArray(state);

    return state;
  }

  /**
   * Ensure buildings array has all required building types and correct structure
   */
  private migrateBuildingsArray(state: GameState): GameState {
    const requiredBuildings = [
      {id: 'scrap_works_1', typeId: 'scrap_works', unlockWave: 1},
      {id: 'weak_point_scanner_1', typeId: 'weak_point_scanner', unlockWave: 3},
      {id: 'training_facility_1', typeId: 'training_facility', unlockWave: 5},
      {id: 'engineering_bay_1', typeId: 'engineering_bay', unlockWave: 10},
      {id: 'command_center_1', typeId: 'command_center', unlockWave: 20},
    ];

    const existingBuildingIds = new Set(state.buildings.map(b => b.typeId));
    const updatedBuildings = [...state.buildings];

    // Remove old defense_station if it exists (replaced by turret_station + training_facility)
    const defenseStationIndex = updatedBuildings.findIndex(b => b.typeId === 'defense_station');
    if (defenseStationIndex !== -1) {
      updatedBuildings.splice(defenseStationIndex, 1);
    }

    // Remove old salvage_yard if it exists (building was removed from game)
    const salvageYardIndex = updatedBuildings.findIndex(b => b.typeId === 'salvage_yard');
    if (salvageYardIndex !== -1) {
      updatedBuildings.splice(salvageYardIndex, 1);
    }

    // Migrate turret_station to weak_point_scanner (keeping progress)
    const turretIndex = updatedBuildings.findIndex(b => b.typeId === 'turret_station');
    if (turretIndex !== -1) {
      updatedBuildings[turretIndex] = {
        ...updatedBuildings[turretIndex],
        id: 'weak_point_scanner_1',
        typeId: 'weak_point_scanner',
      };
    }

    // Add any missing buildings
    for (const required of requiredBuildings) {
      if (!existingBuildingIds.has(required.typeId)) {
        updatedBuildings.push({
          id: required.id,
          typeId: required.typeId,
          level: 1,
          assignedBuilders: 0,
          productionProgress: 0,
          upgradeProgress: 0,
          isUnlocked: state.currentWave >= required.unlockWave,
          evolutionTier: 1,
        });
      }
    }

    // Ensure all buildings have evolutionTier field
    for (const building of updatedBuildings) {
      if (building.evolutionTier === undefined) {
        building.evolutionTier = 1;
      }
    }

    return {
      ...state,
      buildings: updatedBuildings,
    };
  }

  /**
   * Export save data as JSON string (for backup/transfer)
   */
  async exportSave(): Promise<{success: boolean; data?: string; error?: string}> {
    try {
      const savedJson = await AsyncStorage.getItem(SAVE_KEY);

      if (!savedJson) {
        return {
          success: false,
          error: 'No save data found',
        };
      }

      return {
        success: true,
        data: savedJson,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error exporting save';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Import save data from JSON string (for restore/transfer)
   */
  async importSave(jsonData: string): Promise<SaveResult> {
    try {
      // Validate JSON structure
      const saveData: SaveData = JSON.parse(jsonData);

      if (!saveData.version || !saveData.gameState) {
        return {
          success: false,
          error: 'Invalid save data format',
        };
      }

      // Migrate if needed
      const migratedState = this.migrateState(saveData);

      // Save the imported data
      const newSaveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        gameState: migratedState,
      };

      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(newSaveData));

      return {
        success: true,
        timestamp: newSaveData.timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error importing save';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get save metadata without loading full state
   */
  async getSaveInfo(): Promise<{
    exists: boolean;
    timestamp?: number;
    version?: number;
    wave?: number;
    prestigeCount?: number;
  }> {
    try {
      const savedJson = await AsyncStorage.getItem(SAVE_KEY);

      if (!savedJson) {
        return {exists: false};
      }

      const saveData: SaveData = JSON.parse(savedJson);

      return {
        exists: true,
        timestamp: saveData.timestamp,
        version: saveData.version,
        wave: saveData.gameState.currentWave,
        prestigeCount: saveData.gameState.player.prestigeCount,
      };
    } catch {
      return {exists: false};
    }
  }
}

// Singleton instance
export const saveService = new SaveService();
