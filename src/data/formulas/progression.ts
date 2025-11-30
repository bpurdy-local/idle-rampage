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

// Wave timer configuration
export const BASE_WAVE_TIMER_SECONDS = 20;
export const WAVE_TIMER_BONUS_PER_WAVE = 0.2;
export const MAX_WAVE_TIMER_SECONDS = 60;

// Boss configuration
export const BOSS_WAVE_INTERVAL = 10;
export const BOSS_HEALTH_MULTIPLIER = 3.0;
export const BOSS_REWARD_MULTIPLIER = 5.0;
export const BOSS_TIMER_MULTIPLIER = 1.5;

// Wave reward configuration
export const WAVE_REWARD_BASE_PER_WAVE = 50;
export const WAVE_REWARD_POLYNOMIAL_EXPONENT = 1.5;
export const WAVE_REWARD_MULTIPLIER_PER_20_WAVES = 0.25;
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
 * - Wave 1: 20.2s
 * - Wave 50: 30s
 * - Wave 100: 40s
 * - Wave 200+: 60s (capped)
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
 * - Base bonus: wave * 50
 * - Polynomial scaling: wave^1.5
 * - Wave multiplier: +25% per 20 waves (capped at 5x)
 *
 * Examples:
 * - Wave 10: ~816 bonus scrap
 * - Wave 50: ~7,954 bonus scrap
 * - Wave 100: ~50,000 bonus scrap
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
 */
export function getWaveDifficulty(wave: number): string {
  if (wave <= 10) return 'Easy';
  if (wave <= 25) return 'Normal';
  if (wave <= 50) return 'Hard';
  if (wave <= 100) return 'Expert';
  return 'Insane';
}
