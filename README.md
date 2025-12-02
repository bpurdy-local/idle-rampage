# Idle Rampage

A React Native mobile idle/incremental game for iOS and Android. Humanity's last stand against rogue machines! Build your base, assign workers, and fight back against endless waves of hostile robots.

## Features

### Core Gameplay
- **Building Management**: 6 unique building types that evolve through 4-5 tiers as you progress
  - *Scrap Works* - Resource generation
  - *Weak Point Scanner* - Reveals enemy vulnerabilities for bonus tap damage
  - *Training Facility* - Boosts tap damage through combat training
  - *Shield Generator* - Extends wave timers for more fighting time
  - *Command Center* - Global production boost
  - *Engineering Bay* - Reduces upgrade costs

- **Wave-Based Combat**: Fight through 100 waves of increasingly difficult robot enemies
  - 5 enemy tiers: Scrap Bots, Drones, Loaders, Mechs, and AI Units
  - Boss waves every 10 waves with bonus rewards
  - Epic final boss gauntlet (waves 96-100)

- **Prestige System**: Reset for blueprints to unlock 10 permanent upgrades
  - Tap Power, Auto Damage, Production Boost
  - Burst attacks, Wave Rewards, and more
  - Purchase additional workers with blueprints

### Additional Features
- **Lucky Drops**: Random scrap bonuses and boost rewards from wave clears
- **Offline Progress**: Earn resources while away (up to 8 hours at 50% efficiency)
- **Daily Rewards**: Login bonuses with streak multipliers
- **Rich Storyline**: Discover the lore as buildings evolve
- **Animated Loading Screen**: Engaging startup experience with gameplay tips

## Screenshots

*Coming soon*

## Getting Started

### Prerequisites

- Node.js 20+
- iOS: Xcode 15+, CocoaPods
- Android: Android Studio, Android SDK 24+

### Installation

```bash
# Install dependencies
npm install

# iOS only: Install CocoaPods dependencies
bundle install
bundle exec pod install
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Testing

```bash
# Run all tests
npm test

# Run a specific test file
npm test -- tests/systems/ProductionSystem.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should calculate"
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── core/           # GameState, EventBus, game loop
├── models/         # TypeScript interfaces
├── systems/        # Game logic managers
├── services/       # SaveService, IAPService
├── stores/         # Zustand gameStore
├── data/           # Data definitions and formulas
│   └── formulas/   # Centralized game balance formulas
├── hooks/          # useGameLoop, useAppState
├── components/     # React Native components
│   ├── common/     # Reusable UI components
│   └── game/       # Game-specific components
└── screens/        # GameScreen (main orchestrator)

tests/              # Jest tests mirroring src/ structure
```

## Game Balance

- **Early game (Waves 1-12)**: Learn mechanics, build foundation
- **Mid game (Waves 13-50)**: Unlock new buildings, develop strategy
- **Late game (Waves 51-100)**: Prestige required, master all systems
- **Wave 100 Boss**: "The Architect" - 2.5M HP, ultimate challenge

## Platform Requirements

- **iOS**: 14.0+ (iPhone only, Portrait orientation)
- **Android**: API 24+ (Android 7.0 Nougat, Portrait orientation)

## Tech Stack

- React Native 0.82
- TypeScript 5.9
- Zustand (state management)
- react-native-reanimated (smooth animations)
- AsyncStorage (local persistence)
- react-native-iap (in-app purchases)

## Version History

See [CHANGELOG.md](CHANGELOG.md) for release notes.

## License

All rights reserved.
