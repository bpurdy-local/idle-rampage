/**
 * Debug configuration for testing.
 * SET ALL TO FALSE BEFORE RELEASE!
 */
export const DEBUG_CONFIG = {
  // Master toggle - set to false to disable all debug features
  ENABLED: true,

  // Multipliers for faster progression
  SCRAP_MULTIPLIER: 100, // 100x scrap gains
  DAMAGE_MULTIPLIER: 10, // 10x damage dealt
  WAVE_TIMER_MULTIPLIER: 0.33, // 3x faster wave timer (0.33 = 33% of normal time)

  // Instant unlocks
  UNLOCK_ALL_BUILDINGS: false, // Start with all buildings unlocked
  MAX_BUILDERS: false, // Start with max builders

  // Skip features
  SKIP_DAILY_REWARD_COOLDOWN: true, // Can claim daily reward repeatedly
};

// Helper to check if debug mode is active
export const isDebugMode = () => DEBUG_CONFIG.ENABLED;
