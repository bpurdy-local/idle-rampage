# Game Balance Overhaul

## Changelog

- **[Updated: 2025-11-28]** Added final boss guaranteed drops (blueprints and boosts)
- **[Updated: 2025-11-28]** Added building production balance analysis section
- **[Updated: 2025-11-28]** **REVISED**: Building cost scaling and base production NOW IN SCOPE - critical balance issue
- **[Updated: 2025-11-28]** Added Scrap Works vs Combat income analysis and fix
- **[Updated: 2025-11-28]** Added Balance Gaps section with 9 identified issues to address

---

## Summary

Comprehensive rebalancing of the game's core systems to achieve target pacing:
- **Early game (waves 1-25)**: 1-2 hours, fast and satisfying
- **Mid game (waves 26-75)**: 3-5 days of occasional play
- **Late game (waves 76-100)**: 1-2 weeks, challenging grind to "beat the game"
- **Prestige**: For dedicated players who want to replay with permanent bonuses

The current balance has overly aggressive enemy HP scaling, short wave timers, and a prestige threshold that takes too long to reach meaningfully.

**[Updated: 2025-11-28]** Additionally, there is a critical issue where building upgrade costs scale exponentially while production scales linearly, making high-level upgrades uneconomical and Scrap Works obsolete compared to combat income.

## Acceptance Criteria

- [ ] Early game (waves 1-25) can be completed in 1-2 hours of active play
- [ ] Mid game (waves 26-75) requires 3-5 days of occasional play
- [ ] Late game (waves 76-100) requires 1-2 weeks of dedicated play
- [ ] Wave 100 feels like "beating the game" with epic final boss
- [ ] First prestige rewards 100 blueprints (feels worthwhile)
- [ ] Players can purchase builders with blueprints as alternative to IAP
- [ ] Lucky drops no longer give blueprints (prestige is the source)
- [ ] Building tier unlocks feel frequent in early game
- [ ] **[Updated]** Final bosses drop guaranteed blueprints and boosts
- [ ] **[Updated]** Building upgrades remain economically viable at all levels
- [ ] **[Updated]** Scrap Works provides meaningful income compared to combat rewards
- [ ] **[New]** Wave completion bonus formula is balanced for target pacing
- [ ] **[New]** Daily rewards don't explode at high waves
- [ ] **[New]** Tap damage base value is defined
- [ ] **[New]** Head Start prestige upgrade provides meaningful bonus
- [ ] **[New]** Max builder pool is appropriate for game scope
- [ ] **[New]** Boost stacking rules are clearly defined

## Scope/Non-Goals

### In Scope
- Enemy tier stats (HP, rewards, scaling)
- Wave timer configuration
- Final boss gauntlet (waves 96-100) with guaranteed drops
- Building evolution tier unlock waves
- Prestige blueprint rewards
- Prestige upgrade costs
- Builder purchase via blueprints (new feature)
- Lucky drop configuration
- **[Updated]** Building upgrade cost multipliers (critical fix)
- **[Updated]** Building base production values (critical fix)
- **[New]** Wave completion bonus formula tuning
- **[New]** Daily reward scaling cap
- **[New]** Tap damage base value definition
- **[New]** Head Start upgrade rebalancing
- **[New]** Max builder pool review
- **[New]** Boost stacking rules

### Non-Goals
- UI/UX changes (except victory screen - see Open Questions)
- New building types
- New prestige upgrades
- IAP pricing changes
- Sound/visual effects
- Worker efficiency system (diminishing returns formula is fine)

---

## Critical Balance Issue: Building Costs vs Production **[Updated: 2025-11-28]**

### The Problem

**Building upgrade costs scale exponentially, but production scales linearly.**

Example with Scrap Works T1:
- Base cost: 10, cost multiplier: 1.5x per level
- Level scaling: +75% per level (linear)

| Level | Upgrade Cost | Production/s | Cost per 1/s gained |
|-------|-------------|--------------|---------------------|
| 1→2 | 15 | 1.75 | 20 |
| 10→11 | 576 | 8.5 | 76 |
| 25→26 | 168,070 | 19 | 11,205 |
| 50→51 | 6.3 billion | 38 | 331 million |

**At level 50, you pay 6.3 BILLION scrap for +0.75 production/s.** This is broken.

### Combat Income Comparison

Meanwhile, combat provides:
- 50% of enemy reward from dealing damage
- Wave 50 enemies give ~5,000+ reward each
- Killing 1 enemy/second = 2,500+ scrap/second from combat

**Result: Scrap Works becomes completely obsolete** because combat income (thousands/s) dwarfs production (tens/s), and upgrading Scrap Works is impossibly expensive.

### The Fix

**Hybrid approach:**
- Lower cost multiplier (1.12-1.25x instead of 1.5-2.0x)
- Increase base production significantly
- Keep worker efficiency system unchanged

### Proposed Building Cost Rebalance

| Building | Current Cost Mult | Proposed Cost Mult |
|----------|-------------------|-------------------|
| Scrap Works | 1.5x | 1.12x |
| Turret Station | 1.55x | 1.15x |
| Training Facility | 1.55x | 1.15x |
| Command Center | 2.0x | 1.25x |
| Engineering Bay | 1.7x | 1.18x |

### Proposed Base Production Increase

| Building | Tier | Current Base | Proposed Base |
|----------|------|--------------|---------------|
| Scrap Works | T1 | 1 | 5 |
| Scrap Works | T2 | 3 | 20 |
| Scrap Works | T3 | 8 | 75 |
| Scrap Works | T4 | 20 | 250 |
| Scrap Works | T5 | 50 | 800 |
| Turret Station | T1 | 0.5 | 2 |
| Turret Station | T2 | 1.5 | 8 |
| Turret Station | T3 | 4 | 30 |
| Turret Station | T4 | 10 | 100 |
| Turret Station | T5 | 25 | 300 |
| Training Facility | T1 | 0.3 | 1 |
| Training Facility | T2 | 1 | 5 |
| Training Facility | T3 | 3 | 20 |
| Training Facility | T4 | 8 | 60 |
| Training Facility | T5 | 20 | 180 |

### New Cost/Production Math (with proposed values)

| Level | Upgrade Cost | Production/s (T1, 10 workers) | Payback Time |
|-------|-------------|------------------------------|--------------|
| 1→2 | 11 | 12.5 | ~1 second |
| 10→11 | 31 | 56 | ~0.5 seconds |
| 25→26 | 170 | 122 | ~1.4 seconds |
| 50→51 | 2,850 | 237 | ~12 seconds |

This creates healthy upgrade economics where upgrades remain worthwhile throughout the game.

---

## Balance Gaps Identified **[New: 2025-11-28]**

A comprehensive review of all balance mechanics revealed the following gaps not previously addressed:

### Gap 1: Wave Completion Bonus Formula

**Current formula** (in WaveManager.ts):
```
completionBonus = wave * 500 + wave^2.2
```

| Wave | Completion Bonus | Enemy Reward | Bonus vs Reward |
|------|------------------|--------------|-----------------|
| 10 | 5,158 | ~38 | 135x |
| 25 | 13,440 | ~221 | 61x |
| 50 | 29,330 | ~3,200 | 9x |
| 100 | 68,130 | ~128,000 | 0.5x |

**Issue**: Early game bonuses dwarf enemy rewards (135x at wave 10), potentially making combat feel pointless early on.

**Proposed Fix**: Reduce base multiplier
```
completionBonus = wave * 200 + wave^1.8
```

This gives: Wave 10 = 2,158, Wave 50 = 14,125, Wave 100 = 39,811

### Gap 2: Daily Reward Scaling

**Current formula** (in DailyRewardSystem.ts):
```
scrapReward = baseScrap * 1.15^wave
```

| Wave | Daily Scrap |
|------|-------------|
| 10 | 4,046 |
| 25 | 32,919 |
| 50 | 1,083,657 |
| 100 | 1.17 billion |

**Issue**: At wave 100, daily reward gives 1.17 BILLION scrap, which is potentially game-breaking.

**Proposed Fix**: Cap the wave used in calculation
```
effectiveWave = min(wave, 50)
scrapReward = baseScrap * 1.15^effectiveWave
```

This caps daily reward at ~1M scrap regardless of wave progress.

### Gap 3: Tap Damage Base Value

**Issue**: Base tap damage is not clearly defined in the codebase. It appears to come from `combat.baseTapDamage` in GameState, but the initial value and scaling are unclear.

**Proposed Fix**: Define explicit tap damage formula
```
baseTapDamage = 10 + (highestWave * 2) + (trainingFacilityBonus)
```

This ensures tap damage scales with progression and training facility investment.

### Gap 4: Head Start Prestige Upgrade

**Current effect**: +100 scrap per level

**Issue**: At level 10 (max), you get +1,000 scrap on prestige. This is trivial compared to:
- Wave completion bonuses (thousands per wave)
- First enemy rewards (hundreds at wave 1)
- Daily rewards (thousands)

**Proposed Fix**: Percentage-based scaling
```
headStartBonus = highestWave * 50 * upgradeLevel
```

At max level (10) after reaching wave 100:
- Old: 1,000 scrap (trivial)
- New: 100 * 50 * 10 = 50,000 scrap (meaningful jumpstart)

### Gap 5: Combat Scrap Split

**Current**: 50% from damage, 50% from wave completion (DAMAGE_SCRAP_PERCENT = 0.5)

**Question**: Is this the intended split? Options to consider:
- 30/70 (damage/completion) - rewards finishing waves faster
- 50/50 (current) - balanced
- 70/30 (damage/completion) - rewards maximizing damage output

**Recommendation**: Keep at 50/50 but document this as intentional design choice.

### Gap 6: Salvage Yard Building

**Issue**: CLAUDE.md references "Salvage Yard" as a utility building that gives "Bonus scrap from defeated enemies", but this building doesn't appear to exist in the building definitions.

**Options**:
1. Remove from documentation
2. Implement the building as designed

**Recommendation**: Remove from docs (building would overlap with Combat scrap mechanics)

### Gap 7: Prestige Tier Multipliers

**Current**: Prestige bonuses add multipliers to various systems.

**Gap**: No "prestige tier" or "New Game+" multiplier that increases difficulty/rewards based on prestige count.

**Proposed Addition** (optional):
```
prestigeTierBonus = 1 + (prestigeCount * 0.1)
```

This gives 10% boost to all progression per prestige, making each run faster.

### Gap 8: Boost Stacking Rules

**Current**: Multiple boosts can be active (production, combat, both).

**Issue**: Stacking rules are unclear:
- Do multiple 2x boosts stack to 4x?
- Do production + all boosts stack?
- What happens with IAP boosts + lucky drop boosts?

**Proposed Rules**:
1. Same-type boosts: Take highest multiplier, extend duration
2. Different-type boosts: Multiply together (2x prod + 2x all = 4x prod, 2x combat)
3. Maximum effective multiplier cap: 10x

### Gap 9: Max Builder Pool

**Current**: Max builders = 100 (from BuilderManager)

**Question**: Is 100 appropriate given:
- IAP builder packs (up to 50 builders)
- Blueprint builder purchase (unlimited?)
- 6 buildings with max 20 workers each = 120 workers needed

**Proposed Fix**: Increase max to 150 OR implement soft cap with diminishing returns above 100.

---

## Building & Worker Balance Analysis **[Updated: 2025-11-28]**

### Worker Efficiency System (NOT CHANGING)

The worker efficiency system is well-designed:

- **Decay rate**: 0.12 (diminishing returns)
- **Passive baseline**: 1 effective worker (100% efficiency) for all buildings
- **Per-worker efficiency**: Worker N = 1 / (1 + (N-1) * 0.12)
  - Worker 1: 100%
  - Worker 5: 68%
  - Worker 10: 48%
  - Worker 20: 30%

#### Worker Milestones (Stacking Bonuses) - NOT CHANGING

| Workers | Milestone | Bonus |
|---------|-----------|-------|
| 5+ | Coordinated Team | +15% |
| 10+ | Efficient Squad | +25% |
| 20+ | Master Crew | +35% |

#### Production Formula (NOT CHANGING)

```
production = baseProduction * levelMultiplier * effectiveWorkers * waveBonus * prestigeBonus
```

Where:
- `levelMultiplier = 1 + (level - 1) * 0.75` (+75% per level)
- `effectiveWorkers = (passive 1 + workerEfficiency) * milestoneBonus`

---

## Files to Modify

### src/data/enemies.ts
- Update ENEMY_TIERS array with new base HP, HP scaling, rewards, and wave ranges
- Change Mech tier to waves 51-75 (was 51-100)
- Change AI Unit tier to waves 76-95 (was 101+)
- Add new FINAL_BOSSES configuration for waves 96-100 with guaranteed drops
- Update BOSS_CONFIG with new multipliers (5x HP, 10x reward, 2x timer)

### src/data/buildings.ts **[Updated: 2025-11-28]**
- Update unlockWave values for all building evolution tiers
- Front-load early game unlocks for more frequent progression
- **Update costMultiplier for all buildings** (reduce from 1.5x to 1.12-1.25x)
- **Update baseProduction for Scrap Works, Turret Station, Training Facility**

### src/data/prestigeUpgrades.ts
- Update baseCost values for all upgrades
- Update costMultiplier values for all upgrades

### src/data/luckyDrops.ts
- Remove blueprint_drop from LUCKY_DROPS array
- Add mega_boost drop (3x multiplier, 60s duration)
- Update DROP_CONFIG.baseDropChance to 0.20 (was 0.75 testing value)

### src/systems/WaveManager.ts
- Update WaveConfig defaults: baseTimerSeconds=25, timerBonusPerWave=0.3, maxTimerSeconds=90
- Add isFinalBoss() method to check waves 96-100
- Update spawnEnemyForWave() to handle final boss spawning
- Update calculateWaveTimer() to use fixed timers for final bosses
- **[Updated]** Add getFinalBossDrop() method to return guaranteed drops

### src/systems/PrestigeSystem.ts
- Update BASE_BLUEPRINTS to 100 (was 50)
- Update BLUEPRINTS_PER_WAVE to 10 (was 5)
- Update WAVE_SCALING to 1.10 (was 1.08)
- Add builder purchase methods with escalating costs
- **[New]** Update Head Start effect calculation (wave-based scaling)

### src/systems/WaveManager.ts (additional changes)
- **[New]** Update wave completion bonus formula (reduce multiplier)

### src/systems/DailyRewardSystem.ts
- **[New]** Cap wave used in scrap calculation to 50

### src/systems/BuilderManager.ts
- **[New]** Increase MAX_BUILDERS from 100 to 150

### src/core/GameState.ts
- **[New]** Define baseTapDamage initial value and document scaling

### CLAUDE.md
- **[New]** Remove Salvage Yard reference (building doesn't exist)

### src/stores/gameStore.ts (or relevant store)
- Add action for purchasing builders with blueprints
- Track builders purchased count for escalating pricing
- **[Updated]** Handle final boss drop rewards on wave completion

---

## Design/Approach

### Enemy Scaling Philosophy
Reduce HP multiplier per wave across all tiers to create smoother progression. Current 1.35-1.4x scaling causes exponential walls. New 1.20-1.30x scaling allows player investment to keep pace.

### Final Boss Gauntlet **[Updated: 2025-11-28]**
Waves 96-100 are fixed boss encounters with predetermined HP/rewards/timers. These bypass normal scaling and enemy tier logic. Each boss is harder than the last, creating an epic finale.

**Guaranteed Drops**: Each final boss drops a guaranteed reward in addition to scrap:
- Waves 96-99: Guaranteed boost drop to help with the next boss
- Wave 100: Guaranteed blueprint drop as bonus prestige reward

This creates exciting moments during the finale and gives players resources to tackle each successive boss.

### Wave Timer Philosophy
Longer base timer (25s vs 15s) gives new players breathing room. Faster scaling (+0.3s vs +0.1s) ensures late-game fights have adequate time. Higher cap (90s vs 45s) prevents impossible situations.

### Building Unlock Pacing
Front-load tier unlocks in early game (waves 1-25) so players experience frequent progression. Space out late-game unlocks more to maintain sense of achievement.

### Building Economy Fix **[Updated: 2025-11-28]**
The fundamental fix is reducing cost multipliers from 1.5x to ~1.12-1.15x. This changes upgrade costs from exponential explosion to gentle growth:
- Level 50 upgrade: 6.3 billion → ~2,850 scrap
- Makes Scrap Works viable throughout the game
- Upgrades remain a meaningful investment without being impossible

Additionally, base production values are increased significantly so that:
- Scrap Works competes with combat income
- Players have a reason to invest in production buildings
- Idle income matters even in late game

### Prestige Economy
First prestige at wave 100 grants 100 blueprints. This allows meaningful initial investment:
- ~10 levels of a single upgrade, OR
- ~6 levels each of two upgrades, OR
- 3 builders + some upgrades

### Builder Purchase Escalation
Escalating costs prevent late-game blueprint hoarding while making early builders accessible:
- Builders 1-5: 30 BP each (150 total)
- Builders 6-10: 50 BP each (250 total)
- Builders 11-20: 75 BP each (750 total)
- Builders 21+: 100 BP each

This keeps IAP attractive (instant, includes bonuses) while giving free players a path.

---

## Tests to Add/Update

### Unit Tests
- WaveManager: Test final boss detection for waves 96-100
- WaveManager: Test final boss spawning with correct stats
- WaveManager: Test new timer calculations
- **[Updated]** WaveManager: Test final boss guaranteed drops
- PrestigeSystem: Test new blueprint calculation (100 base, 10 per wave, 1.10x scaling)
- PrestigeSystem: Test builder purchase with escalating costs
- **[Updated]** Building: Test upgrade cost calculation with new multipliers
- **[Updated]** Building: Test production values at various levels

### Integration Tests
- Verify enemy HP at key waves matches expected values
- Verify wave timer at key waves matches expected values
- Verify building unlocks occur at correct waves
- **[Updated]** Verify final boss drops are awarded correctly
- **[Updated]** Verify building upgrade costs are economically viable

### Manual Testing
- Play through waves 1-25, verify ~1-2 hour pacing
- Verify final boss gauntlet feels epic and challenging
- **[Updated]** Verify final boss drops appear and are useful
- Verify first prestige grants 100 blueprints
- Test builder purchase flow and cost escalation
- **[Updated]** Verify Scrap Works upgrades feel worthwhile at all levels
- **[Updated]** Verify production income is meaningful compared to combat income

---

## Risks & Rollback

### Risks
- Balance may still be off after changes (too easy or too hard)
- Final boss HP values are estimates, may need tuning
- Builder blueprint pricing may discourage prestige upgrade purchases
- **[Updated]** Final boss blueprint drops may make prestige feel less rewarding
- **[Updated]** Lower cost multipliers may make progression too fast
- **[Updated]** Higher base production may make early game too easy

### Mitigation
- All balance values are in data files, easy to adjust
- Can add debug config to test specific waves quickly
- Monitor player feedback after release
- **[Updated]** Final boss blueprint drop is small (25) compared to prestige reward (100+)
- **[Updated]** Test upgrade economy at levels 1, 10, 25, 50 during playtesting
- **[Updated]** Adjust base costs if early game feels too easy

### Rollback
- Revert changes to data files
- No database migrations or breaking changes

---

## Evidence

- src/data/enemies.ts:1-80 — Current enemy tier definitions
- src/data/buildings.ts:1-296 — Current building evolution tiers
- src/data/prestigeUpgrades.ts:1-88 — Current prestige upgrade costs
- src/data/luckyDrops.ts:1-65 — Current lucky drop configuration
- src/systems/WaveManager.ts:1-199 — Wave spawning and timer logic
- src/systems/PrestigeSystem.ts:1-302 — Blueprint calculation and prestige logic
- src/data/iapProducts.ts:17-49 — IAP builder pack pricing for reference
- **[Updated]** src/systems/WorkerEfficiency.ts:1-137 — Worker efficiency calculations
- **[Updated]** src/models/Building.ts:70-77 — calculateUpgradeCost formula
- **[Updated]** src/systems/CombatSystem.ts:126-141 — Combat scrap calculation (50% from damage)
- **[New]** src/systems/DailyRewardSystem.ts — Daily reward scaling formula
- **[New]** src/systems/BuilderManager.ts — MAX_BUILDERS constant
- **[New]** src/core/GameState.ts — baseTapDamage initial value

---

## Assumptions

- Players will actively play during "active" sessions (not pure idle)
- Tap damage contributes meaningfully to combat
- Auto-damage scales appropriately with turret building investment
- **[Updated]** Production income should be competitive with combat income
- **[Updated]** Current worker efficiency system provides good strategic depth

---

## Open Questions

- Should there be any visual/audio distinction for final bosses?
- Should builder purchase have a UI in prestige panel or separate shop?
- Should there be a "victory" screen after beating wave 100? **Answer: Yes**
- **[Updated]** Should final boss drops have special visual effects/notifications?
- **[Updated]** Should there be a level cap on buildings, or infinite scaling?
- **[Updated]** Should combat scrap percentage (currently 50%) be adjusted? **Answer: Keep 50/50**
- **[New]** Should prestige tier multiplier be added (10% boost per prestige)?
- **[New]** Is max 150 builders appropriate, or should there be diminishing returns above 100?
- **[New]** Should Salvage Yard building be implemented or just removed from docs? **Recommendation: Remove from docs**

---

## Tasks

### Phase 1: Enemy & Wave Changes
1. Update ENEMY_TIERS in enemies.ts with new HP, rewards, and wave ranges
2. Add FINAL_BOSSES configuration to enemies.ts with guaranteed drops
3. Update BOSS_CONFIG multipliers in enemies.ts
4. Update WaveManager timer config (25s base, +0.3s/wave, 90s max)
5. Add isFinalBoss() method to WaveManager
6. Update spawnEnemyForWave() to handle final bosses
7. Update calculateWaveTimer() for final boss fixed timers
8. **[Updated]** Add getFinalBossDrop() method to WaveManager
9. Write tests for final boss logic including drops

### Phase 2: Building Balance Fix **[Updated: 2025-11-28]**
10. Update costMultiplier for Scrap Works (1.5 → 1.12)
11. Update costMultiplier for Turret Station (1.55 → 1.15)
12. Update costMultiplier for Training Facility (1.55 → 1.15)
13. Update costMultiplier for Command Center (2.0 → 1.25)
14. Update costMultiplier for Engineering Bay (1.7 → 1.18)
15. Update baseProduction for Scrap Works all tiers (1→5, 3→20, 8→75, 20→250, 50→800)
16. Update baseProduction for Turret Station all tiers (0.5→2, 1.5→8, 4→30, 10→100, 25→300)
17. Update baseProduction for Training Facility all tiers (0.3→1, 1→5, 3→20, 8→60, 20→180)
18. Write tests for new upgrade cost calculations

### Phase 3: Building Unlock Pacing
19. Update Scrap Works tier unlock waves in buildings.ts
20. Update Turret Station tier unlock waves in buildings.ts
21. Update Training Facility tier unlock waves in buildings.ts
22. Update Command Center tier unlock waves in buildings.ts
23. Update Engineering Bay tier unlock waves in buildings.ts

### Phase 4: Prestige System
24. Update blueprint reward constants in PrestigeSystem.ts
25. Update prestige upgrade costs in prestigeUpgrades.ts
26. Add builder purchase method to PrestigeSystem
27. Add escalating cost calculation for builders
28. Add store action for builder purchase
29. Write tests for new blueprint calculations
30. Write tests for builder purchase

### Phase 5: Lucky Drops
31. Remove blueprint_drop from luckyDrops.ts
32. Add mega_boost drop to luckyDrops.ts
33. Update baseDropChance to 0.20

### Phase 6: Balance Gap Fixes **[New: 2025-11-28]**
34. Update wave completion bonus formula in WaveManager.ts (wave * 200 + wave^1.8)
35. Cap daily reward wave scaling to 50 in DailyRewardSystem.ts
36. Define baseTapDamage value in GameState.ts (10 base + wave scaling)
37. Update Head Start upgrade effect to wave-based scaling in PrestigeSystem.ts
38. Increase MAX_BUILDERS from 100 to 150 in BuilderManager.ts
39. Remove Salvage Yard reference from CLAUDE.md
40. Document combat scrap split (50/50) as intentional in CombatSystem.ts
41. Document boost stacking rules in relevant boost handling code

### Phase 7: Testing & Tuning
42. Manual playtest waves 1-25 for pacing
43. Manual playtest waves 26-50 for pacing
44. Manual playtest waves 51-75 for pacing
45. Manual playtest waves 76-95 for pacing
46. Manual playtest final boss gauntlet (96-100) including drops
47. **[Updated]** Test building upgrade economy at levels 1, 10, 25, 50
48. **[Updated]** Compare Scrap Works income vs combat income at various waves
49. Verify prestige rewards and upgrade purchasing
50. **[New]** Test daily reward values at wave 50 cap
51. **[New]** Verify Head Start gives meaningful jumpstart
52. **[New]** Test boost stacking behavior
53. Adjust values as needed based on playtesting

---

## Detailed Balance Values

### Enemy Tiers

| Tier | Waves | Base HP | HP/Wave | Base Reward | Reward/Wave |
|------|-------|---------|---------|-------------|-------------|
| Scrap Bot | 1-10 | 50 | 1.30x | 15 | 1.25x |
| Drone | 11-25 | 150 | 1.25x | 75 | 1.20x |
| Loader | 26-50 | 800 | 1.28x | 300 | 1.25x |
| Mech | 51-75 | 4,000 | 1.22x | 1,500 | 1.28x |
| AI Unit | 76-95 | 25,000 | 1.20x | 8,000 | 1.25x |

### Final Bosses **[Updated: 2025-11-28]**

| Wave | Name | HP | Reward | Timer | Guaranteed Drop |
|------|------|-----|--------|-------|-----------------|
| 96 | Sentinel Prime | 500,000 | 100,000 | 120s | 2x Boost (60s) |
| 97 | War Machine | 750,000 | 150,000 | 120s | 3x Boost (60s) |
| 98 | Omega Destroyer | 1,000,000 | 200,000 | 150s | 2x Boost (90s) |
| 99 | Apex Predator | 1,500,000 | 300,000 | 150s | 3x Boost (90s) |
| 100 | The Architect | 2,500,000 | 500,000 | 180s | 25 Blueprints |

**Drop Rationale**:
- Waves 96-99: Boosts help players tackle the next boss (escalating power)
- Wave 100: Blueprint drop adds to prestige reward, making "beating the game" extra rewarding

### Regular Boss Config

| Setting | Value |
|---------|-------|
| HP multiplier | 5.0x |
| Reward multiplier | 10.0x |
| Timer multiplier | 2.0x |
| Wave interval | 10 |

### Wave Timer

| Setting | Value |
|---------|-------|
| Base timer | 25s |
| Per wave bonus | +0.3s |
| Max timer | 90s |

### Building Cost Multipliers **[Updated: 2025-11-28]**

| Building | Current | Proposed |
|----------|---------|----------|
| Scrap Works | 1.5x | 1.12x |
| Turret Station | 1.55x | 1.15x |
| Training Facility | 1.55x | 1.15x |
| Command Center | 2.0x | 1.25x |
| Engineering Bay | 1.7x | 1.18x |

### Building Base Production **[Updated: 2025-11-28]**

| Building | T1 | T2 | T3 | T4 | T5 |
|----------|-----|-----|-----|------|------|
| Scrap Works | 5 | 20 | 75 | 250 | 800 |
| Turret Station | 2 | 8 | 30 | 100 | 300 |
| Training Facility | 1 | 5 | 20 | 60 | 180 |
| Command Center | 15% | 25% | 35% | 50% | - |
| Engineering Bay | 10% | 15% | 20% | 30% | 40% |

### Building Tier Unlocks

| Building | T1 | T2 | T3 | T4 | T5 |
|----------|----|----|----|----|-----|
| Scrap Works | 1 | 8 | 25 | 50 | 80 |
| Turret Station | 3 | 12 | 30 | 55 | 85 |
| Training Facility | 5 | 15 | 35 | 60 | 90 |
| Command Center | 20 | 45 | 70 | 95 | - |
| Engineering Bay | 10 | 28 | 50 | 75 | 100 |

### Prestige System

| Setting | Value |
|---------|-------|
| Minimum wave | 100 |
| Base blueprints | 100 |
| Per wave above 100 | 10 |
| Wave scaling | 1.10x |

### Prestige Upgrade Costs

| Upgrade | Base Cost | Cost Multiplier |
|---------|-----------|-----------------|
| Production Boost | 5 | 1.4x |
| Tap Power | 5 | 1.4x |
| Auto Damage | 8 | 1.45x |
| Wave Rewards | 10 | 1.5x |
| Burst Chance | 15 | 1.6x |
| Burst Damage | 15 | 1.6x |
| Head Start | 20 | 1.8x |

### Builder Purchase (Blueprints)

| Builder # | Cost Each |
|-----------|-----------|
| 1-5 | 30 |
| 6-10 | 50 |
| 11-20 | 75 |
| 21+ | 100 |

### Lucky Drops

| Setting | Value |
|---------|-------|
| Drop chance | 20% |

| Drop | Weight | Effect |
|------|--------|--------|
| Scrap Bonus | 60 | 2-5x wave reward |
| 2x Boost (30s) | 30 | 2x all |
| Mega Boost (60s) | 10 | 3x all |

### Wave Completion Bonus **[New: 2025-11-28]**

| Setting | Current | Proposed |
|---------|---------|----------|
| Formula | wave * 500 + wave^2.2 | wave * 200 + wave^1.8 |
| Wave 10 | 5,158 | 2,063 |
| Wave 50 | 29,330 | 14,125 |
| Wave 100 | 68,130 | 39,811 |

### Daily Reward **[New: 2025-11-28]**

| Setting | Value |
|---------|-------|
| Base scrap | 1,000 |
| Wave multiplier | 1.15x |
| Wave cap | 50 (max ~1M scrap) |

### Tap Damage **[New: 2025-11-28]**

| Setting | Value |
|---------|-------|
| Base value | 10 |
| Per wave bonus | +2 |
| Training facility | adds to base |
| Variance | 90-110% |

### Head Start Upgrade **[New: 2025-11-28]**

| Setting | Current | Proposed |
|---------|---------|----------|
| Effect | +100 scrap/level | highestWave * 50 * level |
| Max level | 10 | 10 |
| At wave 100, lvl 10 | 1,000 scrap | 50,000 scrap |

### Builder Pool **[New: 2025-11-28]**

| Setting | Current | Proposed |
|---------|---------|----------|
| Max builders | 100 | 150 |

### Boost Stacking Rules **[New: 2025-11-28]**

| Scenario | Behavior |
|----------|----------|
| Same type (2x + 2x) | Take highest, extend duration |
| Different types (prod + combat) | Multiply together |
| Production + All boost | Multiply (2x * 2x = 4x prod) |
| Maximum effective | 10x cap |
