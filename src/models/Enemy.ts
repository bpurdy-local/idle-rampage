export interface EnemyTier {
  id: string;
  name: string;
  minWave: number;
  maxWave: number;
  baseHealth: number;
  healthMultiplierPerWave: number;
  baseReward: number;
  rewardMultiplierPerWave: number;
  color: string;
  iconName: string;
}

export interface Enemy {
  id: string;
  tierId: string;
  name: string;
  currentHealth: number;
  maxHealth: number;
  reward: number;
  wave: number;
}

let enemyIdCounter = 0;

export const createEnemy = (tier: EnemyTier, wave: number): Enemy => {
  const wavesIntoTier = wave - tier.minWave;
  const maxHealth = Math.floor(
    tier.baseHealth * Math.pow(tier.healthMultiplierPerWave, wavesIntoTier),
  );
  const reward = Math.floor(
    tier.baseReward * Math.pow(tier.rewardMultiplierPerWave, wavesIntoTier),
  );
  enemyIdCounter++;

  return {
    id: `enemy_${wave}_${Date.now()}_${enemyIdCounter}`,
    tierId: tier.id,
    name: `${tier.name} Mk.${wave}`,
    currentHealth: maxHealth,
    maxHealth,
    reward,
    wave,
  };
};

export const getEnemyHealthPercentage = (enemy: Enemy): number => {
  return (enemy.currentHealth / enemy.maxHealth) * 100;
};
