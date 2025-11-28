import {DailyRewardState} from '../core/GameState';
import {DailyRewardDefinition, getRewardForDay} from '../data/dailyRewards';

export interface DailyRewardCheckResult {
  hasReward: boolean;
  reward: DailyRewardDefinition | null;
  newStreak: number;
  isStreakBroken: boolean;
}

export class DailyRewardSystem {
  private getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isConsecutiveDay(lastDate: string, currentDate: string): boolean {
    const last = new Date(lastDate);
    const current = new Date(currentDate);

    last.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);

    const diffTime = current.getTime() - last.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays === 1;
  }

  private isSameDay(lastDate: string, currentDate: string): boolean {
    return lastDate === currentDate;
  }

  checkForReward(state: DailyRewardState): DailyRewardCheckResult {
    const today = this.getLocalDateString();

    if (state.lastLoginDate && this.isSameDay(state.lastLoginDate, today)) {
      return {
        hasReward: false,
        reward: null,
        newStreak: state.currentStreak,
        isStreakBroken: false,
      };
    }

    let newStreak: number;
    let isStreakBroken = false;

    if (!state.lastLoginDate) {
      newStreak = 1;
    } else if (this.isConsecutiveDay(state.lastLoginDate, today)) {
      newStreak = state.currentStreak + 1;
    } else {
      newStreak = 1;
      isStreakBroken = state.currentStreak > 1;
    }

    const reward = getRewardForDay(newStreak);

    return {
      hasReward: true,
      reward,
      newStreak,
      isStreakBroken,
    };
  }

  claimReward(state: DailyRewardState, newStreak: number): DailyRewardState {
    return {
      lastLoginDate: this.getLocalDateString(),
      currentStreak: newStreak,
      totalDaysLoggedIn: state.totalDaysLoggedIn + 1,
      hasClaimedToday: true,
    };
  }
}

export const dailyRewardSystem = new DailyRewardSystem();
