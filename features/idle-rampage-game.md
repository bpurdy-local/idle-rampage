# Feature Plan: Idle Rampage - Complete Mobile Game

**[Updated: 2025-11-27]** - Comprehensive mobile app specification for iOS and Android

---

## Platform & Distribution

| Platform | Minimum Version | Distribution | Device Types |
|----------|-----------------|--------------|--------------|
| **iOS** | iOS 14.0+ | Apple App Store | iPhone only (not iPad-optimized) |
| **Android** | API 24+ (Android 7.0 Nougat) | Google Play Store | Phones and tablets |

**Technology Stack:**
- **Framework**: React Native 0.73+ with TypeScript for cross-platform native mobile development
- **Build Outputs**: Native iOS (.ipa) and Android (.apk/.aab) binaries
- **State Management**: Zustand for lightweight, performant global state
- **Storage**: @react-native-async-storage/async-storage for persistent save data
- **IAP Integration**: react-native-iap v12+ for App Store and Play Store purchases
- **Navigation**: React Navigation (if needed for settings/shop screens)
- **Animations**: React Native Reanimated for smooth 60fps tap feedback and transitions

**Mobile-Specific Considerations:**
- App must handle background/foreground transitions gracefully
- Offline progress calculated on app resume
- Battery-efficient game loop (reduce tick rate when app backgrounded)
- Safe area handling for notched devices (iPhone X+, Android punch-hole displays)
- Haptic feedback on tap (optional, iOS Taptic Engine / Android vibration)
- App state persistence on unexpected termination
- Deep link support for future marketing campaigns

---

## Summary

Idle Rampage is a **native iOS and Android mobile application** - a 2D incremental idle/active hybrid game where players manage a pool of builders assigned to various buildings. Buildings produce resources, support upgrades, power wave-based robot combat, and drive overall progression. The game combines idle production mechanics with active tapping gameplay and features a prestige system for long-term engagement.

**Core Gameplay Loop:**
1. Assign builders to buildings to generate resources
2. Use resources to upgrade buildings and combat power
3. Fight wave-based robot enemies using auto-damage and tap attacks
4. Progress through waves to unlock better rewards and scaling
5. Prestige to gain permanent bonuses and restart with advantages

**Why This Design:**
- Idle mechanics provide passive engagement for casual players
- Active tapping rewards engaged players without punishing idle play
- Builder assignment creates meaningful strategic choices
- Wave progression provides clear goals and sense of advancement
- Prestige system ensures long-term retention and replayability

---

## Acceptance Criteria

### Core Systems
- [ ] Player starts with x (default to 30) builders that can be freely assigned to buildings
- [ ] Buildings produce resources based on assigned builders, level, and prestige bonuses
- [ ] Wave number amplifies resource production visibly
- [ ] Tapping provides bonus scrap and combat damage with light randomness
- [ ] Combat features auto-damage, burst attacks, and tap damage
- [ ] Enemies evolve visually as waves increase
- [ ] Prestige resets progress but keeps builders and permanent upgrades
- [ ] Save/load system persists all game state

### UI/UX
- [ ] Single-screen interface showing all core elements
- [ ] Tap area prominent and responsive
- [ ] Prestige button accessible when available
- [ ] Safe area insets respected on all devices (notches, home indicators)
- [ ] Touch targets minimum 44x44 points per Apple HIG / 48dp per Material Design
- [ ] Smooth 60fps animations on tap feedback
- [ ] Portrait orientation locked
- [ ] Works on screen sizes from iPhone SE (375pt width) to large Android tablets

### Monetization
- [ ] IAP stubs for builder bundles (+x, +y, +z)
- [ ] Temporary boost purchase stubs
- [ ] Resources 
- [ ] All content achievable without purchases
- [ ] Purchases only accelerate progression

### Technical
- [ ] Modular architecture with separated game logic and UI
- [ ] Data-driven building definitions
- [ ] Reusable builder assignment system
- [ ] Easy to add new buildings, enemies, and upgrades
- [ ] Easy to tune scaling and balance values
- [ ] App launches in under 3 seconds on mid-range devices
- [ ] Memory usage stays under 200MB during normal gameplay
- [ ] App handles iOS/Android lifecycle events (pause, resume, terminate)
- [ ] Builds successfully for both iOS and Android from single codebase

---

## Scope / Non-Goals

### In Scope
- Complete game loop from start to prestige
- Builder pool and assignment system
- Multiple building types with unique roles
- Idle resource generation with wave scaling
- Active tapping for resources and combat
- Wave-based combat with single enemy at a time
- Auto-damage, burst attacks, and tap attacks
- Enemy evolution through tiers (scrap bots → mechs)
- Prestige system with permanent upgrades
- Blueprint currency for prestige upgrades
- IAP stubs for builder bundles and boosts
- Save/load system for all data
- Clean single-screen UI
- Basic progress bars and visual feedback
- Sound effect hooks (stubs)
- Modular, reskinnable architecture

### Non-Goals
- Complex animations or physics
- Multiplayer or social features
- Achievement system (can add later)
- Daily rewards system (can add later)
- Gacha mechanics
- Time-gated content
- Complex enemy AI or behaviors
- Mini-games or side content
- Detailed analytics integration
- Localization (English only for MVP)
- Advanced visual effects or particles

---

## Files to Modify

Since this is a new React Native project targeting iOS and Android, we will create the following structure:

### Project Configuration (React Native + TypeScript)
- `package.json` - Project dependencies: react-native, zustand, react-native-iap, react-native-reanimated, @react-native-async-storage/async-storage
- `tsconfig.json` - TypeScript configuration for React Native with strict mode
- `babel.config.js` - Babel configuration including reanimated plugin
- `metro.config.js` - Metro bundler configuration
- `app.json` - React Native app configuration (name, display name, bundle identifiers)
- `.gitignore` - Git ignore patterns including ios/android build artifacts, node_modules
- `index.js` - React Native app entry point
- `App.tsx` - Root React component

### iOS Native Project (`ios/`)
- `ios/IdleRampage.xcodeproj` - Xcode project file
- `ios/IdleRampage/Info.plist` - iOS app configuration (permissions, orientation lock, etc.)
- `ios/Podfile` - CocoaPods dependencies for native modules
- `ios/IdleRampage/AppDelegate.mm` - iOS app delegate (may need IAP setup)
- `ios/IdleRampage/LaunchScreen.storyboard` - Launch screen design

### Android Native Project (`android/`)
- `android/app/build.gradle` - Android build configuration, min SDK, target SDK
- `android/app/src/main/AndroidManifest.xml` - Android app manifest (permissions, orientation)
- `android/app/src/main/java/.../MainApplication.kt` - Android application class
- `android/app/src/main/java/.../MainActivity.kt` - Main activity
- `android/app/src/main/res/` - Android resources (launcher icons, splash screen)

### Core Game Engine
- `src/core/GameLoop.ts` - Main game loop handling ticks and updates
- `src/core/GameState.ts` - Central game state container
- `src/core/EventBus.ts` - Event system for decoupled communication

### Data Models
- `src/models/Building.ts` - Building class with level, assigned builders, production
- `src/models/Enemy.ts` - Enemy class with health, tier, rewards
- `src/models/Player.ts` - Player state including resources, builders, prestige
- `src/models/PrestigeUpgrade.ts` - Prestige upgrade definitions

### Game Systems
- `src/systems/BuilderManager.ts` - Builder pool and assignment logic
- `src/systems/ProductionSystem.ts` - Idle resource generation calculations
- `src/systems/CombatSystem.ts` - Combat loop with auto-damage and burst attacks
- `src/systems/WaveManager.ts` - Wave progression and enemy spawning
- `src/systems/PrestigeSystem.ts` - Prestige reset and bonus calculations
- `src/systems/TapHandler.ts` - Tap input processing with randomness

### Data Definitions
- `src/data/buildings.ts` - Building type definitions and base stats
- `src/data/enemies.ts` - Enemy tier definitions and evolution thresholds
- `src/data/prestigeUpgrades.ts` - Prestige upgrade options and costs
- `src/data/iapProducts.ts` - IAP product definitions

### Services
- `src/services/SaveService.ts` - Save/load game state to storage
- `src/services/IAPService.ts` - IAP purchase stubs and hooks
- `src/services/AudioService.ts` - Sound effect stubs

### UI Components (React Native TSX)
- `src/screens/GameScreen.tsx` - Main game screen layout with SafeAreaView
- `src/components/EnemyDisplay.tsx` - Enemy HP bar and wave info
- `src/components/BuildingList.tsx` - ScrollView containing building cards
- `src/components/BuildingCard.tsx` - Individual building with Pressable +/- buttons
- `src/components/BuilderPool.tsx` - Available builder count display
- `src/components/TapArea.tsx` - Pressable tap zone with Reanimated feedback
- `src/components/PrestigeButton.tsx` - Prestige trigger with confirmation modal
- `src/components/ProgressBar.tsx` - Reusable animated progress bar
- `src/components/ResourceDisplay.tsx` - Current scrap and blueprints display

### Hooks & State (React Native)
- `src/hooks/useGameLoop.ts` - Custom hook managing setInterval game tick
- `src/hooks/useAppState.ts` - Hook for handling app foreground/background
- `src/stores/gameStore.ts` - Zustand store for global game state

### Testing
- `tests/systems/BuilderManager.test.ts` - Builder assignment tests
- `tests/systems/ProductionSystem.test.ts` - Resource generation tests
- `tests/systems/CombatSystem.test.ts` - Combat mechanics tests
- `tests/systems/WaveManager.test.ts` - Wave progression tests
- `tests/systems/PrestigeSystem.test.ts` - Prestige reset tests
- `tests/services/SaveService.test.ts` - Save/load tests
- `tests/integration/GameLoop.test.ts` - Full game loop integration tests

---

## Design / Approach

### Architecture Overview

The game follows a clean separation between data, logic, and presentation:

**Data Layer** - Pure TypeScript classes and interfaces defining game entities (buildings, enemies, player state). These are simple data containers with no business logic.

**Systems Layer** - Stateless managers that operate on game state. Each system handles one aspect of the game (production, combat, waves, prestige). Systems receive the game state, perform calculations, and return updated state.

**UI Layer** - Presentation components that render game state and dispatch user actions. UI components are thin wrappers that read from state and call system methods.

**Event Bus** - Decoupled communication between systems. When combat defeats an enemy, it emits an event that the wave manager listens for to spawn the next enemy.

### Builder Assignment Flow

Players see a list of buildings, each showing current assigned builders. Plus/minus buttons adjust assignment. The builder pool shows remaining unassigned builders. Assigning a builder to a building immediately increases that building's effectiveness. Reassignment is instant with no cooldown.

The BuilderManager tracks total builders, assigned counts per building, and validates assignment requests. It prevents assigning more builders than available and handles edge cases like building unlock requirements.

### Production System

Each game tick, the ProductionSystem iterates through all buildings and calculates resource output. Output depends on:
- Base production rate of the building type
- Number of assigned builders (linear scaling)
- Building level (exponential-ish scaling)
- Prestige bonuses (multiplicative)
- Wave bonus (higher current wave = better production)

The wave bonus creates a positive feedback loop where progressing in combat directly improves idle gains, encouraging engagement with both systems.

### Combat System

Combat runs on a timed loop. Each tick applies auto-damage to the current enemy based on combat-focused buildings and upgrades. Occasionally a burst attack triggers, dealing significantly more damage. Taps add bonus damage with slight randomness.

If enemy health reaches zero before the wave timer expires, the wave is cleared and rewards are granted. If the timer expires, the wave fails with no punishment - the player can retry or focus on upgrading.

Combat damage sources:
- Auto-damage: Steady ticks based on upgrades
- Burst attacks: Random chance each tick for big damage
- Tap damage: Player input with randomness bonus

### Wave Progression

Waves increase linearly in difficulty (enemy health) but rewards scale generously. Higher waves provide:
- More resources on wave clear
- Better passive production multipliers
- Access to evolved enemy types (cosmetic progression)
- More blueprints on prestige

The WaveManager tracks current wave, spawns appropriate enemies, handles wave clear/fail conditions, and calculates wave-based bonuses.

### Enemy Evolution

Enemies are organized into tiers based on wave thresholds:
- Waves 1-10: Scrap Bots (basic appearance)
- Waves 11-25: Drones (flying appearance)
- Waves 26-50: Loaders (heavy appearance)
- Waves 51-75: Mechs (armored appearance)
- Waves 76-100: AI Units (advanced appearance)
- Wave 100 - prestege available, else AI units just keep getting harder

Each tier has a name, visual identifier, and color scheme. Within a tier, enemies scale in health but share appearance.

### Prestige System

When players choose to prestige, the PrestigeSystem:
1. Calculates blueprints earned based on highest wave reached
2. Resets all buildings to level 1
3. Removes all builder assignments
4. Resets current wave to 1
5. Preserves total builder count (including purchased)
6. Preserves accumulated blueprints
7. Preserves purchased prestige upgrades

Blueprints purchase permanent upgrades that affect:
- Idle production multiplier
- Tap power multiplier
- Auto-damage multiplier
- Building upgrade speed
- Wave reward multiplier
- Burst attack chance and damage

### Save System

SaveService serializes game state to JSON and stores in local storage (or appropriate mobile storage). Saves trigger automatically on significant events (wave clear, prestige, building upgrade) and periodically. Load happens on app start.

Saved data includes:
- Player resources and builder counts
- All building levels and assignments
- Current wave and combat state
- Prestige upgrades owned
- Blueprints accumulated
- IAP purchase records
- Timestamp for offline progress calculation

### IAP Integration

IAPService provides stubs for:
- Builder bundles that permanently add builders
- Temporary boosts with duration tracking
- Purchase validation and receipt handling

All IAP items are defined in data files for easy configuration. The game checks purchase records on load to apply permanent bonuses.

---

## Tests to Add/Update

### Unit Tests

**BuilderManager Tests**
- Assigning builders reduces available pool correctly
- Cannot assign more builders than available
- Reassigning builders updates both buildings
- Builder count preserved through operations
- Purchased builders add to total pool

**ProductionSystem Tests**
- Empty building produces nothing
- More builders increase production
- Higher building level increases production
- Prestige bonuses multiply correctly
- Wave bonus applies correctly

**CombatSystem Tests**
- Auto-damage reduces enemy health
- Burst attacks deal increased damage
- Tap damage applies with randomness within expected range
- Enemy defeat triggers wave clear
- Timer expiry triggers wave fail without penalty

**WaveManager Tests**
- Wave 1 spawns correct enemy type
- Higher waves spawn tougher enemies
- Wave clear advances to next wave
- Rewards scale with wave number
- Enemy tier evolves at correct thresholds

**PrestigeSystem Tests**
- Prestige resets buildings correctly
- Prestige preserves builders
- Blueprint calculation based on wave
- Prestige upgrades apply bonuses
- Multiple prestiges accumulate correctly

**SaveService Tests**
- Save captures all game state
- Load restores state exactly
- Corrupted save handled gracefully
- Offline time calculated correctly

### Integration Tests

**Full Game Loop Test**
- Start new game with correct initial state
- Assign builders and verify production starts
- Progress through several waves
- Trigger prestige and verify reset
- Reload game and verify state persistence

**Production-Combat Integration**
- Verify combat buildings affect damage
- Verify wave progression affects production
- Verify tap affects both resources and combat

### Manual Testing Checklist

**Core Functionality:**
- [ ] Fresh install shows tutorial/intro correctly
- [ ] Builder assignment feels responsive
- [ ] Tap feedback is satisfying
- [ ] Combat pacing feels good
- [ ] Prestige decision point is clear
- [ ] Save persists through app restart
- [ ] Offline progress applies on return

**iOS-Specific Testing:**
- [ ] App runs on iPhone SE (smallest screen)
- [ ] App runs on iPhone 15 Pro Max (largest screen)
- [ ] Safe areas respected on notched devices
- [ ] Home indicator doesn't overlap UI
- [ ] App handles interruptions (phone calls, notifications)
- [ ] IAP works with App Store sandbox
- [ ] App launches from cold start under 3 seconds

**Android-Specific Testing:**
- [ ] App runs on Android 7.0 device (minimum API)
- [ ] App runs on various screen densities (mdpi to xxxhdpi)
- [ ] Back button behavior is appropriate
- [ ] App handles split-screen/multi-window
- [ ] IAP works with Google Play test tracks
- [ ] App survives process death and restoration

**Cross-Platform Testing:**
- [ ] UI looks consistent between iOS and Android
- [ ] Game state syncs correctly after background/foreground
- [ ] Performance acceptable on mid-range devices (60fps target)
- [ ] Memory usage stays reasonable during extended play

---

## Risks & Rollback

### Technical Risks

**Risk: Performance degradation with many buildings**
- Mitigation: Limit initial building count, optimize tick calculations
- Rollback: Reduce update frequency if needed

**Risk: Save data corruption**
- Mitigation: Validate save data on load, keep backup saves
- Rollback: Provide "reset to checkpoint" option

**Risk: Balance issues making game too easy/hard**
- Mitigation: All scaling values in data files for easy tuning
- Rollback: Server-side config for balance values (future)

### Mobile-Specific Risks

**Risk: App Store / Play Store rejection**
- Mitigation: Follow Apple HIG and Material Design guidelines
- Mitigation: Ensure IAP uses only platform-native payment systems
- Mitigation: Include privacy policy and required disclosures
- Rollback: Address rejection feedback and resubmit

**Risk: React Native native module compatibility issues**
- Mitigation: Use well-maintained libraries (react-native-iap, reanimated)
- Mitigation: Test on real devices, not just simulators
- Rollback: Pin dependency versions, avoid bleeding-edge releases

**Risk: App crashes on older devices**
- Mitigation: Test on minimum supported OS versions
- Mitigation: Profile memory usage on low-RAM devices
- Rollback: Raise minimum OS version if necessary

**Risk: IAP purchase not delivered after payment**
- Mitigation: Implement receipt validation and purchase restoration
- Mitigation: Persist pending purchases and retry on next launch
- Rollback: Customer support flow for manual purchase restoration

### Design Risks

**Risk: Combat feels disconnected from building management**
- Mitigation: Ensure combat buildings clearly affect damage
- Mitigation: Wave bonuses visibly boost production

**Risk: Prestige timing unclear to players**
- Mitigation: Show projected blueprint gain
- Mitigation: Highlight when prestige becomes beneficial

**Risk: IAP feels required for progression**
- Mitigation: Test full progression without purchases
- Mitigation: Ensure free path viable within reasonable time

### Rollback Strategy

The modular architecture allows disabling or replacing individual systems:
- Each system can be toggled via config
- UI components can be swapped without affecting logic
- Data definitions can be hot-reloaded for balance changes

For mobile app updates:
- Use staged rollouts (10% → 50% → 100%) on both stores
- Keep previous version available for quick rollback
- Monitor crash reports via App Store Connect / Play Console

For major issues, revert to previous save checkpoint and redeploy with fixes.

---

## Evidence

This is a new project with no existing codebase. The design draws from established idle game patterns:

- `features/idle-rampage-game.md` - This planning document
- Industry patterns from games like Idle Miner, Adventure Capitalist, Egg Inc
- Builder assignment inspired by city builders and RTS games
- Wave combat inspired by tower defense and idle RPGs

---

## Assumptions

**Platform Requirements:**
- Target platforms are **iOS (iPhone)** and **Android** via React Native
- Distributed through **Apple App Store** and **Google Play Store**
- Minimum iOS version: 14.0 (supports iPhone 6s and newer)
- Minimum Android version: API 24 / Android 7.0 (Nougat)

**Technical Requirements:**
- TypeScript is the preferred language for game logic
- React Native handles native mobile builds for both platforms
- AsyncStorage provides persistent local save data
- react-native-iap handles in-app purchases for both stores
- Touch input is primary interaction method
- Portrait orientation is primary layout
- No backend server required for MVP (local-only)
- Frame rate target of 60fps for smooth tap response
- Asset creation (sprites, sounds) handled separately

**App Store Considerations:**
- Must comply with Apple App Store Review Guidelines
- Must comply with Google Play Developer Program Policies
- IAP must use platform-native payment systems (no external payment links)
- Privacy policy required for both stores

---

## Open Questions

1. ~~**Framework Choice**: React Native, Unity, Godot, or custom?~~ **[Resolved]** Using React Native with TypeScript for cross-platform iOS/Android development.

2. **Offline Progress Cap**: How much offline progress should be awarded? Suggest capping at 8 hours to prevent exploitation.

3. **Starting Tutorial**: Should there be a guided tutorial or discover-as-you-go? Suggest minimal prompts with optional help.

4. **Prestige Threshold**: What minimum wave should be required before prestige is available? Suggest wave 10 minimum.

5. **Building Unlock Pacing**: Should all buildings be available from start or unlocked progressively? Suggest unlock via wave milestones.

6. **Cloud Save**: Should cloud save (iCloud/Google Play Games) be included in MVP or added later?

7. **App Store Assets**: Who will create App Store screenshots, promotional graphics, and app icons?

8. **TestFlight/Internal Testing**: Will there be a beta testing phase before public release?

---

## Tasks

### Phase 1: React Native Project Setup & Core Architecture
1. Initialize React Native project with TypeScript template using npx react-native init
2. Configure iOS project (bundle identifier, minimum iOS version 14.0, portrait lock)
3. Configure Android project (application ID, minSdk 24, portrait lock)
4. Install core dependencies (zustand, react-native-reanimated, async-storage)
5. Create project folder structure (src/core, src/models, src/systems, src/components, etc.)
6. Implement EventBus for decoupled system communication
7. Implement GameState container with typed state interface
8. Implement Zustand store for global state management
9. Implement GameLoop as a custom React hook with configurable tick rate
10. Implement useAppState hook to handle app foreground/background lifecycle
11. Write tests for core architecture components
12. Verify app builds and runs on both iOS simulator and Android emulator

### Phase 2: Data Models & Definitions
8. Create Building model with properties for level, assigned builders, production rate
9. Create Enemy model with properties for health, tier, name, rewards
10. Create Player model with resources, builder counts, prestige data
11. Create PrestigeUpgrade model with cost, effect type, and magnitude
12. Define initial building types in buildings data file
13. Define enemy tiers and evolution thresholds in enemies data file
14. Define prestige upgrade options in prestigeUpgrades data file
15. Write tests verifying model instantiation and property access

### Phase 3: Builder Management System
16. Implement BuilderManager with pool tracking and assignment methods
17. Add validation preventing over-assignment of builders
18. Add methods for reassigning builders between buildings
19. Add method for adding builders from purchases
20. Write comprehensive tests for all builder operations
21. Verify builder counts remain consistent through all operations

### Phase 4: Production System
22. Implement ProductionSystem that calculates per-building output
23. Add builder count scaling to production calculation
24. Add building level scaling to production calculation
25. Add prestige bonus multipliers to production calculation
26. Add wave bonus multipliers to production calculation
27. Integrate ProductionSystem with game loop tick
28. Write tests for production calculations at various states
29. Verify production increases as expected with builder changes

### Phase 5: Combat System
30. Implement CombatSystem with timed combat loop
31. Add auto-damage calculation based on combat buildings
32. Add burst attack logic with configurable chance and damage
33. Add tap damage handling with randomness range
34. Implement enemy defeat detection and wave clear trigger
35. Implement timer expiry and wave fail handling
36. Write tests for combat damage, burst attacks, and tap handling
37. Verify combat loop runs independently of main game loop

### Phase 6: Wave Management
38. Implement WaveManager with current wave tracking
39. Add enemy spawning based on wave number and tier thresholds
40. Add wave reward calculation scaling with wave number
41. Add wave bonus calculation for production multiplier
42. Implement wave clear handler that advances wave and grants rewards
43. Implement wave fail handler with no penalty
44. Write tests for wave progression and enemy tier evolution
45. Verify wave rewards increase noticeably with progression

### Phase 7: Prestige System
46. Implement PrestigeSystem with blueprint calculation from wave
47. Add prestige reset logic for buildings and assignments
48. Add prestige preservation logic for builders and upgrades
49. Implement prestige upgrade purchase and application
50. Define prestige upgrade effects for each upgrade type
51. Write tests for prestige reset and upgrade effects
52. Verify prestige makes subsequent runs noticeably faster

### Phase 8: Save/Load System
53. Implement SaveService with JSON serialization of game state
54. Add automatic save triggers on significant events
55. Add periodic auto-save at configurable interval
56. Implement load with validation and corruption handling
57. Add offline progress calculation based on time elapsed
58. Write tests for save/load roundtrip and offline calculation
59. Verify game state persists correctly through app restart

### Phase 9: IAP Service Stubs
60. Define IAP product catalog in iapProducts data file
61. Implement IAPService stub with purchase simulation
62. Add builder bundle purchase handling
63. Add temporary boost purchase handling with duration
64. Add purchase record persistence in save data
65. Write tests for IAP purchase flows
66. Verify purchased builders persist through prestige

### Phase 10: React Native UI Foundation
67. Create main GameScreen with SafeAreaView and proper layout structure
68. Implement ProgressBar component using React Native Reanimated for smooth animation
69. Implement ResourceDisplay showing current scrap and blueprints
70. Create shared styles/theme file for consistent colors, spacing, and typography
71. Ensure all touch targets meet minimum 44pt/48dp size requirements
72. Test layout on iPhone SE, iPhone 15 Pro Max, and various Android screen sizes
73. Verify safe area insets work correctly on notched devices

### Phase 11: Combat UI
74. Implement EnemyDisplay component with animated HP bar and wave counter
75. Add enemy name and tier visual indicator with color coding
76. Add combat timer display with countdown animation
77. Add wave clear and fail visual feedback with brief animations
78. Connect EnemyDisplay to Zustand store for reactive updates
79. Verify combat state updates reflect in UI immediately on both platforms

### Phase 12: Building Management UI
80. Implement BuildingCard component with Pressable +/- buttons
81. Add haptic feedback on builder assignment (optional vibration)
82. Add animated progress bar showing production or upgrade progress
83. Add level and output display with number formatting
84. Implement BuildingList as ScrollView containing all building cards
85. Implement BuilderPool display showing available builders prominently
86. Connect building UI to Zustand store for reactive updates
87. Verify builder assignment changes reflect immediately on both platforms

### Phase 13: Tap & Prestige UI
88. Implement TapArea using Pressable with Reanimated scale/opacity feedback
89. Add haptic feedback on tap (iOS Taptic Engine / Android vibration)
90. Add floating damage numbers using animated Views
91. Implement PrestigeButton showing availability and projected blueprint gain
92. Add prestige confirmation Modal with clear accept/cancel options
93. Connect TapArea to TapHandler system via Zustand
94. Connect PrestigeButton to PrestigeSystem
95. Verify tap feels responsive (under 16ms feedback) on both platforms

### Phase 14: Integration, Polish & Device Testing
96. Run full integration test from new game through prestige on iOS
97. Run full integration test from new game through prestige on Android
98. Tune production scaling for satisfying progression feel
99. Tune combat pacing for engaging but not stressful experience
100. Tune prestige threshold and blueprint gains
101. Add audio service stubs with hook points for future sounds
102. Performance profile on mid-range devices (target 60fps, under 200MB RAM)
103. Test app lifecycle: background, foreground, terminate, cold start
104. Test offline progress calculation after various time periods
105. Fix any issues discovered during integration testing

### Phase 15: App Store Preparation & Documentation
106. Create app icons for iOS (all required sizes) and Android (adaptive icons)
107. Create launch/splash screens for both platforms
108. Write README with project overview and setup instructions
109. Document how to add new building types
110. Document how to add new enemy tiers
111. Document how to adjust balance values
112. Document IAP product setup for App Store Connect and Google Play Console
113. Create privacy policy (required for both stores)
114. Prepare App Store metadata (description, keywords, screenshots)
115. Prepare Google Play metadata (description, graphics, screenshots)
116. Final review of all acceptance criteria
117. Build release versions for both platforms

---

## Implementation Phases Summary

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 1 | React Native Setup | App runs on iOS simulator + Android emulator |
| 2 | Models | Data structures defined |
| 3 | Builders | Assignment system working |
| 4 | Production | Idle resources generating |
| 5 | Combat | Fighting enemies works |
| 6 | Waves | Progression through waves |
| 7 | Prestige | Reset and bonuses work |
| 8 | Save/Load | AsyncStorage persistence working |
| 9 | IAP | react-native-iap stubs ready |
| 10-13 | UI | Complete React Native interface |
| 14 | Device Testing | Tested on real iOS + Android devices |
| 15 | App Store Prep | Ready for App Store + Play Store submission |

**Total Tasks: 117**

Each phase includes tests that must pass before proceeding. This ensures a working product at each stage.

**Required Development Environment:**
- macOS (required for iOS builds)
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- Node.js 18+
- Ruby (for CocoaPods)
- Physical iOS and Android devices for final testing
