type EventCallback<T = unknown> = (data: T) => void;

interface EventSubscription {
  unsubscribe: () => void;
}

class EventBus {
  private listeners: Map<string, Set<EventCallback<unknown>>> = new Map();

  on<T>(event: string, callback: EventCallback<T>): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback<unknown>);

    return {
      unsubscribe: () => this.off(event, callback),
    };
  }

  off<T>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback<unknown>);
    }
  }

  emit<T>(event: string, data: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();

export const GameEvents = {
  TICK: 'tick',
  WAVE_CLEARED: 'wave_cleared',
  WAVE_FAILED: 'wave_failed',
  ENEMY_DAMAGED: 'enemy_damaged',
  ENEMY_DEFEATED: 'enemy_defeated',
  RESOURCE_GAINED: 'resource_gained',
  BUILDING_UPGRADED: 'building_upgraded',
  BUILDER_ASSIGNED: 'builder_assigned',
  PRESTIGE_TRIGGERED: 'prestige_triggered',
  TAP_REGISTERED: 'tap_registered',
  BURST_ATTACK: 'burst_attack',
  GAME_SAVED: 'game_saved',
  GAME_LOADED: 'game_loaded',
  APP_BACKGROUNDED: 'app_backgrounded',
  APP_FOREGROUNDED: 'app_foregrounded',
  LUCKY_DROP: 'lucky_drop',
} as const;

export type GameEventType = typeof GameEvents[keyof typeof GameEvents];
