/**
 * Debug configuration for testing.
 * SET ALL TO FALSE/DEFAULT BEFORE RELEASE!
 */
export const DEBUG_CONFIG = {
  // Master toggle - set to false to disable all debug features
  ENABLED: false,

  // Multipliers for faster progression
  SCRAP_MULTIPLIER: 1, // 1x scrap gains (normal)
  DAMAGE_MULTIPLIER: 1, // 1x damage dealt (normal)
  WAVE_TIMER_MULTIPLIER: 1, // 1x wave timer (normal)

  // Starting state overrides (only applied on new game / reset)
  START_WAVE: 1, // Start at this wave (1 = normal)
  START_SCRAP: 100, // Starting scrap amount
  START_BUILDERS: 5, // Starting builder count

  // Instant unlocks
  UNLOCK_ALL_BUILDINGS: false, // Start with all buildings unlocked
  MAX_BUILDERS: false, // Start with max builders

  // Skip features
  SKIP_DAILY_REWARD_COOLDOWN: false, // Can claim daily reward repeatedly
  DISABLE_TUTORIAL: false, // Disable tutorial tooltips
};

// Helper to check if debug mode is active
export const isDebugMode = () => DEBUG_CONFIG.ENABLED;
