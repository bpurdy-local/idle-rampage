/**
 * Progression Formulas
 *
 * All formulas related to game progression, including:
 * - Enemy health and reward scaling
 * - Wave timer calculation
 * - Wave completion rewards
 * - Boss mechanics
 */

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

// Wave timer configuration - snappy timers, pacing from enemy HP
// Shorter timers keep engagement high, upgrades matter for beating the clock
export const BASE_WAVE_TIMER_SECONDS = 30;
export const WAVE_TIMER_BONUS_PER_WAVE = 0.75;
export const MAX_WAVE_TIMER_SECONDS = 75;

// Boss configuration - adjusted to match enemies.ts BOSS_CONFIG
export const BOSS_WAVE_INTERVAL = 10;
export const BOSS_HEALTH_MULTIPLIER = 2.0;
export const BOSS_REWARD_MULTIPLIER = 4.0;
export const BOSS_TIMER_MULTIPLIER = 1.8;

// Wave reward configuration - aggressive scaling for faster progression
export const WAVE_REWARD_BASE_PER_WAVE = 100;
export const WAVE_REWARD_POLYNOMIAL_EXPONENT = 1.8;
export const WAVE_REWARD_MULTIPLIER_PER_20_WAVES = 0.3;
export const WAVE_REWARD_MULTIPLIER_CAP = 5;

// =============================================================================
// ENEMY SCALING FORMULAS
// =============================================================================

/**
 * Calculate enemy health for a wave within a tier.
 *
 * Formula: baseHealth * (healthMultiplier ^ wavesIntoTier)
 *
 * @param tierBaseHealth - Base health for this enemy tier
 * @param healthMultiplierPerWave - How much health increases per wave (e.g., 1.35)
 * @param wavesIntoTier - How many waves into this tier (wave - tierMinWave)
 */
export function calculateEnemyHealth(
  tierBaseHealth: number,
  healthMultiplierPerWave: number,
  wavesIntoTier: number,
): number {
  return Math.floor(tierBaseHealth * Math.pow(healthMultiplierPerWave, wavesIntoTier));
}

/**
 * Calculate enemy reward for a wave within a tier.
 *
 * Formula: baseReward * (rewardMultiplier ^ wavesIntoTier)
 *
 * @param tierBaseReward - Base reward for this enemy tier
 * @param rewardMultiplierPerWave - How much reward increases per wave (e.g., 1.35)
 * @param wavesIntoTier - How many waves into this tier (wave - tierMinWave)
 */
export function calculateEnemyReward(
  tierBaseReward: number,
  rewardMultiplierPerWave: number,
  wavesIntoTier: number,
): number {
  return Math.floor(tierBaseReward * Math.pow(rewardMultiplierPerWave, wavesIntoTier));
}

/**
 * Calculate boss health.
 *
 * Formula: baseEnemyHealth * 3.0
 */
export function calculateBossHealth(baseEnemyHealth: number): number {
  return Math.floor(baseEnemyHealth * BOSS_HEALTH_MULTIPLIER);
}

/**
 * Calculate boss reward.
 *
 * Formula: baseEnemyReward * 5.0
 */
export function calculateBossReward(baseEnemyReward: number): number {
  return Math.floor(baseEnemyReward * BOSS_REWARD_MULTIPLIER);
}

// =============================================================================
// WAVE TIMER FORMULAS
// =============================================================================

/**
 * Calculate wave timer duration.
 *
 * Formula: min(baseTimer + wave * bonusPerWave, maxTimer)
 *
 * Examples:
 * - Wave 1: 30.75s
 * - Wave 20: 45s
 * - Wave 40: 60s
 * - Wave 60+: 75s (capped)
 */
export function calculateWaveTimer(wave: number): number {
  const baseTimer = BASE_WAVE_TIMER_SECONDS + wave * WAVE_TIMER_BONUS_PER_WAVE;
  return Math.min(baseTimer, MAX_WAVE_TIMER_SECONDS);
}

/**
 * Calculate boss wave timer.
 *
 * Formula: normalTimer * 1.5
 */
export function calculateBossWaveTimer(normalTimer: number): number {
  return normalTimer * BOSS_TIMER_MULTIPLIER;
}

/**
 * Check if a wave is a boss wave.
 *
 * Boss every 10 waves (10, 20, 30, etc.)
 */
export function isBossWave(wave: number): boolean {
  return wave > 0 && wave % BOSS_WAVE_INTERVAL === 0;
}

/**
 * Get waves until next boss.
 */
export function getWavesUntilBoss(currentWave: number): number {
  return BOSS_WAVE_INTERVAL - (currentWave % BOSS_WAVE_INTERVAL);
}

// =============================================================================
// WAVE REWARD FORMULAS
// =============================================================================

/**
 * Calculate wave completion bonus scrap.
 *
 * Components:
 * - Base bonus: wave * 100
 * - Polynomial scaling: wave^1.8 (aggressive scaling)
 * - Wave multiplier: +30% per 20 waves (capped at 5x)
 *
 * Examples:
 * - Wave 10: ~1,100 bonus scrap
 * - Wave 40: ~12,000 bonus scrap
 * - Wave 100: ~160,000 bonus scrap
 */
export function calculateWaveCompletionBonus(wave: number): number {
  const baseBonus = wave * WAVE_REWARD_BASE_PER_WAVE;
  const polynomialBonus = Math.pow(wave, WAVE_REWARD_POLYNOMIAL_EXPONENT);
  const waveBonus = Math.floor(baseBonus + polynomialBonus);

  const waveMultiplier = Math.min(
    WAVE_REWARD_MULTIPLIER_CAP,
    1 + Math.floor(wave / 20) * WAVE_REWARD_MULTIPLIER_PER_20_WAVES,
  );

  return Math.floor(waveBonus * waveMultiplier);
}

/**
 * Calculate total wave reward.
 *
 * Formula: (enemyReward + waveBonus) * prestigeMultiplier * boostMultiplier
 */
export function calculateWaveReward(
  enemyReward: number,
  wave: number,
  prestigeRewardBonus: number = 1,
  boostMultiplier: number = 1,
): {baseScrap: number; bonusScrap: number; totalScrap: number} {
  const baseScrap = enemyReward;
  const bonusScrap = calculateWaveCompletionBonus(wave);
  const totalScrap = Math.floor((baseScrap + bonusScrap) * prestigeRewardBonus * boostMultiplier);

  return {baseScrap, bonusScrap, totalScrap};
}

// =============================================================================
// DIFFICULTY RATING
// =============================================================================

/**
 * Get wave difficulty label.
 * Adjusted to match new enemy tier wave ranges.
 */
export function getWaveDifficulty(wave: number): string {
  if (wave <= 12) return 'Easy';
  if (wave <= 30) return 'Normal';
  if (wave <= 55) return 'Hard';
  if (wave <= 80) return 'Expert';
  return 'Insane';
}
