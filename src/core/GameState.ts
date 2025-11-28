export interface BuildingState {
  id: string;
  typeId: string;
  level: number;
  assignedBuilders: number;
  productionProgress: number;
  upgradeProgress: number;
  isUnlocked: boolean;
}

export interface EnemyState {
  id: string;
  tierId: string;
  name: string;
  currentHealth: number;
  maxHealth: number;
  reward: number;
  wave?: number;
}

export interface CombatState {
  isActive: boolean;
  currentEnemy: EnemyState | null;
  waveTimer: number;
  waveTimerMax: number;
  autoDamagePerTick: number;
  burstChance: number;
  burstMultiplier: number;
}

export interface BuilderState {
  total: number;
  available: number;
  maxBuilders: number;
}

export interface PlayerState {
  scrap: number;
  blueprints: number;
  totalBlueprintsEarned: number;
  prestigeCount: number;
  highestWave: number;
  totalTaps: number;
  totalEnemiesDefeated: number;
  totalScrapEarned: number;
  builders: BuilderState;
  prestigeUpgrades: Record<string, number>;
  activeBoosts: BoostState[];
}

export interface BoostState {
  id: string;
  remainingDuration: number;
  multiplier: number;
}

export interface DailyRewardState {
  lastLoginDate: string | null;
  currentStreak: number;
  totalDaysLoggedIn: number;
  hasClaimedToday: boolean;
}

export interface GameState {
  player: PlayerState;
  buildings: BuildingState[];
  combat: CombatState;
  currentWave: number;
  dailyRewards: DailyRewardState;
}

export const createInitialGameState = (): GameState => ({
  player: {
    scrap: 0,
    blueprints: 0,
    totalBlueprintsEarned: 0,
    prestigeCount: 0,
    highestWave: 0,
    totalTaps: 0,
    totalEnemiesDefeated: 0,
    totalScrapEarned: 0,
    builders: {
      total: 10,
      available: 10,
      maxBuilders: 100,
    },
    prestigeUpgrades: {},
    activeBoosts: [],
  },
  buildings: [
    {
      id: 'scrap_collector_1',
      typeId: 'scrap_collector',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: true, // unlockWave: 1
    },
    {
      id: 'turret_bay_1',
      typeId: 'turret_bay',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 3
    },
    {
      id: 'recycler_1',
      typeId: 'recycler',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 5
    },
    {
      id: 'training_ground_1',
      typeId: 'training_ground',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 5
    },
    {
      id: 'weapons_lab_1',
      typeId: 'weapons_lab',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 10
    },
    {
      id: 'factory_1',
      typeId: 'factory',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 15
    },
    {
      id: 'command_center_1',
      typeId: 'command_center',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 25
    },
  ],
  combat: {
    isActive: false,
    currentEnemy: null,
    waveTimer: 0,
    waveTimerMax: 30,
    autoDamagePerTick: 1,
    burstChance: 0.05,
    burstMultiplier: 5,
  },
  currentWave: 1,
  dailyRewards: {
    lastLoginDate: null,
    currentStreak: 0,
    totalDaysLoggedIn: 0,
    hasClaimedToday: false,
  },
});
