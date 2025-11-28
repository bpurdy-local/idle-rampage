import {LUCKY_DROPS, LuckyDrop, DROP_CONFIG} from '../data/luckyDrops';
import {eventBus, GameEvents} from '../core/EventBus';

export interface DropResult {
  drop: LuckyDrop;
  amount: number;
  scaledAmount: number;
}

export interface LuckyDropEventData {
  drop: LuckyDrop;
  amount: number;
  scaledAmount: number;
}

export class LuckyDropSystem {
  private totalWeight: number;

  constructor() {
    this.totalWeight = LUCKY_DROPS.reduce((sum, drop) => sum + drop.weight, 0);
  }

  rollForDrop(wave: number, baseWaveReward: number, guaranteedDrop: boolean = false): DropResult | null {
    if (wave < DROP_CONFIG.minWaveForDrops) {
      return null;
    }

    if (!guaranteedDrop) {
      const roll = Math.random();
      if (roll > DROP_CONFIG.baseDropChance) {
        return null;
      }
    }

    const drop = this.selectDrop();
    if (!drop) {
      return null;
    }

    const amount = this.calculateAmount(drop, wave);
    const scaledAmount = this.scaleAmount(drop, amount, wave, baseWaveReward);

    const result: DropResult = {
      drop,
      amount,
      scaledAmount,
    };

    eventBus.emit<LuckyDropEventData>(GameEvents.LUCKY_DROP, result);

    return result;
  }

  private selectDrop(): LuckyDrop | null {
    const roll = Math.random() * this.totalWeight;
    let cumulative = 0;

    for (const drop of LUCKY_DROPS) {
      cumulative += drop.weight;
      if (roll <= cumulative) {
        return drop;
      }
    }

    return LUCKY_DROPS[0];
  }

  private calculateAmount(drop: LuckyDrop, wave: number): number {
    const baseAmount =
      Math.floor(Math.random() * (drop.maxAmount - drop.minAmount + 1)) +
      drop.minAmount;

    if (drop.type === 'blueprints' && wave >= 50) {
      return Math.min(baseAmount + 1, drop.maxAmount + 1);
    }

    return baseAmount;
  }

  private scaleAmount(
    drop: LuckyDrop,
    amount: number,
    _wave: number,
    baseWaveReward: number,
  ): number {
    if (drop.type === 'scrap') {
      return Math.floor(baseWaveReward * amount);
    }

    return amount;
  }

  getDropChance(): number {
    return DROP_CONFIG.baseDropChance;
  }

  getDropProbabilities(): Array<{drop: LuckyDrop; probability: number}> {
    return LUCKY_DROPS.map(drop => ({
      drop,
      probability:
        DROP_CONFIG.baseDropChance * (drop.weight / this.totalWeight),
    }));
  }
}

export const luckyDropSystem = new LuckyDropSystem();
