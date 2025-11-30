export interface BuildingState {
  id: string;
  typeId: string;
  level: number;
  assignedBuilders: number;
  productionProgress: number;
  upgradeProgress: number;
  isUnlocked: boolean;
  /** Current evolution tier (1-indexed) */
  evolutionTier: number;
}

export interface EnemyState {
  id: string;
  tierId: string;
  name: string;
  currentHealth: number;
  maxHealth: number;
  reward: number;
  wave?: number;
  isBoss?: boolean;
}

export interface CombatState {
  isActive: boolean;
  currentEnemy: EnemyState | null;
  waveTimer: number;
  waveTimerMax: number;
  autoDamagePerTick: number;
  burstChance: number;
  burstMultiplier: number;
  /**
   * Base tap damage before wave scaling and training facility bonus.
   * Effective tap damage = baseTapDamage + (highestWave * 2) + trainingFacilityBonus
   */
  baseTapDamage: number;
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
  buildingTier: number;
  highestWave: number;
  totalTaps: number;
  totalEnemiesDefeated: number;
  totalScrapEarned: number;
  builders: BuilderState;
  prestigeUpgrades: Record<string, number>;
  activeBoosts: BoostState[];
  /** Number of builders purchased with blueprints (for escalating cost tiers) */
  buildersPurchased: number;
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
  hasCompletedOnboarding: boolean;
}

export const createInitialGameState = (): GameState => ({
  player: {
    scrap: 0,
    blueprints: 0,
    totalBlueprintsEarned: 0,
    prestigeCount: 0,
    buildingTier: 0,
    highestWave: 0,
    totalTaps: 0,
    totalEnemiesDefeated: 0,
    totalScrapEarned: 0,
    builders: {
      total: 10,
      available: 10,
      maxBuilders: 150,
    },
    prestigeUpgrades: {},
    activeBoosts: [],
    buildersPurchased: 0,
  },
  buildings: [
    {
      id: 'scrap_works_1',
      typeId: 'scrap_works',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: true, // unlockWave: 1
      evolutionTier: 1,
    },
    {
      id: 'training_facility_1',
      typeId: 'training_facility',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 3
      evolutionTier: 1,
    },
    {
      id: 'weak_point_scanner_1',
      typeId: 'weak_point_scanner',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 5
      evolutionTier: 1,
    },
    {
      id: 'command_center_1',
      typeId: 'command_center',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 25
      evolutionTier: 1,
    },
    {
      id: 'engineering_bay_1',
      typeId: 'engineering_bay',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 10
      evolutionTier: 1,
    },
    {
      id: 'shield_generator_1',
      typeId: 'shield_generator',
      level: 1,
      assignedBuilders: 0,
      productionProgress: 0,
      upgradeProgress: 0,
      isUnlocked: false, // unlockWave: 15
      evolutionTier: 1,
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
    baseTapDamage: 5,
  },
  currentWave: 1,
  dailyRewards: {
    lastLoginDate: null,
    currentStreak: 0,
    totalDaysLoggedIn: 0,
    hasClaimedToday: false,
  },
  hasCompletedOnboarding: false,
});
