// Prestige Milestone System
// Buildings evolve through tiers as players reach prestige count thresholds

export interface PrestigeTier {
  tier: number;
  name: string;
  prestigeRequired: number;
  multiplier: number;
  color: string;
}

export const PRESTIGE_TIERS: PrestigeTier[] = [
  {tier: 0, name: 'Base', prestigeRequired: 0, multiplier: 1.0, color: '#9E9E9E'},
  {tier: 1, name: 'Mk II', prestigeRequired: 1, multiplier: 1.3, color: '#4CAF50'},
  {tier: 2, name: 'Mk III', prestigeRequired: 3, multiplier: 1.7, color: '#2196F3'},
  {tier: 3, name: 'Advanced', prestigeRequired: 5, multiplier: 2.2, color: '#9C27B0'},
  {tier: 4, name: 'Enhanced', prestigeRequired: 8, multiplier: 3.0, color: '#FF9800'},
  {tier: 5, name: 'Superior', prestigeRequired: 12, multiplier: 4.0, color: '#F44336'},
  {tier: 6, name: 'Elite', prestigeRequired: 18, multiplier: 5.5, color: '#E91E63'},
  {tier: 7, name: 'Legendary', prestigeRequired: 25, multiplier: 7.5, color: '#FFD700'},
  {tier: 8, name: 'Transcendent', prestigeRequired: 40, multiplier: 10.0, color: '#00FFFF'},
  {tier: 9, name: 'Ultimate', prestigeRequired: 60, multiplier: 15.0, color: '#FF00FF'},
];

/**
 * Get the tier for a given prestige count
 */
export function getTierForPrestigeCount(prestigeCount: number): PrestigeTier {
  // Find the highest tier the player qualifies for
  for (let i = PRESTIGE_TIERS.length - 1; i >= 0; i--) {
    if (prestigeCount >= PRESTIGE_TIERS[i].prestigeRequired) {
      return PRESTIGE_TIERS[i];
    }
  }
  return PRESTIGE_TIERS[0];
}

/**
 * Get the next milestone tier after the current one
 */
export function getNextMilestone(prestigeCount: number): PrestigeTier | null {
  const currentTier = getTierForPrestigeCount(prestigeCount);
  const nextTierIndex = currentTier.tier + 1;
  if (nextTierIndex < PRESTIGE_TIERS.length) {
    return PRESTIGE_TIERS[nextTierIndex];
  }
  return null;
}

/**
 * Check if a prestige would unlock a new milestone
 */
export function wouldUnlockMilestone(
  currentPrestigeCount: number,
  newPrestigeCount: number,
): PrestigeTier | null {
  const currentTier = getTierForPrestigeCount(currentPrestigeCount);
  const newTier = getTierForPrestigeCount(newPrestigeCount);

  if (newTier.tier > currentTier.tier) {
    return newTier;
  }
  return null;
}

/**
 * Get prestige count needed to reach next milestone
 */
export function getPrestigesUntilNextMilestone(prestigeCount: number): number {
  const nextMilestone = getNextMilestone(prestigeCount);
  if (!nextMilestone) {
    return 0; // Already at max tier
  }
  return nextMilestone.prestigeRequired - prestigeCount;
}
