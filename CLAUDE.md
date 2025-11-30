# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Idle Rampage is a React Native mobile idle/incremental game for iOS and Android. Players manage builders assigned to buildings that produce resources, fight wave-based robot enemies, and prestige for permanent bonuses.

## Common Commands

```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Run a single test file
npm test -- tests/systems/BuilderManager.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should assign builder"

# Lint the codebase
npm run lint

# Install iOS dependencies (after cloning or updating native deps)
bundle install
bundle exec pod install
```

## Architecture

### Layer Separation

The codebase follows a three-layer architecture:

1. **Data Layer** (`src/models/`, `src/data/`) - Pure TypeScript interfaces and data definitions. No business logic.

2. **Systems Layer** (`src/systems/`) - Stateless managers that operate on game state:
   - `ProductionSystem` - Idle resource generation with wave bonuses, prestige multipliers, offline production (8hr cap, 50% efficiency)
   - `CombatSystem` - Auto-damage from combat buildings, tap damage with variance (80-120%), burst attacks (5% base chance, 5x multiplier)
   - `WaveManager` - Wave progression, enemy spawning by tier, wave timer (30-60s), reward calculations
   - `PrestigeSystem` - Reset mechanics, blueprint earning (exponential scaling from wave 10+), 7 permanent upgrades
   - `LuckyDropSystem` - Random drops from wave clears (scrap, blueprints, boosts)
   - `DailyRewardSystem` - Daily login bonus tracking

3. **UI Layer** (`src/components/`, `src/screens/`) - React Native components that read from Zustand store and dispatch actions

### State Management

- **Zustand store** (`src/stores/gameStore.ts`) - Global game state with 40+ typed actions for resources, builders, buildings, combat, waves, prestige, and boosts
- **EventBus** (`src/core/EventBus.ts`) - Decoupled pub/sub communication via `GameEvents` constants
- **GameState** (`src/core/GameState.ts`) - Central state interface with `createInitialGameState()` factory

### Key Patterns

- Game loop runs via `useGameLoop` hook (100ms tick rate default)
- App lifecycle handled via `useAppState` hook (foreground/background transitions with offline time detection)
- All balance values defined in `src/data/` files for easy tuning
- Buildings, enemies, IAP products are data-driven definitions
- Event-driven architecture enables loose coupling between systems

## Project Structure

```
src/
├── core/           # GameState, EventBus, game loop
├── models/         # TypeScript interfaces (Building, Enemy, Player, PrestigeUpgrade)
├── systems/        # Game logic managers (BuilderManager, CombatSystem, etc.)
├── services/       # SaveService (AsyncStorage), IAPService (react-native-iap)
├── stores/         # Zustand gameStore
├── data/           # Data definitions (buildings, enemies, prestigeUpgrades, luckyDrops, iapProducts)
├── hooks/          # useGameLoop, useAppState
├── components/     # React Native components
│   ├── common/     # Button, Card, ProgressBar
│   └── game/       # ResourceDisplay, BuildingCard, EnemyDisplay, PrestigePanel
├── screens/        # GameScreen (main orchestrator)
└── utils/          # formatters (formatNumber, formatTime, formatPercent, etc.)

tests/              # Jest tests mirroring src/ structure
```

## Game Content

### Buildings (5 types with evolution tiers)
Each building evolves through multiple tiers as you progress through waves.

| Building | Role | Base Unlock | Tiers | Purpose |
|----------|------|-------------|-------|---------|
| Scrap Works | production | Wave 1 | 5 | Scrap generation (Collector → Recycler → Refinery → Factory → Megaplex) |
| Turret Station | combat | Wave 3 | 5 | Auto-damage (Turret Bay → Gun Emplacement → Weapons Lab → War Factory → Doom Fortress) |
| Training Facility | combat | Wave 5 | 5 | Tap damage boost |
| Command Center | utility | Wave 25 | 4 | Global production boost (5-20%) |
| Engineering Bay | utility | Wave 12 | 5 | Reduces upgrade costs (max 50%)

### Enemy Tiers (5 difficulty levels)
| Enemy | Waves | Base Health | Base Reward |
|-------|-------|-------------|-------------|
| Scrap Bot | 1-10 | 200 | 10 |
| Drone | 11-25 | 200 | 50 |
| Loader | 26-50 | 1000 | 200 |
| Mech | 51-100 | 5000 | 1000 |
| AI Unit | 101+ | 50000 | 10000 |

Health and rewards scale exponentially within each tier (1.35-1.5x per wave).

### Prestige Upgrades (7 permanent bonuses)
- **Production Boost** - Multiplies building output (max 50 levels)
- **Tap Power** - Multiplies tap damage (max 50 levels)
- **Auto Damage** - Multiplies auto damage (max 50 levels)
- **Wave Rewards** - Multiplies scrap earned (max 30 levels)
- **Burst Chance** - Adds to burst probability (max 20 levels)
- **Burst Damage** - Multiplies burst output (max 20 levels)
- **Head Start** - Bonus scrap on prestige (max 10 levels)

### IAP Products (3 categories)
- **Builder Packs** - Additional builders + optional production bonuses
- **Boost Products** - Temporary 2x multipliers (production, combat, or both)
- Platform-specific product IDs for iOS (`com.idlerampage.*`) and Android

## Services

### SaveService
- Auto-save every 30 seconds
- Save versioning (current: v1)
- Offline time detection (>60s triggers offline production)
- Import/export for backup/transfer

### IAPService
- react-native-iap v14+ integration
- Platform-specific product handling
- Purchase flow with consumable/non-consumable tracking
- Purchase restoration support

## EventBus Events

Key events for system communication:
- `TICK` - Game loop tick with deltaTime
- `WAVE_CLEARED` / `WAVE_FAILED` - Wave outcomes
- `ENEMY_DAMAGED` / `ENEMY_DEFEATED` - Combat events
- `TAP_REGISTERED` / `BURST_ATTACK` - Combat input events
- `BUILDING_UPGRADED` / `BUILDING_EVOLVED` - Building progression
- `LUCKY_DROP` - Random drop received
- `MILESTONE_REACHED` - Prestige milestone achieved
- `PRESTIGE_TRIGGERED` - Reset performed
- `GAME_SAVED` / `GAME_LOADED` - Persistence events
- `APP_BACKGROUNDED` / `APP_FOREGROUNDED` - Lifecycle events

## Testing

Tests use Jest with react-native preset. Mocks for AsyncStorage, react-native-iap, and react-native-reanimated are configured in `jest.setup.js`.

Test files mirror the source structure under `tests/`.

## TypeScript Configuration

- Strict mode enabled with `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`
- Path alias: `@/*` maps to `src/*`
- Extends `@react-native/typescript-config`

## Key Dependencies

- **State**: Zustand
- **Storage**: @react-native-async-storage/async-storage
- **IAP**: react-native-iap
- **Animations**: react-native-reanimated (plugin in babel.config.js)
- **Safe areas**: react-native-safe-area-context

## Platform Requirements

- iOS 14.0+ (iPhone only)
- Android API 24+ (Android 7.0 Nougat)
- Node.js 20+
- Portrait orientation locked

## Game Balance Notes

- **Early game (1-10)**: Low costs, simple enemies, easy progression
- **Mid game (11-50)**: New buildings unlock, difficulty ramps with Drone/Loader enemies
- **Late game (51+)**: Command Center unlocks, exponential enemy scaling, prestige required
- **Prestige threshold**: Wave 10 minimum, blueprints earned = sum(1.1^i) for waves 10 to current
- **Wave timer**: Starts at 30s, increases 0.1s per wave, caps at 60s
- **Tap cooldown**: 150ms to prevent auto-clicker abuse
