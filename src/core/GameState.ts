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
   * Base tap damage before multipliers.
   * Training Facility now provides % bonus, not flat damage.
   * Effective tap damage = baseTapDamage * trainingFacilityBonus * prestigeMultiplier * boostMultiplier
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

export interface SpecialEffectState {
  lastScrapFindTime: number;
  waveExtensionApplied: boolean;
}

export interface GameState {
  player: PlayerState;
  buildings: BuildingState[];
  combat: CombatState;
  currentWave: number;
  dailyRewards: DailyRewardState;
  hasCompletedOnboarding: boolean;
  specialEffects: SpecialEffectState;
}

export const createInitialGameState = (): GameState => ({
  player: {
    scrap: 100, // Starting scrap for first building upgrade
    blueprints: 0,
    totalBlueprintsEarned: 0,
    prestigeCount: 0,
    buildingTier: 0,
    highestWave: 0,
    totalTaps: 0,
    totalEnemiesDefeated: 0,
    totalScrapEarned: 0,
    builders: {
      total: 5, // Start with 5 builders
      available: 5,
      maxBuilders: 250, // Increased max builders cap
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
    waveTimerMax: 30, // Matches BASE_WAVE_TIMER_SECONDS in progression.ts
    autoDamagePerTick: 1,
    burstChance: 0, // DEFAULT_BURST_CHANCE - burst only from Training Facility
    burstMultiplier: 6, // DEFAULT_BURST_MULTIPLIER from combat.ts
    baseTapDamage: 5, // BASE_TAP_DAMAGE from combat.ts
  },
  currentWave: 1,
  dailyRewards: {
    lastLoginDate: null,
    currentStreak: 0,
    totalDaysLoggedIn: 0,
    hasClaimedToday: false,
  },
  hasCompletedOnboarding: false,
  specialEffects: {
    lastScrapFindTime: 0,
    waveExtensionApplied: false,
  },
});
