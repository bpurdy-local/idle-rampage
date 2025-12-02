# Future Enhancements

## Event System

Three separate event types that rotate. Each uses parallel state (`eventRun` in game store) isolated from main game progression. Rewards tracked via `completedEventIds` to prevent farming.

### Event Type 1: Roguelike Picks

**Concept:** Arcadey mode with build-defining choices throughout the run.

**Gameplay:**
- 30 waves
- Player starts with fixed base stats (no buildings/economy)
- Every 5 waves, pick 1 of 3 random buffs (2x tap damage, +50% auto damage, burst chance, etc.)
- Buffs stack and define the run
- Pure combat, no resource management

**State:**
```typescript
eventRun: {
  type: 'roguelike';
  eventId: string;
  wave: number;
  enemy: Enemy | null;
  baseStats: { tapDamage: number; autoDamage: number; burstChance: number };
  chosenBuffs: Buff[];
  pendingChoices: [Buff, Buff, Buff] | null; // shown every 5 waves
}
```

**Unique Requirements:**
- Buff pool definitions (~15-20 buffs)
- Buff selection UI (pick 1 of 3 cards)

**Session Length:** 10-15 minutes

---

### Event Type 2: Loadout Mode

**Concept:** Strategic commitment - pick your tools before the run starts.

**Gameplay:**
- 30 waves
- Before run: pick 3 buildings from unlocked pool
- Buildings start at fixed level, no upgrades mid-run
- Economy disabled, just combat with your chosen loadout
- Tests knowledge of building synergies

**State:**
```typescript
eventRun: {
  type: 'loadout';
  eventId: string;
  wave: number;
  enemy: Enemy | null;
  selectedBuildings: [BuildingType, BuildingType, BuildingType];
  buildingStats: Record<BuildingType, { damage: number; effect: number }>;
}
```

**Unique Requirements:**
- Building picker UI before run starts

**Session Length:** 10-15 minutes

---

### Event Type 3: Speed Run

**Concept:** Full game mastery test - race to wave 100 from fresh state.

**Gameplay:**
- Target: reach wave 100
- Fresh game state (no carryover from main game)
- Accelerated modifiers to keep it reasonable:
  - 2-3x production speed
  - 0.5x building costs
  - Faster wave timers
- Timer tracks total run duration
- Full economy: scrap, buildings, builders, upgrades

**State:**
```typescript
eventRun: {
  type: 'speedrun';
  eventId: string;
  wave: number;
  timeElapsed: number;
  scrap: number;
  buildings: Building[];
  builders: Builder[];
  enemy: Enemy | null;
  modifiers: {
    productionMult: number;
    costMult: number;
    waveTimerMult: number;
  };
}
```

**Unique Requirements:**
- Full parallel state (largest footprint)
- Timer display
- Potentially track best times

**Session Length:** 30-60 minutes

---

### Rotation Strategy

Weekly rotation, one event active at a time:
```
Week 1: Roguelike Picks (modifier variant A)
Week 2: Loadout Mode (modifier variant A)
Week 3: Speed Run
Week 4: Roguelike Picks (modifier variant B)
...
```

Rotation logic (no server needed):
```typescript
const EVENT_ROTATION = [roguelikeA, loadoutA, speedrun, roguelikeB, loadoutB, ...];
const getActiveEvent = () => {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return EVENT_ROTATION[weekNumber % EVENT_ROTATION.length];
};
```

---

### Reward Structure

- First clear per event variant: meaningful reward (blueprints, permanent small bonus)
- Repeat clears: nothing or token scrap
- Track in save: `completedEventIds: string[]`

---

### Implementation Order

1. **Loadout Mode** - Simplest, validates parallel state architecture
2. **Roguelike Picks** - Adds buff system on working foundation
3. **Speed Run** - Most complex, full state duplication

---

### Shared Infrastructure

All three modes share:
- `eventRun` state slot in game store (union type of three shapes)
- Event enter/exit flow
- Reward tracking
- Rotation logic
- Combat systems (just pointed at event state)
