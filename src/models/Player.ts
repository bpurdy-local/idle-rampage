export interface Player {
  scrap: number;
  blueprints: number;
  totalBuilders: number;
  availableBuilders: number;
  highestWave: number;
  totalPrestiges: number;
  lifetimeScrap: number;
  lifetimeBlueprintsEarned: number;
}

export const createInitialPlayer = (startingBuilders: number = 30): Player => ({
  scrap: 0,
  blueprints: 0,
  totalBuilders: startingBuilders,
  availableBuilders: startingBuilders,
  highestWave: 0,
  totalPrestiges: 0,
  lifetimeScrap: 0,
  lifetimeBlueprintsEarned: 0,
});

export const canAfford = (player: Player, cost: number): boolean => {
  return player.scrap >= cost;
};

export const spendScrap = (player: Player, amount: number): Player => {
  if (!canAfford(player, amount)) {
    return player;
  }
  return {
    ...player,
    scrap: player.scrap - amount,
  };
};

export const calculatePrestigeBlueprints = (highestWave: number): number => {
  if (highestWave < 10) return 0;
  return Math.floor(Math.pow(highestWave / 10, 1.5));
};
