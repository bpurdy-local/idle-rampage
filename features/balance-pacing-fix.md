# Balance Pacing Fix

## Changelog

- **[Updated: 2025-11-29]** Added comprehensive formula reference section with all existing formulas and proposed changes
- **[Created: 2025-11-29]** Initial plan to fix game pacing (wave 50 in 3 minutes is broken)

---

## Summary

The game is progressing far too quickly - reaching wave 50 in 3 minutes when the target is 1+ day. This plan addresses the root causes:

1. **Enemy HP is too low** - Enemies are dying too fast
2. **Damage output is too high** - Buildings/tap damage scale too quickly
3. **Wave timers are too generous** - Plenty of time to kill enemies
4. **Production is too high** - Too much scrap, too fast upgrades

**Target Pacing:**
- Early game (waves 1-20): ~1 hour
- Mid-early game (waves 20-35): ~2 hours
- Mid game (waves 35-50): ~1 day
- Late-mid game (waves 50-75): ~few days
- Late game (waves 75-100): ~1-2 weeks of casual play

---

## Acceptance Criteria

- [ ] Waves 1-20 takes approximately 1 hour of active play
- [ ] Waves 20-35 takes approximately 2 hours of active play
- [ ] Waves 35-50 takes approximately 1 day (multiple sessions)
- [ ] Waves 50-75 takes several days
- [ ] Waves 75-100 takes 1-2 weeks of casual play
- [ ] Early game feels engaging, not frustratingly slow
- [ ] Player damage scales appropriately with enemy HP
- [ ] Building upgrades remain meaningful but don't trivialize content
- [ ] Wave timers create tension without being impossible

---

## Scope/Non-Goals

### In Scope
- Enemy HP values and scaling per tier
- Enemy reward values (may need reduction to slow upgrade pace)
- Building base production values (reduce significantly)
- Building base cost values (increase significantly)
- Building cost multipliers (may need slight increase)
- Tap damage base value and scaling
- Wave timer configuration
- Wave completion bonus formula
- Lucky drop rates and values

### Non-Goals
- Worker efficiency system (already well-designed)
- Prestige system (no point balancing until people reach wave 100)
- New features or content
- UI/UX changes

---

## Root Cause Analysis

### Problem 1: Enemy HP Too Low

Current wave 1 enemy HP: 50
With base tap damage (10) + training facility + auto damage, enemies die in seconds.

**Current Enemy Stats:**
| Tier | Waves | Base HP | HP/Wave |
|------|-------|---------|---------|
| Scrap Bot | 1-10 | 50 | 1.3x |
| Drone | 11-25 | 150 | 1.25x |
| Loader | 26-50 | 800 | 1.28x |

**Wave 1 HP**: 50
**Wave 10 HP**: 50 × 1.3^9 = ~530
**Wave 25 HP**: 150 × 1.25^14 = ~3,700
**Wave 50 HP**: 800 × 1.28^24 = ~282,000

The early tiers are too low. A player tapping 5x/second with 10 damage each = 50 DPS, which kills wave 1 in 1 second.

### Problem 2: Building Damage/Production Too High

**Scrap Works T1**: baseProduction = 5
With 1 passive worker + 10 assigned workers (efficiency ~5.5 effective workers), level 10 = 1 + 9*0.75 = 7.75x multiplier
Production = 5 × 7.75 × 5.5 = 213/s

**Turret Station T1**: baseProduction = 2
Same calculation = 2 × 7.75 × 5.5 = 85 DPS at level 10

At wave 10, enemy HP is ~530. With just 85 auto DPS (not counting tap), enemy dies in 6 seconds. Wave timer is 25 + 10*0.3 = 28 seconds. Way too easy.

### Problem 3: Wave Rewards Too High

**Current wave completion formula:**
```
waveBonus = wave * 200 + wave^1.8
waveMultiplier = min(10, 1 + floor(wave/10) * 0.5)
```

Wave 10: (200*10 + 63) × 1.5 = 3,094 scrap bonus
Plus enemy reward (~38): Total ~3,132 scrap

**Scrap Works T1 upgrade from level 10→11 costs**: 10 × 1.12^9 = 28 scrap

This means one wave clear = 100+ building upgrades worth of scrap. Way too generous.

### Problem 4: Starting Resources Too High

Players start with 10 builders. This is fine, but combined with low costs means instant scaling.

---

## Proposed Changes

### 1. Increase Enemy HP Significantly

**New Enemy Stats:**
| Tier | Waves | Base HP | HP/Wave | Rationale |
|------|-------|---------|---------|-----------|
| Scrap Bot | 1-10 | 200 | 1.35x | 4x current, wave 1 takes ~20s of tapping |
| Drone | 11-25 | 1,000 | 1.30x | 6.6x current, requires building investment |
| Loader | 26-50 | 8,000 | 1.32x | 10x current, real wall without upgrades |
| Mech | 51-75 | 80,000 | 1.28x | 20x current, prestige-tier difficulty |
| AI Unit | 76-95 | 800,000 | 1.25x | 32x current, endgame content |

**Wave HP projections with new values:**
- Wave 1: 200 (was 50) - 4x harder
- Wave 10: 200 × 1.35^9 = ~3,200 (was 530) - 6x harder
- Wave 25: 1,000 × 1.30^14 = ~51,000 (was 3,700) - 14x harder
- Wave 50: 8,000 × 1.32^24 = ~23 million (was 282k) - 82x harder
- Wave 75: 80,000 × 1.28^24 = ~33 billion (need prestige)
- Wave 100: Bosses ~2.5 trillion HP

### 2. Reduce Building Base Production

**Current vs Proposed:**
| Building | Tier | Current | Proposed | Reduction |
|----------|------|---------|----------|-----------|
| Scrap Works | T1 | 5 | 1 | 80% |
| Scrap Works | T2 | 20 | 5 | 75% |
| Scrap Works | T3 | 75 | 20 | 73% |
| Scrap Works | T4 | 250 | 75 | 70% |
| Scrap Works | T5 | 800 | 250 | 69% |
| Turret Station | T1 | 2 | 0.5 | 75% |
| Turret Station | T2 | 8 | 2 | 75% |
| Turret Station | T3 | 30 | 8 | 73% |
| Turret Station | T4 | 100 | 30 | 70% |
| Turret Station | T5 | 300 | 100 | 67% |
| Training Facility | T1 | 1 | 0.3 | 70% |
| Training Facility | T2 | 5 | 1.5 | 70% |
| Training Facility | T3 | 20 | 6 | 70% |
| Training Facility | T4 | 60 | 20 | 67% |
| Training Facility | T5 | 180 | 60 | 67% |

### 3. Increase Building Base Costs

**Current vs Proposed:**
| Building | Tier | Current | Proposed | Increase |
|----------|------|---------|----------|----------|
| Scrap Works | T1 | 10 | 25 | 2.5x |
| Scrap Works | T2 | 100 | 500 | 5x |
| Scrap Works | T3 | 1000 | 10,000 | 10x |
| Scrap Works | T4 | 10000 | 250,000 | 25x |
| Scrap Works | T5 | 100000 | 5,000,000 | 50x |
| Turret Station | T1 | 50 | 100 | 2x |
| Turret Station | T2 | 300 | 1,500 | 5x |
| Turret Station | T3 | 3000 | 30,000 | 10x |
| Turret Station | T4 | 30000 | 750,000 | 25x |
| Turret Station | T5 | 300000 | 15,000,000 | 50x |
| Training Facility | T1 | 75 | 150 | 2x |
| Training Facility | T2 | 500 | 2,500 | 5x |
| Training Facility | T3 | 5000 | 50,000 | 10x |
| Training Facility | T4 | 50000 | 1,250,000 | 25x |
| Training Facility | T5 | 500000 | 25,000,000 | 50x |
| Engineering Bay | T1 | 150 | 1,000 | 6.6x |
| Engineering Bay | T2 | 1200 | 15,000 | 12.5x |
| Engineering Bay | T3 | 12000 | 200,000 | 16.7x |
| Engineering Bay | T4 | 120000 | 2,500,000 | 20.8x |
| Engineering Bay | T5 | 1200000 | 50,000,000 | 41.7x |
| Command Center | T1 | 5000 | 50,000 | 10x |
| Command Center | T2 | 50000 | 500,000 | 10x |
| Command Center | T3 | 500000 | 5,000,000 | 10x |
| Command Center | T4 | 5000000 | 50,000,000 | 10x |

### 4. Adjust Cost Multipliers

Current multipliers are fine but may need slight increase for late game:

| Building | Current | Proposed |
|----------|---------|----------|
| Scrap Works | 1.12 | 1.15 |
| Turret Station | 1.15 | 1.18 |
| Training Facility | 1.15 | 1.18 |
| Command Center | 1.25 | 1.30 |
| Engineering Bay | 1.18 | 1.20 |

### 5. Reduce Wave Completion Bonuses

**Current formula:**
```javascript
waveBonus = wave * 200 + Math.pow(wave, 1.8)
waveMultiplier = Math.min(10, 1 + Math.floor(wave / 10) * 0.5)
```

**Proposed formula:**
```javascript
waveBonus = wave * 50 + Math.pow(wave, 1.5)
waveMultiplier = Math.min(5, 1 + Math.floor(wave / 20) * 0.25)
```

**Comparison:**
| Wave | Current Bonus | Proposed Bonus | Reduction |
|------|---------------|----------------|-----------|
| 10 | 3,094 | 531 | 83% |
| 25 | 8,466 | 1,362 | 84% |
| 50 | 26,375 | 3,027 | 89% |
| 100 | 79,056 | 7,011 | 91% |

### 6. Reduce Enemy Rewards

With higher enemy HP, need to ensure rewards don't explode:

**Current vs Proposed:**
| Tier | Base Reward | Reward/Wave | Proposed Base | Proposed/Wave |
|------|-------------|-------------|---------------|---------------|
| Scrap Bot | 15 | 1.25x | 10 | 1.15x |
| Drone | 75 | 1.20x | 30 | 1.12x |
| Loader | 300 | 1.25x | 100 | 1.15x |
| Mech | 1500 | 1.28x | 500 | 1.18x |
| AI Unit | 8000 | 1.25x | 2000 | 1.15x |

### 7. Reduce Base Tap Damage

**Current:** baseTapDamage = 10
**Proposed:** baseTapDamage = 5

Combined with wave 1 enemy having 200 HP:
- Pure tapping at 5 DPS × 5 taps/sec = 25 DPS
- Wave 1 enemy (200 HP) takes ~8 seconds of tapping
- This feels engaging, not instant

### 8. Adjust Wave Timers (Slightly Tighter)

**Current:** base 25s, +0.3s/wave, max 90s
**Proposed:** base 20s, +0.2s/wave, max 60s

This creates more tension - you can't just wait for auto-damage, you need to tap or upgrade.

| Wave | Current Timer | Proposed Timer |
|------|---------------|----------------|
| 1 | 25.3s | 20.2s |
| 10 | 28s | 22s |
| 25 | 32.5s | 25s |
| 50 | 40s | 30s |
| 100 | 55s | 40s |

---

## Expected Pacing After Changes

### Wave 1-10 (~15 minutes)
- Wave 1 enemy: 200 HP, timer 20s
- Player has: 5 base tap damage, 10 workers
- With tapping only: 25 DPS, kills in 8s ✓
- Early upgrades: Scrap Works T1 costs 25 → 28 → 32 → 37...
- Wave rewards: ~500-1000 scrap per wave
- Can afford 10-20 upgrades per wave early on

### Wave 10-20 (~30 minutes)
- Wave 10 enemy: ~3,200 HP
- Need turret station (unlocks wave 3) + upgrades
- With level 5 turret (0.5 × 4.0 × 2.5 = 5 auto DPS) + 25 tap DPS = 30 DPS
- Kill time: ~107s... too slow, need more upgrades
- This creates the "need to grind" feel

### Wave 20-35 (~2 hours)
- Drone tier: 1,000 base HP × 1.30^n
- Wave 20: ~13,800 HP
- Wave 35: ~51,000 × 1.30^10 = ~700,000 HP
- Need significant turret investment (level 20+) and training facility

### Wave 35-50 (~1 day)
- Loader tier: 8,000 base HP × 1.32^n
- Wave 35: 8,000 HP (tier transition)
- Wave 50: 8,000 × 1.32^15 = ~500,000 HP
- Need tier 3 buildings, heavy worker allocation

### Wave 50-75 (~3-5 days)
- Mech tier: 80,000 base HP × 1.28^n
- Wave 50: 80,000 HP
- Wave 75: 80,000 × 1.28^25 = ~40 billion HP
- This is where prestige becomes necessary
- Players hitting a wall should prestige for bonuses

### Wave 75-100 (~1-2 weeks)
- AI Unit + Final bosses
- HP in trillions
- Requires multiple prestiges and upgrade investment

---

## Files to Modify

### src/data/enemies.ts
- Update all ENEMY_TIERS with new baseHealth values
- Update all ENEMY_TIERS with new healthMultiplierPerWave values
- Update all ENEMY_TIERS with new baseReward values
- Update all ENEMY_TIERS with new rewardMultiplierPerWave values

### src/data/buildings.ts
- Update baseProduction for all tiers of Scrap Works
- Update baseProduction for all tiers of Turret Station
- Update baseProduction for all tiers of Training Facility
- Update baseCost for all building tiers
- Update costMultiplier for all buildings

### src/systems/WaveManager.ts
- Update wave completion bonus formula (reduce multipliers)
- Update timer config (base 20s, +0.2s/wave, max 60s)

### src/core/GameState.ts
- Update baseTapDamage from 10 to 5

---

## Design/Approach

### Philosophy: "Earn Your Progress"

The current balance gives players everything too fast. The new balance follows idle game best practices:

1. **Early game hook** (waves 1-10): Quick progression, frequent rewards, learn mechanics
2. **First wall** (waves 10-20): Progress slows, encourages strategic building investment
3. **Mid game grind** (waves 20-50): Meaningful choices about worker allocation, building priorities
4. **Late game wall** (waves 50+): Prestige becomes attractive, replay value kicks in

### Tap Damage vs Auto Damage

With reduced base tap damage (5) and building damage, the game rewards:
- **Active play**: Tapping matters, especially early
- **Building investment**: Auto damage scales with turret station
- **Strategic choice**: Balance between production buildings and combat buildings

### Economic Loop

1. Kill enemies → earn scrap from damage + wave completion
2. Spend scrap → upgrade buildings (production or combat)
3. Better buildings → kill faster OR produce more scrap
4. Repeat with increasing costs and enemy HP

The key is that costs grow faster than income in mid/late game, creating the "idle wall" that makes the game last.

---

## Tests to Add/Update

### Unit Tests
- WaveManager: Test new timer calculations at waves 1, 10, 25, 50, 100
- WaveManager: Test new wave completion bonus at key waves
- Enemy: Test HP calculations at tier boundaries
- Building: Test production at various levels with new base values
- Building: Test upgrade costs at various levels with new values

### Integration Tests
- Verify wave 1 enemy has 200 HP
- Verify wave 10 can be defeated with reasonable building investment
- Verify wave timer doesn't exceed 60 seconds

### Manual Testing (Critical)
- Play through waves 1-20 and time it (target: ~1 hour)
- Play through waves 20-35 (target: ~2 hours)
- Verify wave 35-50 feels like "come back tomorrow" pacing
- Verify the game doesn't become frustratingly slow early on

---

## Risks & Rollback

### Risks
- May overcorrect and make early game frustrating
- Enemy HP scaling may create impossible walls
- Reduced rewards may feel punishing
- Timer reduction may make waves unbeatable

### Mitigation
- All values in data files, easy to tune
- Can add debug mode to test specific waves
- Start with these values and adjust based on playtesting
- Keep old values documented for comparison

### Rollback
- Revert data file changes
- No structural changes, pure number tuning

---

## Evidence

- src/data/enemies.ts:1-73 — Current enemy tier definitions
- src/data/buildings.ts:13-296 — Current building tiers and costs
- src/systems/WaveManager.ts:109-137 — Wave reward calculation
- src/systems/WaveManager.ts:36-43 — Timer configuration
- src/core/GameState.ts:163 — baseTapDamage value
- src/models/Enemy.ts:27-46 — Enemy HP calculation formula
- src/models/Building.ts:97-116 — Production calculation
- src/models/Building.ts:70-77 — Upgrade cost calculation

---

## Assumptions

- Players will tap actively during early game
- Auto damage should not trivialize early content
- The goal is an idle game that takes weeks to "beat"
- Prestige should feel necessary around wave 50-75
- Players accept grinding as part of idle game genre

---

## Open Questions

- Should there be a "soft cap" on building levels to prevent infinite grinding?
- Should wave timer be visible to create urgency?
- Should there be a "stuck" detection that offers hints?
- Should prestige threshold be lowered from 100 to make it more accessible?

---

## Tasks

### Phase 1: Enemy Rebalancing
1. Update Scrap Bot baseHealth from 50 to 200
2. Update Scrap Bot healthMultiplierPerWave from 1.3 to 1.35
3. Update Drone baseHealth from 150 to 1,000
4. Update Drone healthMultiplierPerWave from 1.25 to 1.30
5. Update Loader baseHealth from 800 to 8,000
6. Update Loader healthMultiplierPerWave from 1.28 to 1.32
7. Update Mech baseHealth from 4,000 to 80,000
8. Update AI Unit baseHealth from 25,000 to 800,000
9. Update all enemy reward values and scaling

### Phase 2: Building Production Reduction
10. Update Scrap Works baseProduction: T1=1, T2=5, T3=20, T4=75, T5=250
11. Update Turret Station baseProduction: T1=0.5, T2=2, T3=8, T4=30, T5=100
12. Update Training Facility baseProduction: T1=0.3, T2=1.5, T3=6, T4=20, T5=60

### Phase 3: Building Cost Increase
13. Update Scrap Works baseCost: T1=25, T2=500, T3=10000, T4=250000, T5=5000000
14. Update Turret Station baseCost: T1=100, T2=1500, T3=30000, T4=750000, T5=15000000
15. Update Training Facility baseCost: T1=150, T2=2500, T3=50000, T4=1250000, T5=25000000
16. Update Engineering Bay baseCost: T1=1000, T2=15000, T3=200000, T4=2500000, T5=50000000
17. Update Command Center baseCost: T1=50000, T2=500000, T3=5000000, T4=50000000

### Phase 4: Cost Multiplier Adjustment
18. Update Scrap Works costMultiplier from 1.12 to 1.15
19. Update Turret Station costMultiplier from 1.15 to 1.18
20. Update Training Facility costMultiplier from 1.15 to 1.18
21. Update Command Center costMultiplier from 1.25 to 1.30
22. Update Engineering Bay costMultiplier from 1.18 to 1.20

### Phase 5: Wave System Adjustments
23. Update WaveManager timer: base 20s, +0.2s/wave, max 60s
24. Update wave completion bonus formula
25. Update baseTapDamage from 10 to 5

### Phase 6: Testing & Tuning
26. Write/update unit tests for new values
27. Manual playtest waves 1-10 (target: 15 minutes)
28. Manual playtest waves 10-20 (target: 30-45 minutes)
29. Manual playtest waves 20-35 (target: 2 hours)
30. Verify wave 35-50 creates "wall" feeling
31. Adjust values based on playtesting results

---

## Detailed Balance Values (Final Reference)

### Enemy Tiers (PROPOSED)

| Tier | Waves | Base HP | HP/Wave | Base Reward | Reward/Wave |
|------|-------|---------|---------|-------------|-------------|
| Scrap Bot | 1-10 | 200 | 1.35x | 10 | 1.15x |
| Drone | 11-25 | 1,000 | 1.30x | 30 | 1.12x |
| Loader | 26-50 | 8,000 | 1.32x | 100 | 1.15x |
| Mech | 51-75 | 80,000 | 1.28x | 500 | 1.18x |
| AI Unit | 76-95 | 800,000 | 1.25x | 2,000 | 1.15x |

### Building Base Production (PROPOSED)

| Building | T1 | T2 | T3 | T4 | T5 |
|----------|-----|-----|-----|------|------|
| Scrap Works | 1 | 5 | 20 | 75 | 250 |
| Turret Station | 0.5 | 2 | 8 | 30 | 100 |
| Training Facility | 0.3 | 1.5 | 6 | 20 | 60 |
| Command Center | 15% | 25% | 35% | 50% | - |
| Engineering Bay | 10% | 15% | 20% | 30% | 40% |

### Building Base Costs (PROPOSED)

| Building | T1 | T2 | T3 | T4 | T5 |
|----------|-----|------|--------|-----------|------------|
| Scrap Works | 25 | 500 | 10,000 | 250,000 | 5,000,000 |
| Turret Station | 100 | 1,500 | 30,000 | 750,000 | 15,000,000 |
| Training Facility | 150 | 2,500 | 50,000 | 1,250,000 | 25,000,000 |
| Command Center | 50,000 | 500,000 | 5,000,000 | 50,000,000 | - |
| Engineering Bay | 1,000 | 15,000 | 200,000 | 2,500,000 | 50,000,000 |

### Building Cost Multipliers (PROPOSED)

| Building | Proposed |
|----------|----------|
| Scrap Works | 1.15 |
| Turret Station | 1.18 |
| Training Facility | 1.18 |
| Command Center | 1.30 |
| Engineering Bay | 1.20 |

### Wave Timer (PROPOSED)

| Setting | Value |
|---------|-------|
| Base timer | 20s |
| Per wave bonus | +0.2s |
| Max timer | 60s |

### Wave Completion Bonus (PROPOSED)

```javascript
waveBonus = wave * 50 + Math.pow(wave, 1.5)
waveMultiplier = Math.min(5, 1 + Math.floor(wave / 20) * 0.25)
```

### Tap Damage (PROPOSED)

| Setting | Value |
|---------|-------|
| Base value | 5 |

---

## Complete Formula Reference **[New: 2025-11-29]**

This section documents ALL existing formulas in the codebase and proposed changes.

### 1. Enemy Health Formula

**Location:** `src/models/Enemy.ts:27-31`

**Current Formula:**
```
enemyHealth = tier.baseHealth × tier.healthMultiplierPerWave^(wave - tier.minWave)
```

**Example (Wave 10 Scrap Bot):**
```
health = 50 × 1.3^(10-1) = 50 × 1.3^9 = 530
```

**Proposed Change:** Increase base health values and multipliers (see Enemy Tiers table above)

---

### 2. Enemy Reward Formula

**Location:** `src/models/Enemy.ts:32-34`

**Current Formula:**
```
enemyReward = tier.baseReward × tier.rewardMultiplierPerWave^(wave - tier.minWave)
```

**Example (Wave 10 Scrap Bot):**
```
reward = 15 × 1.25^9 = 112 scrap
```

**Proposed Change:** Reduce base rewards and multipliers (see Enemy Tiers table above)

---

### 3. Boss Enemy Formula

**Location:** `src/systems/WaveManager.ts:79-88`

**Current Formula:**
```
bossHealth = enemyHealth × BOSS_CONFIG.healthMultiplier (5.0)
bossReward = enemyReward × BOSS_CONFIG.rewardMultiplier (10.0)
bossInterval = every 10 waves
```

**Proposed Change:** No change (boss scaling is fine)

---

### 4. Building Upgrade Cost Formula

**Location:** `src/models/Building.ts:70-77`

**Current Formula:**
```
upgradeCost = baseCost × costMultiplier^(currentLevel - 1)
```

**Example (Scrap Works T1, Level 10→11):**
```
cost = 10 × 1.12^9 = 28 scrap
```

**Proposed Change:**
```
upgradeCost = newBaseCost × newCostMultiplier^(currentLevel - 1)
```

**Example with proposed values:**
```
cost = 25 × 1.15^9 = 88 scrap (3x higher)
```

---

### 5. Building Production Formula

**Location:** `src/models/Building.ts:97-116`

**Current Formula:**
```
production = baseProduction × levelMultiplier × effectiveWorkers × waveBonus × prestigeBonus

Where:
- levelMultiplier = 1 + (level - 1) × 0.75
- effectiveWorkers = (passiveBaseline + workerEfficiency) × milestoneBonus
- passiveBaseline = 1 (always)
```

**Example (Scrap Works T1, Level 10, 10 workers):**
```
levelMultiplier = 1 + 9 × 0.75 = 7.75
effectiveWorkers = (1 + 5.5) × 1.40 = 9.1 (with 10 workers + milestones)
production = 5 × 7.75 × 9.1 = 352/s
```

**Proposed Change:** Reduce baseProduction values only
```
production = 1 × 7.75 × 9.1 = 70/s (80% reduction)
```

---

### 6. Worker Efficiency Formula (NOT CHANGING)

**Location:** `src/systems/WorkerEfficiency.ts:42-49`

**Current Formula:**
```
singleWorkerEfficiency = 1 / (1 + (workerPosition - 1) × DECAY_RATE)

Where DECAY_RATE = 0.12

Worker Efficiency by Position:
- Worker 1: 100%
- Worker 2: 89%
- Worker 5: 68%
- Worker 10: 48%
- Worker 20: 30%
```

**Total Worker Efficiency:**
```
totalEfficiency = sum of all individual worker efficiencies
```

**With 10 workers:**
```
totalEfficiency = 1 + 0.89 + 0.81 + 0.74 + 0.68 + 0.63 + 0.58 + 0.54 + 0.51 + 0.48 = ~5.5
```

**Milestone Bonus (stacks additively):**
```
5+ workers: +15%
10+ workers: +25% (total +40%)
20+ workers: +35% (total +75%)
```

**Final Effective Workers:**
```
effectiveWorkers = (passiveBaseline + totalEfficiency) × (1 + milestoneBonus)
```

**Proposed Change:** None - this system is well-designed

---

### 7. Wave Timer Formula

**Location:** `src/systems/WaveManager.ts:93-107`

**Current Formula:**
```
timer = min(baseTimer + wave × timerBonusPerWave, maxTimer)

If boss wave:
  timer = timer × BOSS_CONFIG.timerMultiplier (2.0)

Current values:
- baseTimer = 25
- timerBonusPerWave = 0.3
- maxTimer = 90
```

**Example (Wave 50):**
```
timer = min(25 + 50 × 0.3, 90) = min(40, 90) = 40 seconds
```

**Proposed Change:**
```
- baseTimer = 20
- timerBonusPerWave = 0.2
- maxTimer = 60

Wave 50: min(20 + 50 × 0.2, 60) = min(30, 60) = 30 seconds
```

---

### 8. Wave Completion Reward Formula

**Location:** `src/systems/WaveManager.ts:109-137`

**Current Formula:**
```
baseScrap = enemyReward
waveBonus = wave × 200 + wave^1.8
waveMultiplier = min(10, 1 + floor(wave / 10) × 0.5)
bonusScrap = waveBonus × waveMultiplier
totalScrap = (baseScrap + bonusScrap) × prestigeBonus × boostMultiplier
```

**Example (Wave 10):**
```
baseScrap = 112
waveBonus = 10 × 200 + 10^1.8 = 2000 + 63 = 2063
waveMultiplier = min(10, 1 + 1 × 0.5) = 1.5
bonusScrap = 2063 × 1.5 = 3094
totalScrap = 112 + 3094 = 3206 scrap
```

**Proposed Change:**
```
waveBonus = wave × 50 + wave^1.5
waveMultiplier = min(5, 1 + floor(wave / 20) × 0.25)

Wave 10:
waveBonus = 10 × 50 + 10^1.5 = 500 + 32 = 532
waveMultiplier = min(5, 1 + 0 × 0.25) = 1.0
bonusScrap = 532 × 1.0 = 532
totalScrap = 112 + 532 = 644 scrap (80% reduction)
```

---

### 9. Auto Damage Formula (Turret Station)

**Location:** `src/systems/CombatSystem.ts:43-72`

**Current Formula:**
```
autoDamage = turretProduction × prestigeAutoDamage × boostMultiplier × tierMultiplier

Where turretProduction uses building production formula with turret baseProduction
```

**Example (Turret T1, Level 10, 10 workers):**
```
turretProduction = 2 × 7.75 × 9.1 = 141 DPS
With no bonuses: autoDamage = 141 DPS
```

**Proposed Change:** Reduce turret baseProduction
```
turretProduction = 0.5 × 7.75 × 9.1 = 35 DPS (75% reduction)
```

---

### 10. Tap Damage Formula

**Location:** `src/systems/CombatSystem.ts:103-112`

**Current Formula:**
```
tapDamage = baseTapDamage × prestigeTapPower × boostMultiplier × tierMultiplier × randomVariance

Where:
- baseTapDamage = 10 (from GameState)
- randomVariance = 0.9 to 1.1 (±10%)
```

**Example (no bonuses):**
```
tapDamage = 10 × 1 × 1 × 1 × 1.0 = 10 damage per tap
At 5 taps/second = 50 DPS from tapping
```

**Proposed Change:**
```
baseTapDamage = 5

tapDamage = 5 × 1 × 1 × 1 × 1.0 = 5 damage per tap
At 5 taps/second = 25 DPS from tapping
```

---

### 11. Tap Damage Bonus Formula (Training Facility)

**Location:** `src/systems/CombatSystem.ts:74-101`

**Current Formula:**
```
tapDamageBonus = trainingFacilityProduction (uses building production formula)

Effective tap damage = baseTapDamage + tapDamageBonus
```

**Example (Training T1, Level 10, 10 workers):**
```
tapDamageBonus = 1 × 7.75 × 9.1 = 70
effectiveTapDamage = 10 + 70 = 80 per tap
```

**Proposed Change:** Reduce training facility baseProduction
```
tapDamageBonus = 0.3 × 7.75 × 9.1 = 21
effectiveTapDamage = 5 + 21 = 26 per tap (67% reduction)
```

---

### 12. Combat Scrap from Damage Formula

**Location:** `src/systems/CombatSystem.ts:132-147`

**Current Formula:**
```
damageScrapPool = enemyReward × DAMAGE_SCRAP_PERCENT (0.5)
damagePercent = damage / maxHealth
scrapFromDamage = damageScrapPool × damagePercent × rewardMultiplier
```

**Example (100 damage to enemy with 500 HP, 100 reward):**
```
damageScrapPool = 100 × 0.5 = 50
damagePercent = 100 / 500 = 0.2
scrapFromDamage = 50 × 0.2 = 10 scrap
```

**Proposed Change:** None - this 50/50 split is intentional design

---

### 13. Wave Production Bonus Formula

**Location:** `src/systems/ProductionSystem.ts:34-49`

**Current Formula:**
```
waveBonus = 1 + logBonus + linearBonus + milestoneBonus

Where:
- logBonus = log10(wave + 1) × 0.5
- linearBonus = wave × 0.02
- milestoneBonus = +0.25 at wave 25, +0.5 at 50, +0.75 at 75, +1.0 at 100 (cumulative)
```

**Example (Wave 50):**
```
logBonus = log10(51) × 0.5 = 1.71 × 0.5 = 0.85
linearBonus = 50 × 0.02 = 1.0
milestoneBonus = 0.25 + 0.5 = 0.75
waveBonus = 1 + 0.85 + 1.0 + 0.75 = 3.6x multiplier
```

**Proposed Change:** None - this scales production appropriately with progress

---

### 14. Command Center Bonus Formula

**Location:** `src/systems/ProductionSystem.ts:55-73`

**Current Formula:**
```
commandCenterBonus = 1 + baseProduction + (level - 1) × 0.02

Where baseProduction varies by tier:
- T1: 0.15 (15%)
- T2: 0.25 (25%)
- T3: 0.35 (35%)
- T4: 0.50 (50%)
```

**Example (Command Center T1, Level 10):**
```
bonus = 1 + 0.15 + (10-1) × 0.02 = 1 + 0.15 + 0.18 = 1.33x multiplier
```

**Proposed Change:** None - utility building scaling is fine

---

### 15. Engineering Bay Discount Formula

**Location:** `src/data/buildings.ts:467-488`

**Current Formula:**
```
discountPercent = baseProduction + (level - 1) × 0.02
cappedDiscount = min(0.5, discountPercent)
costMultiplier = 1 - cappedDiscount

Where baseProduction varies by tier:
- T1: 0.10 (10%)
- T2: 0.15 (15%)
- T3: 0.20 (20%)
- T4: 0.30 (30%)
- T5: 0.40 (40%)
```

**Example (Engineering T1, Level 10):**
```
discountPercent = 0.10 + 9 × 0.02 = 0.28 (28% discount)
costMultiplier = 1 - 0.28 = 0.72
```

**Proposed Change:** None - discount scaling is fine

---

### 16. Daily Reward Scaling Formula

**Location:** `src/data/dailyRewards.ts:58-64`

**Current Formula:**
```
cappedWave = min(wave, 50)
waveScaling = 1.15^(cappedWave - 1)
scaledReward = baseAmount × waveScaling
```

**Example (Day 1 reward at Wave 50):**
```
cappedWave = 50
waveScaling = 1.15^49 = 867.7
scaledReward = 1000 × 867.7 = 867,716 scrap
```

**Proposed Change:** None - wave cap at 50 already limits this

---

### 17. Offline Production Formula

**Location:** `src/systems/ProductionSystem.ts:139-155`

**Current Formula:**
```
cappedSeconds = min(offlineSeconds, maxOfflineHours × 3600)
offlineProduction = totalProductionPerSecond × cappedSeconds × offlineEfficiency

Where:
- maxOfflineHours = 8
- offlineEfficiency = 0.5 (50%)
```

**Example (8 hours offline, 100 scrap/s production):**
```
cappedSeconds = 8 × 3600 = 28,800
offlineProduction = 100 × 28,800 × 0.5 = 1,440,000 scrap
```

**Proposed Change:** None - offline production is already capped

---

### 18. Burst Attack Formula

**Location:** `src/systems/CombatSystem.ts:114-126`

**Current Formula:**
```
effectiveChance = baseBurstChance + prestigeBurstChance
burstMultiplier = baseBurstMultiplier × prestigeBurstDamage

Where:
- baseBurstChance = 0.05 (5%)
- baseBurstMultiplier = 5.0 (5x damage)
```

**Proposed Change:** None - burst mechanics are fine

---

## Formula Summary Table

| System | Current | Proposed | Change |
|--------|---------|----------|--------|
| Wave 1 Enemy HP | 50 | 200 | +300% |
| Wave 10 Enemy HP | 530 | 3,200 | +504% |
| Wave 50 Enemy HP | 282,000 | 23,000,000 | +8,056% |
| Base Tap Damage | 10 | 5 | -50% |
| Scrap Works T1 Production | 5/s | 1/s | -80% |
| Turret T1 DPS | 2/s | 0.5/s | -75% |
| Wave 10 Timer | 28s | 22s | -21% |
| Wave 10 Completion Bonus | 3,094 | 532 | -83% |
| Scrap Works T1 Base Cost | 10 | 25 | +150% |
| Cost Multiplier (Scrap) | 1.12 | 1.15 | +2.7% |

---

## Pacing Math Validation

### Wave 1 Time-to-Kill (New Balance)

**Pure Tapping:**
- Tap damage: 5 per tap
- Taps/second: 5 (reasonable active play)
- DPS from tapping: 25
- Enemy HP: 200
- Time to kill: 200 / 25 = **8 seconds** ✓

**With Level 1 Turret (unlocks wave 3):**
- Turret DPS: 0.5 × 1 × 1 = 0.5
- Total DPS: 25 + 0.5 = 25.5
- Time to kill: 7.8 seconds

### Wave 10 Time-to-Kill (New Balance)

**Level 5 Turret + Level 5 Training + Tapping:**
- Turret: 0.5 × 4.0 × 3.1 = 6.2 DPS
- Training bonus: 0.3 × 4.0 × 3.1 = 3.7
- Tap damage: 5 + 3.7 = 8.7 per tap → 43.5 DPS
- Total DPS: 6.2 + 43.5 = 49.7
- Enemy HP: 3,200
- Time to kill: 3,200 / 49.7 = **64 seconds**
- Timer: 22 seconds
- **Result: NEED MORE UPGRADES** ✓

This creates the intended "wall" feeling at wave 10 where players must grind upgrades.

### Wave 25 Time-to-Kill (New Balance)

**Level 15 Turret + Level 10 Training + Tapping:**
- Turret: 0.5 × 11.5 × 6.5 = 37 DPS
- Training bonus: 0.3 × 7.75 × 5.5 = 12.8
- Tap damage: 5 + 12.8 = 17.8 per tap → 89 DPS
- Total DPS: 37 + 89 = 126
- Enemy HP (Drone wave 25): 1,000 × 1.30^14 = 51,186
- Time to kill: 51,186 / 126 = **406 seconds**
- Timer: 25 seconds
- **Result: FAR FROM BEATABLE** - need tier 2 buildings, more levels

This validates that waves 20-35 will take hours, not minutes.
