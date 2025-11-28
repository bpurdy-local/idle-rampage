# Idle Rampage

A React Native mobile idle/incremental game for iOS and Android. Players manage builders assigned to buildings that produce resources, fight wave-based robot enemies, and prestige for permanent bonuses.

## Features

- **Building Management**: 6 building types that evolve through multiple tiers as you progress
- **Wave-Based Combat**: Fight through increasingly difficult robot enemies with tap and auto-damage
- **Prestige System**: Reset for blueprints to unlock permanent upgrades
- **Lucky Drops**: Random rewards from defeating enemies
- **Offline Progress**: Earn resources while away (up to 8 hours)

## Getting Started

### Prerequisites

- Node.js 20+
- iOS: Xcode, CocoaPods
- Android: Android Studio, Android SDK

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
├── data/           # Data definitions (buildings, enemies, etc.)
├── hooks/          # useGameLoop, useAppState
├── components/     # React Native components
└── screens/        # GameScreen (main orchestrator)

tests/              # Jest tests mirroring src/ structure
```

## Platform Requirements

- iOS 14.0+ (iPhone only)
- Android API 24+ (Android 7.0 Nougat)

## Tech Stack

- React Native
- TypeScript
- Zustand (state management)
- react-native-reanimated (animations)
- AsyncStorage (persistence)
- react-native-iap (in-app purchases)
