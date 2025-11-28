import {SaveService} from '../../src/services/SaveService';
import {GameState, createInitialGameState} from '../../src/core/GameState';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  ...createInitialGameState(),
  currentWave: 10,
  ...overrides,
});

describe('SaveService', () => {
  let service: SaveService;

  beforeEach(() => {
    service = new SaveService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    service.stopAutoSave();
  });

  describe('save', () => {
    it('saves game state to AsyncStorage', async () => {
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);
      const state = createMockGameState();

      const result = await service.save(state);

      expect(result.success).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('returns error on failure', async () => {
      mockedAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));
      const state = createMockGameState();

      const result = await service.save(state);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage full');
    });
  });

  describe('load', () => {
    it('returns initial state when no save exists', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await service.load();

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
      expect(result.wasOffline).toBe(false);
    });

    it('loads saved game state', async () => {
      const savedState = createMockGameState({currentWave: 25});
      const saveData = {
        version: 1,
        timestamp: Date.now() - 10000,
        gameState: savedState,
      };
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(saveData));

      const result = await service.load();

      expect(result.success).toBe(true);
      expect(result.gameState?.currentWave).toBe(25);
    });

    it('detects offline time', async () => {
      const savedState = createMockGameState();
      const saveData = {
        version: 1,
        timestamp: Date.now() - 120000, // 2 minutes ago
        gameState: savedState,
      };
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(saveData));

      const result = await service.load();

      expect(result.wasOffline).toBe(true);
      expect(result.offlineTime).toBeGreaterThan(60000);
    });

    it('returns initial state on parse error', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await service.load();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.gameState).toBeDefined(); // Falls back to initial
    });
  });

  describe('hasSave', () => {
    it('returns true when save exists', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('{}');

      const result = await service.hasSave();

      expect(result).toBe(true);
    });

    it('returns false when no save exists', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await service.hasSave();

      expect(result).toBe(false);
    });
  });

  describe('deleteSave', () => {
    it('removes save from storage', async () => {
      mockedAsyncStorage.removeItem.mockResolvedValue(undefined);

      const result = await service.deleteSave();

      expect(result.success).toBe(true);
      expect(mockedAsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('returns error on failure', async () => {
      mockedAsyncStorage.removeItem.mockRejectedValue(new Error('Permission denied'));

      const result = await service.deleteSave();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });
  });

  describe('exportSave', () => {
    it('returns save data as JSON string', async () => {
      const saveData = {
        version: 1,
        timestamp: Date.now(),
        gameState: createMockGameState(),
      };
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(saveData));

      const result = await service.exportSave();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(JSON.parse(result.data!)).toHaveProperty('version');
    });

    it('returns error when no save exists', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await service.exportSave();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No save data found');
    });
  });

  describe('importSave', () => {
    it('imports valid save data', async () => {
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);
      const saveData = {
        version: 1,
        timestamp: Date.now(),
        gameState: createMockGameState({currentWave: 50}),
      };

      const result = await service.importSave(JSON.stringify(saveData));

      expect(result.success).toBe(true);
      expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('rejects invalid JSON', async () => {
      const result = await service.importSave('not valid json');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects invalid save format', async () => {
      const result = await service.importSave(JSON.stringify({foo: 'bar'}));

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid save data format');
    });
  });

  describe('getSaveInfo', () => {
    it('returns save metadata', async () => {
      const savedState = createMockGameState({currentWave: 30});
      savedState.player.prestigeCount = 3;
      const saveData = {
        version: 1,
        timestamp: 1234567890,
        gameState: savedState,
      };
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(saveData));

      const result = await service.getSaveInfo();

      expect(result.exists).toBe(true);
      expect(result.timestamp).toBe(1234567890);
      expect(result.version).toBe(1);
      expect(result.wave).toBe(30);
      expect(result.prestigeCount).toBe(3);
    });

    it('returns exists false when no save', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const result = await service.getSaveInfo();

      expect(result.exists).toBe(false);
    });
  });

  describe('autoSave', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('saves periodically when started', async () => {
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);
      const getState = jest.fn(() => createMockGameState());

      service.startAutoSave(getState);

      expect(mockedAsyncStorage.setItem).not.toHaveBeenCalled();

      jest.advanceTimersByTime(30000);

      // Need to flush promises
      await Promise.resolve();

      expect(getState).toHaveBeenCalled();
    });

    it('stops saving when stopped', () => {
      const getState = jest.fn(() => createMockGameState());

      service.startAutoSave(getState);
      service.stopAutoSave();

      jest.advanceTimersByTime(60000);

      expect(getState).not.toHaveBeenCalled();
    });

    it('replaces previous auto-save when started again', () => {
      const getState1 = jest.fn(() => createMockGameState());
      const getState2 = jest.fn(() => createMockGameState());

      service.startAutoSave(getState1);
      service.startAutoSave(getState2);

      jest.advanceTimersByTime(30000);

      // First one should not be called because it was replaced
      expect(getState1).not.toHaveBeenCalled();
    });
  });
});
