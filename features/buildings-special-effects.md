# Buildings Special Effects

> **Changelog**
> - **2025-11-30**: Added emphasis on configurable/data-driven formulas for easy balance iteration

## Summary

Add RNG-based special effects to buildings that trigger periodically and scale with building level, evolution tier, assigned workers, and prestige upgrades. Each building type will have a unique special ability that provides meaningful gameplay impact and strategic depth.

**Special Effects by Building:**
- **Scrap Works**: Periodically finds bonus scrap worth 1/5 of current wave reward
- **Training Facility**: Chance to deal 5x tap damage (leverage existing burst system)
- **Weak Point Scanner**: Chance to spawn "critical weak points" worth 5x normal weak point damage (stacks multiplicatively with Training Facility's effect for potential 25x bonus)
- **Shield Generator**: Chance at wave start to extend wave duration

**Why Needed:**
- Adds meaningful differentiation between building types beyond stat bonuses
- Creates engaging "proc" moments that reward active play
- Provides additional scaling vectors for late-game progression
- Encourages strategic building investment decisions

---

## Acceptance Criteria

- [ ] Scrap Works triggers a bonus scrap drop every X seconds (scaling with level/workers)
- [ ] Training Facility adds to burst attack chance (integrates with existing burst system)
- [ ] Weak Point Scanner has a chance to spawn critical weak points with distinct visual treatment
- [ ] Critical weak points deal 5x the damage of normal weak points
- [ ] Training Facility burst bonus stacks multiplicatively with critical weak point damage
- [ ] Shield Generator has a chance to extend wave duration at wave start
- [ ] All special effect chances/frequencies scale with building level
- [ ] All special effect chances/frequencies scale with evolution tier
- [ ] All special effect chances/frequencies scale with assigned workers
- [ ] All special effects can be amplified by relevant prestige upgrades
- [ ] Visual feedback when special effects trigger
- [ ] Special effect stats visible in building UI

---

## Scope / Non-Goals

### In Scope
- Special effect definitions per building type
- Effect chance/frequency calculations with scaling
- Integration with existing burst attack system
- Critical weak point type and spawning logic
- Visual indicators for critical weak points
- Wave duration extension mechanic
- Periodic scrap bonus drops
- UI updates to show special effect info on BuildingCard
- Event emissions for effect triggers

### Non-Goals
- New prestige upgrades specifically for special effects (use existing ones initially)
- Sound effects for special effect triggers
- Special effects for Command Center and Engineering Bay (they already have static utility effects)
- Achievements related to special effects
- Tutorial/onboarding for special effects

---

## Files to Modify

### Models

**`src/models/Building.ts`**
- Add `SpecialEffectType` enum defining effect types: 'scrap_find', 'burst_boost', 'critical_weakness', 'wave_extend'
- Add `SpecialEffectDefinition` interface with properties for baseChance, chancePerLevel, chancePerWorker, cooldown, effectMultiplier
- Add optional `specialEffect` property to `BuildingEvolutionTier` interface
- Add helper function `calculateSpecialEffectChance()` that takes level, workers, tier, and prestige bonuses

### Data **[Updated: 2025-11-30]**

**`src/data/specialEffectConfig.ts`** (new file)
- Create a centralized configuration file for all special effect balance values
- Define `SpecialEffectBalanceConfig` interface containing all tunable parameters
- Export a single `SPECIAL_EFFECT_CONFIG` object with all formula coefficients grouped by effect type
- Include comments explaining what each parameter controls for easy adjustment
- Structure allows changing any formula coefficient without touching system logic
- Parameters to include per effect:
  - Base values (chance, cooldown, multiplier)
  - Per-level scaling factors
  - Per-worker scaling factors
  - Per-tier scaling factors
  - Prestige scaling factors
  - Min/max caps

**`src/data/buildings.ts`**
- Add `specialEffect` definitions to scrap_works tiers with base chance and cooldown values
- Add `specialEffect` definitions to training_facility tiers linking to burst system
- Add `specialEffect` definitions to weak_point_scanner tiers for critical weakness spawn
- Add `specialEffect` definitions to shield_generator tiers for wave extension chance

### Systems

**`src/systems/SpecialEffectsSystem.ts`** (new file)
- Create stateless system class following existing pattern from CombatSystem/ProductionSystem
- Method `processScrapFind()` - calculates and returns bonus scrap amount
- Method `calculateBurstBoostChance()` - returns additional burst chance from Training Facility
- Method `shouldSpawnCriticalWeakness()` - RNG check for critical weak point
- Method `calculateCriticalWeaknessDamage()` - returns multiplier (base 5x, can stack)
- Method `checkWaveExtension()` - RNG check at wave start
- Method `calculateWaveExtensionBonus()` - returns bonus seconds to add
- Method `getEffectScalingFactor()` - helper for level/worker/tier scaling

**`src/systems/CombatSystem.ts`**
- Modify `checkBurstAttack()` to incorporate Training Facility special effect bonus
- Update `getPrestigeBonuses()` to include special effect amplification if applicable

**`src/systems/WaveManager.ts`**
- Modify wave timer calculation to check for Shield Generator special effect at wave start
- Add call to SpecialEffectsSystem.checkWaveExtension() when starting new wave

### Components

**`src/components/game/WeakPointOverlay.tsx`**
- Add `isCritical` boolean property to `WeakPoint` interface
- Add `criticalDamageMultiplier` constant (5.0)
- Create distinct visual style for critical weak points (different color/animation)
- Modify damage calculation to apply critical multiplier when `isCritical` is true
- Update spawn logic to potentially spawn critical weak points based on Scanner special effect

**`src/components/game/BuildingCard.tsx`**
- Add display section showing special effect description
- Show current effect chance/frequency based on level and workers
- Add visual indicator when special effect is active/available

**`src/components/game/EnemyDisplay.tsx`** (if needed)
- Add visual feedback when scrap bonus is found
- May need floating text animation for bonus scrap

### State

**`src/stores/gameStore.ts`**
- Add `lastScrapFindTime` tracking per building for cooldown management
- Add action `recordSpecialEffectTrigger()` to track cooldowns
- Add action `applyWaveExtension()` to modify wave timer

**`src/core/GameState.ts`**
- Add `specialEffectCooldowns` map to BuildingState or separate state slice
- Potentially add `waveExtensionApplied` boolean to prevent double-triggering

### Events

**`src/core/EventBus.ts`**
- Add `SPECIAL_EFFECT_TRIGGERED` event for general effect triggers
- Add `SCRAP_BONUS_FOUND` event specific to Scrap Works effect
- Add `CRITICAL_WEAKNESS_SPAWNED` event for visual feedback
- Add `WAVE_EXTENDED` event for Shield Generator effect

---

## Design / Approach

### Effect Scaling Formula **[Updated: 2025-11-30]**

All special effects scale using a unified formula with **all coefficients defined in `specialEffectConfig.ts`** for easy iteration:

```
effectiveChance = baseChance
  + (level - 1) × chancePerLevel
  + workers × chancePerWorker
  + tierBonus
  + prestigeBonus
```

**Key Design Decision**: All numeric values in this formula (and similar formulas below) are NOT hardcoded in system logic. Instead, they are read from the centralized `SPECIAL_EFFECT_CONFIG` object. This allows:
- Balance changes without code modifications
- A/B testing different configurations
- Easy rollback to previous values
- Clear documentation of what each parameter affects

Tier bonuses increase with each evolution (Tier 1 = +0%, Tier 2 = +2%, Tier 3 = +4%, etc.) - these percentages are configurable

### Scrap Works - "Scrap Find" **[Updated: 2025-11-30]**

- **Trigger**: Every X seconds (cooldown-based, not RNG chance)
- **Cooldown**: Configurable base (default 30s), reduced by configurable per-level and per-worker factors (minimum configurable)
- **Reward**: Configurable percentage of current wave completion reward (default 20%)
- **Scaling**: Higher tiers find larger percentage - tier multipliers defined in config
- **Visual**: Floating scrap icon with bonus amount text
- **Config keys**: `scrapFind.baseCooldown`, `scrapFind.cooldownPerLevel`, `scrapFind.cooldownPerWorker`, `scrapFind.minCooldown`, `scrapFind.rewardPercent`, `scrapFind.tierMultipliers`

### Training Facility - "Combat Training" **[Updated: 2025-11-30]**

- **Trigger**: Additive bonus to existing burst attack chance
- **Base Bonus**: Configurable (default +2% burst chance at Tier 1)
- **Scaling**: Configurable per-level, per-worker, and per-tier bonuses
- **Integration**: Feeds directly into CombatSystem.checkBurstAttack()
- **Max Cap**: Configurable cap on total burst chance (default 50%)
- **Config keys**: `burstBoost.baseChance`, `burstBoost.chancePerLevel`, `burstBoost.chancePerWorker`, `burstBoost.chancePerTier`, `burstBoost.maxTotalChance`

### Weak Point Scanner - "Critical Analysis" **[Updated: 2025-11-30]**

- **Trigger**: When spawning a weak point, chance to make it critical
- **Base Chance**: Configurable (default 5% at Tier 1)
- **Scaling**: Configurable per-level, per-worker, per-tier factors
- **Critical Multiplier**: Configurable (default 5x normal weak point damage)
- **Stacking**: Multiplies with burst damage (critical × burst)
- **Visual**: Different color (gold/orange vs normal blue), pulsing animation, larger size
- **Config keys**: `criticalWeakness.baseChance`, `criticalWeakness.chancePerLevel`, `criticalWeakness.chancePerWorker`, `criticalWeakness.chancePerTier`, `criticalWeakness.damageMultiplier`

### Shield Generator - "Emergency Shields" **[Updated: 2025-11-30]**

- **Trigger**: Once at wave start (checked when new wave begins)
- **Base Chance**: Configurable (default 10% at Tier 1)
- **Scaling**: Configurable per-level and per-tier bonuses
- **Effect**: Adds bonus seconds to wave timer
- **Bonus Amount**: Configurable percentage of base wave time (default 50%)
- **Visual**: Shield effect on screen, timer flashes when extended
- **Config keys**: `waveExtend.baseChance`, `waveExtend.chancePerLevel`, `waveExtend.chancePerTier`, `waveExtend.bonusTimePercent`, `waveExtend.maxBonusSeconds`

### Data Flow

1. **Game Loop Tick**:
   - Check Scrap Works cooldown, trigger if ready and roll succeeds
   - Burst chance already incorporates Training Facility bonus

2. **Wave Start**:
   - Shield Generator check runs once
   - If triggered, wave timer is extended before countdown starts

3. **Weak Point Spawn**:
   - WeakPointOverlay checks Scanner special effect
   - RNG determines if spawned point is critical
   - Critical points have distinct appearance and damage multiplier

4. **Tap Registered**:
   - Existing burst check now includes Training Facility bonus
   - If tapping critical weak point, apply critical multiplier
   - If burst also triggered, multiply both bonuses

### Architecture Impact

- New `SpecialEffectsSystem` follows existing stateless system pattern
- Integrates cleanly with existing production/combat tick flow
- Events enable loose coupling for UI feedback
- No changes to save system needed (cooldowns can be derived from lastTriggerTime)

---

## Tests to Add/Update

### Unit Tests

**`tests/systems/SpecialEffectsSystem.test.ts`** (new)
- Test effect chance calculation with various level/worker/tier combinations
- Test scrap find amount calculation
- Test burst boost chance stacking
- Test critical weakness spawn chance
- Test wave extension bonus calculation
- Test cooldown mechanics

**`tests/systems/CombatSystem.test.ts`**
- Add tests for burst check with Training Facility bonus
- Test burst chance caps at reasonable maximum

**`tests/systems/WaveManager.test.ts`**
- Add tests for wave timer with Shield Generator extension
- Test extension only applies once per wave

### Integration Tests

**`tests/components/WeakPointOverlay.test.tsx`**
- Test critical weak point rendering
- Test critical damage multiplier application
- Test critical × burst stacking

### Manual Testing

- Verify Scrap Works bonus triggers and shows correct amount
- Verify Training Facility increases visible burst attack frequency
- Verify critical weak points are visually distinct
- Verify critical weak point damage is 5x normal
- Verify burst + critical stacks to 25x
- Verify Shield Generator extends wave at start
- Verify extension visual feedback appears
- Test scaling feels balanced at various progression points

---

## Risks & Rollback

### Risks

1. **Balance Issues**: Special effects might be too powerful or too weak
   - Mitigation: Start conservative, tune via data files without code changes

2. **Performance**: Frequent RNG checks and cooldown tracking
   - Mitigation: Cooldowns are simple timestamp comparisons, minimal overhead

3. **UI Clutter**: Too many visual effects triggering simultaneously
   - Mitigation: Subtle visual feedback, don't spam notifications

4. **Complexity**: Players may not understand stacking mechanics
   - Mitigation: Clear tooltips in BuildingCard showing effect info

### Rollback

- Special effects are additive to existing systems
- Can disable by setting all base chances to 0 in building data
- No database migrations or save format changes required
- UI additions are isolated to BuildingCard and WeakPointOverlay

---

## Evidence

| File | Line | Relevance |
|------|------|-----------|
| `src/models/Building.ts` | 8-17 | BuildingEvolutionTier interface to extend with specialEffect |
| `src/models/Building.ts` | 97-116 | Production calculation pattern to follow for effect scaling |
| `src/data/buildings.ts` | 14-71 | scrap_works definition to add effect to |
| `src/data/buildings.ts` | 131-187 | training_facility definition for burst boost |
| `src/data/buildings.ts` | 73-129 | weak_point_scanner definition for critical weakness |
| `src/data/buildings.ts` | 297-344 | shield_generator definition for wave extension |
| `src/systems/CombatSystem.ts` | 118-130 | Existing burst attack system to integrate with |
| `src/systems/CombatSystem.ts` | 266-295 | Prestige bonus calculation pattern |
| `src/systems/WaveManager.ts` | 93-107 | Wave timer calculation to modify |
| `src/systems/WaveManager.ts` | 109-137 | Wave reward calculation for scrap find amount |
| `src/components/game/WeakPointOverlay.tsx` | 13-19 | WeakPoint interface to add isCritical |
| `src/components/game/WeakPointOverlay.tsx` | 38-44 | Tier config for critical variant |
| `src/components/game/WeakPointOverlay.tsx` | 71-78 | Damage multiplier calculation to extend |
| `src/core/EventBus.ts` | 42-61 | Event constants to extend |
| `src/stores/gameStore.ts` | 1-150+ | Store actions pattern for new effects |

---

## Assumptions

- Existing burst system integration is acceptable (vs creating separate "building burst")
- Critical weak points replace the spawned point (not additional to max count)
- Shield Generator extension is once per wave (not retriggerable)
- No new prestige upgrades needed for MVP (existing ones provide scaling)
- Buildings without workers (Command Center, Engineering Bay) keep their static utility effects only
- Scrap find cooldown resets when prestige resets

---

## Open Questions

1. **Critical Weak Point Appearance**: Gold/orange color scheme? Size increase? Pulsing animation style?

2. **Training Facility Integration**: Should it completely replace the base burst system or be purely additive? (Recommendation: purely additive)

3. **Shield Generator Cap**: Should wave extension have a maximum (e.g., can't exceed 90 seconds total)?

4. **Effect Visibility**: Should we show a log/history of special effect triggers?

5. **Scrap Find Scaling**: Is 1/5 of wave reward the right balance? Should it scale with wave number more aggressively?

6. **Prestige Amplification**: Which existing prestige upgrades should amplify special effects?
   - Burst Chance → Training Facility effect
   - Burst Damage → Critical weakness damage
   - Wave Rewards → Scrap find amount
   - Production Boost → Scrap find amount

---

## Tasks **[Updated: 2025-11-30]**

1. Create `src/data/specialEffectConfig.ts` with centralized balance configuration object
2. Add `SpecialEffectType` enum and `SpecialEffectDefinition` interface to Building model
3. Add `calculateSpecialEffectChance()` helper function to Building model that reads from config
4. Add `specialEffect` property to `BuildingEvolutionTier` interface
5. Define special effect configurations for scrap_works in buildings data (referencing config)
6. Define special effect configurations for training_facility in buildings data (referencing config)
7. Define special effect configurations for weak_point_scanner in buildings data (referencing config)
8. Define special effect configurations for shield_generator in buildings data (referencing config)
9. Create SpecialEffectsSystem that reads all formula values from config
10. Add burst boost calculation to SpecialEffectsSystem using config values
11. Add critical weakness spawn logic to SpecialEffectsSystem using config values
12. Add wave extension calculation to SpecialEffectsSystem using config values
13. Add new event types to EventBus for special effects
14. Modify CombatSystem burst check to include Training Facility bonus
15. Modify WaveManager to check Shield Generator effect at wave start
16. Add `isCritical` property and visual styling to WeakPointOverlay
17. Update WeakPointOverlay spawn logic to potentially create critical points
18. Update WeakPointOverlay damage calculation for critical multiplier
19. Add cooldown tracking state for Scrap Works to gameStore
20. Add special effect trigger action to gameStore
21. Update BuildingCard to display special effect information
22. Add visual feedback for scrap bonus found (floating text)
23. Add visual feedback for wave extension (timer flash/shield effect)
24. Write unit tests for SpecialEffectsSystem (including config-driven tests)
25. Write tests for modified CombatSystem burst with Training bonus
26. Write tests for WaveManager wave extension
27. Write tests for critical weak point spawning and damage
28. Manual balance testing across early/mid/late game progression
29. Document config parameters in specialEffectConfig.ts for future balance tuning
