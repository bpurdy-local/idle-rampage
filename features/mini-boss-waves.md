# Feature Plan: Mini-Boss Waves

---

## Summary

Add mini-boss encounters every 10 waves (waves 10, 20, 30, etc.) that feature stronger enemies with guaranteed lucky drops and bonus rewards. Mini-bosses create short-term goals and anticipation, breaking up the regular wave grind with memorable encounters.

**Problem Solved:** Regular waves can feel repetitive. Players need periodic excitement spikes and guaranteed rewards to maintain engagement.

**Why Needed:** Mini-bosses add psychological milestones that make players think "just 3 more waves until the boss" - a proven engagement pattern in idle games.

---

## Acceptance Criteria

- [ ] Every 10th wave (10, 20, 30...) spawns a mini-boss instead of a regular enemy
- [ ] Mini-bosses have 3x the health of regular enemies at that wave
- [ ] Mini-bosses have 5x the scrap reward of regular enemies
- [ ] Mini-bosses guarantee a lucky drop on defeat (100% chance)
- [ ] Mini-bosses have distinct visual treatment (different color, "BOSS" label)
- [ ] Wave timer is extended by 50% for mini-boss waves
- [ ] UI clearly indicates when a mini-boss wave is approaching (e.g., "Boss in 2 waves")
- [ ] Mini-boss defeat triggers a special victory animation/effect
- [ ] Mini-bosses work correctly with existing prestige and boost multipliers

---

## Scope / Non-Goals

### In Scope
- Mini-boss spawning logic every 10 waves
- Health and reward multipliers for mini-bosses
- Guaranteed lucky drop integration
- Visual distinction in EnemyDisplay component
- Extended wave timer for boss waves
- "Boss incoming" indicator in UI
- Victory celebration effect on boss defeat

### Non-Goals
- Unique boss enemy types with different sprites (use existing tiers with visual modifiers)
- Boss-specific mechanics (special attacks, phases)
- Boss health bars with segments
- Boss leaderboards or tracking
- Separate boss loot tables (uses existing lucky drop system)

---

## Files to Modify

### Data Layer
- `src/data/enemies.ts` - Add mini-boss configuration constants (health multiplier, reward multiplier)

### Systems Layer
- `src/systems/WaveManager.ts` - Add `isBossWave()` helper, modify `spawnEnemyForWave()` to apply boss multipliers, extend timer calculation for bosses
- `src/systems/CombatSystem.ts` - Ensure boss defeat triggers guaranteed lucky drop

### Store Layer
- `src/stores/gameStore.ts` - Add `isBossWave` derived state or helper

### UI Layer
- `src/components/game/EnemyDisplay.tsx` - Add boss visual treatment (color tint, "BOSS" label, larger health bar)
- `src/screens/GameScreen.tsx` - Add "Boss in X waves" indicator near wave counter, trigger boss victory effect

### Data
- `src/data/luckyDrops.ts` - May need to export drop generation function for guaranteed boss drops

---

## Design / Approach

### Boss Wave Detection
A simple modulo check determines boss waves: `wave % 10 === 0 && wave > 0`. This is encapsulated in a `isBossWave(wave: number)` helper function in WaveManager for consistent usage across the codebase.

### Enemy Spawning Changes
When `isBossWave()` returns true, the `spawnEnemyForWave()` method applies multipliers to the base enemy:
- Health: base health × 3.0
- Reward: base reward × 5.0
- A `isBoss` flag is added to the enemy state

### Timer Extension
Boss waves get 50% more time. The `calculateWaveTimer()` method checks `isBossWave()` and applies a 1.5x multiplier to the calculated timer.

### Guaranteed Lucky Drops
When a boss is defeated (detected via `isBoss` flag on enemy), the lucky drop system bypasses its probability check and always generates a drop. The existing lucky drop rarity weights still apply - players just always get something.

### Visual Treatment
EnemyDisplay reads the `isBoss` flag and applies:
- Red/gold color tint to health bar
- "BOSS" text label above enemy name
- Slightly larger health bar
- Pulsing glow effect (optional, using Reanimated)

### Boss Incoming Indicator
GameScreen calculates waves until next boss: `10 - (currentWave % 10)`. When this is 3 or less, a small indicator appears: "Boss in 2 waves". At wave 10, 20, etc., it shows "BOSS WAVE!"

### Victory Effect
On boss defeat, a more dramatic version of WaveVictoryFlash plays - perhaps golden instead of green, with "BOSS DEFEATED!" text.

### Integration with Existing Systems
- Prestige multipliers apply to boss rewards normally
- Active boosts stack with boss multipliers
- Offline progress treats boss waves normally (no special handling needed)
- Save/load preserves boss state through the existing enemy serialization

---

## Tests to Add/Update

### Unit Tests
- `tests/systems/WaveManager.test.ts`
  - Test `isBossWave()` returns true for 10, 20, 30, etc.
  - Test `isBossWave()` returns false for 1, 5, 15, 25, etc.
  - Test boss enemies have 3x health multiplier
  - Test boss enemies have 5x reward multiplier
  - Test boss wave timer is 1.5x normal timer
  - Test boss multipliers stack correctly with prestige bonuses

### Integration Tests
- Test that defeating a boss triggers a lucky drop 100% of the time
- Test that boss rewards apply correctly with active boosts

### Manual Testing
- [ ] Play through wave 10 and verify boss appears with correct stats
- [ ] Verify boss visual treatment is distinct and readable
- [ ] Verify "Boss in X waves" indicator appears correctly
- [ ] Verify guaranteed lucky drop on boss defeat
- [ ] Verify boss victory effect plays
- [ ] Test on both iOS and Android

---

## Risks & Rollback

### Risks
- **Boss too hard:** Players may get stuck at boss waves. Mitigation: 3x health is moderate; no wave failure penalty exists.
- **Boss too easy:** With strong prestige bonuses, bosses may feel trivial. Mitigation: The guaranteed drop is the main reward, not the challenge.
- **UI clutter:** Boss indicators may crowd the interface. Mitigation: Keep indicators minimal and contextual.

### Rollback
- Boss logic is additive - remove the `isBossWave()` checks to revert
- Feature can be disabled via a config flag if needed
- No database migrations or breaking state changes

---

## Evidence

- `src/systems/WaveManager.ts:32-35` - `spawnEnemyForWave()` method to modify
- `src/systems/WaveManager.ts:37-40` - `calculateWaveTimer()` method to extend
- `src/data/enemies.ts:66-69` - `getEnemyTierForWave()` integration point
- `src/data/luckyDrops.ts` - Lucky drop generation to trigger on boss defeat
- `src/components/game/EnemyDisplay.tsx` - Enemy UI to add boss treatment
- `src/screens/GameScreen.tsx` - Wave display to add boss indicator

---

## Assumptions

- The existing enemy tier system handles the base stats; boss multipliers are applied on top
- Lucky drop system is already functional and can be triggered programmatically
- Reanimated is available for boss glow effects
- Players understand "boss" convention from other games (no tutorial needed)

---

## Open Questions

1. Should boss waves have unique enemy names (e.g., "Scrap Bot Alpha" vs "Scrap Bot")?
2. Should there be audio cues for boss waves (separate from visual)?
3. Should the boss indicator show exact wave number or just "soon"?

---

## Tasks

1. Add `BOSS_HEALTH_MULTIPLIER` and `BOSS_REWARD_MULTIPLIER` constants to enemies.ts
2. Create `isBossWave(wave: number)` helper function in WaveManager
3. Modify `spawnEnemyForWave()` to apply boss multipliers and set `isBoss` flag
4. Add `isBoss` property to EnemyState interface in GameState.ts
5. Modify `calculateWaveTimer()` to extend timer for boss waves
6. Update CombatSystem or wave completion logic to guarantee lucky drop for bosses
7. Add boss visual treatment to EnemyDisplay component (color, label)
8. Add "Boss in X waves" indicator to GameScreen
9. Create boss victory effect (enhanced WaveVictoryFlash)
10. Write unit tests for boss wave detection and multipliers
11. Write integration test for guaranteed boss lucky drops
12. Manual testing on iOS and Android devices
