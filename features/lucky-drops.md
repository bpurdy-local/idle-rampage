# Feature Plan: Lucky Drops

**Created: 2025-11-28**

---

## Summary

Add random bonus drops when defeating enemies. Players have a small chance to receive extra rewards beyond the normal wave reward - bonus scrap, blueprints, temporary boosts, or rare builder drops. This variable reward system creates excitement and anticipation with each enemy defeat.

**What problem does it solve?**
- Enemy defeats feel predictable and routine
- No surprise or delight moments during combat
- Rewards are deterministic and lack excitement
- Players don't feel "lucky" or special

**Why is this needed?**
- Variable rewards are the most addictive game mechanic (slot machine psychology)
- Creates memorable "lucky" moments players want to recreate
- Adds excitement to routine gameplay
- Gives players stories to share ("I got a double blueprint drop!")

---

## Acceptance Criteria

- [ ] Small chance (5-10%) for bonus drop on enemy defeat
- [ ] Multiple drop types with different rarities
- [ ] Visual indicator when lucky drop occurs (sparkle, glow, etc.)
- [ ] Drop type and amount displayed clearly
- [ ] Drops automatically collected (no manual pickup)
- [ ] Drop rates configurable in data file
- [ ] Rarer drops have bigger visual celebration
- [ ] Lucky drop history/stats tracked (optional)

---

## Scope / Non-Goals

### In Scope
- Random drop chance on enemy defeat
- Multiple drop types (scrap, blueprints, temporary boost, builder)
- Rarity tiers affecting drop rates and amounts
- Visual feedback for drops (popup notification)
- Data-driven drop table configuration
- Integration with existing reward system

### Non-Goals
- Physical item drops that need manual collection
- Drop equipment or items (inventory system)
- Drop trading or gifting
- Pity system guaranteeing drops after X defeats
- Drop rate increases from upgrades/prestige
- Loot boxes or gacha mechanics

---

## Files to Modify

### New Files

- `src/data/luckyDrops.ts` - Define drop table with types, rarities, chances, and reward ranges

- `src/systems/LuckyDropSystem.ts` - Handle drop roll logic, determine if drop occurs, select drop type based on weighted rarity

- `src/components/game/LuckyDropNotification.tsx` - Animated notification showing drop type and amount with rarity-based styling

### Modified Files

- `src/core/GameState.ts` - Add luckyDropStats to track total drops received by type (optional)

- `src/stores/gameStore.ts` - Add action for granting lucky drop rewards

- `src/systems/WaveManager.ts` - Call LuckyDropSystem on enemy defeat, integrate drop into reward flow

- `src/screens/GameScreen.tsx` - Render LuckyDropNotification when drop occurs

- `src/core/EventBus.ts` - Add LUCKY_DROP event for drop notifications

---

## Design / Approach

### Drop Table Structure

```typescript
interface LuckyDrop {
  id: string;
  name: string;
  type: 'scrap' | 'blueprints' | 'boost' | 'builder';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  weight: number;           // Relative chance within drops
  minAmount: number;        // Minimum reward
  maxAmount: number;        // Maximum reward (random between)
  boostType?: string;       // For boost drops
  boostDuration?: number;   // For boost drops (seconds)
}
```

### Drop Chances

Base drop chance: 8% per enemy defeat

When a drop occurs, select from weighted table:

| Drop | Rarity | Weight | Chance* | Amount |
|------|--------|--------|---------|--------|
| Scrap Bonus | Common | 50 | ~4% | 2-5x wave reward |
| Blueprint | Uncommon | 30 | ~2.4% | 1-3 blueprints |
| 2x Boost (30s) | Rare | 15 | ~1.2% | 30 sec all boost |
| Builder | Epic | 5 | ~0.4% | 1 builder |

*Chance = base_chance × (weight / total_weight)

### Drop Roll Flow

1. Enemy defeated in WaveManager
2. Call `LuckyDropSystem.rollForDrop(wave)`
3. Roll random 0-100, compare to base chance (8%)
4. If drop triggered, roll weighted selection from drop table
5. Calculate reward amount (random between min/max, scaled by wave)
6. Emit LUCKY_DROP event with drop details
7. Apply reward via appropriate store action
8. Display notification

### Wave Scaling

Higher waves slightly improve drops:
- Scrap bonus scales with wave reward naturally
- Blueprint amount: +1 possible at wave 50+
- Builder drop chance increases slightly at higher waves (optional)

### Visual Feedback by Rarity

| Rarity | Color | Animation | Sound* |
|--------|-------|-----------|--------|
| Common | White | Fade in/out | Soft chime |
| Uncommon | Green | Slide + glow | Medium chime |
| Rare | Blue | Bounce + sparkle | Exciting chime |
| Epic | Purple/Gold | Big bounce + particles | Fanfare |

*Sound integration is stub/future

### Notification Component

Appears above enemy area, shows:
- Drop icon (scrap gear, blueprint, lightning bolt, builder)
- Amount text ("+ 500 Scrap!")
- Rarity-colored background/border
- Animates in, holds 2 seconds, fades out

### Statistics Tracking (Optional)

Track in player state:
```
luckyDropStats: {
  totalDrops: number,
  dropsByType: Record<string, number>,
  dropsByRarity: Record<string, number>,
  lastDropTime: number
}
```

---

## Tests to Add/Update

### Unit Tests - `tests/systems/LuckyDropSystem.test.ts`

- rollForDrop returns null most of the time (92%)
- rollForDrop occasionally returns a drop (8%)
- Drop type follows weighted distribution over many rolls
- Scrap drops calculate correct amount range
- Blueprint drops calculate correct amount range
- Wave scaling affects drop amounts
- Builder drops are rare but possible

### Unit Tests - `tests/data/luckyDrops.test.ts`

- All drops have required fields
- Weights are positive numbers
- Amounts are valid (min <= max)
- Boost drops have duration defined

### Integration Tests

- Lucky drop triggers after enemy defeat
- Drop reward applied to player state
- LUCKY_DROP event emitted with correct data
- Notification displays for drop

### Manual Testing

- [ ] Play through many waves, observe occasional drops
- [ ] Verify scrap drops add correct amount
- [ ] Verify blueprint drops add correct amount
- [ ] Verify boost drops apply temporary multiplier
- [ ] Verify builder drops increase builder count
- [ ] Notification appears with correct styling per rarity
- [ ] Drops feel random but not too rare/frequent

---

## Risks & Rollback

### Risks

**Risk: Drop rates feel wrong (too rare or too common)**
- Mitigation: All rates in data file for easy tuning
- Mitigation: Playtest extensively before finalizing
- Mitigation: Can adjust without code changes

**Risk: Epic drops (builders) feel unearned**
- Mitigation: Very low chance (0.4% per defeat)
- Mitigation: Builder is useful but not game-breaking
- Mitigation: Can remove builder from drop table if problematic

**Risk: Players feel cheated when no drops occur**
- Mitigation: 8% is frequent enough to see regularly
- Mitigation: Common drops provide consistent small wins
- Future: Could add pity system if needed

**Risk: Boost drops stack weirdly with purchased boosts**
- Mitigation: Use same boost system, extends duration if active
- Mitigation: Clear boost indicator in UI

### Rollback

- System is isolated, can be disabled by returning null from rollForDrop
- No core game mechanics depend on lucky drops
- Player state additions are optional tracking only
- Remove notification component to hide feature

---

## Evidence

- `src/systems/WaveManager.ts:calculateWaveReward` - Reward integration point
- `src/systems/WaveManager.ts:completeWave` - Enemy defeat handler
- `src/stores/gameStore.ts:addScrap/addBlueprints/addBuilders/addBoost` - Reward application
- `src/core/EventBus.ts:GameEvents` - Event system for notifications
- `src/data/iapProducts.ts` - Pattern for data definitions

---

## Assumptions

- Random number generation is acceptable (Math.random)
- Boost system exists and can accept short-duration boosts
- Notification can overlay on game screen without issues
- 8% base rate will feel "lucky" not "expected"
- Players prefer automatic collection over manual pickup

---

## Open Questions

1. Should drop chance increase with prestige level?
2. Should there be a visual preview before drop (anticipation)?
3. Should very early waves (1-5) have higher drop rates for onboarding?
4. Should drops be saveable if app closes during notification?
5. Should there be a "lucky streak" bonus for consecutive drops?

---

## Tasks

1. Create luckyDrops data file with drop table definition
2. Define drop types, rarities, weights, and amounts
3. Implement LuckyDropSystem with rollForDrop method
4. Add weighted random selection for drop type
5. Add wave-scaled amount calculation
6. Add LUCKY_DROP event to EventBus
7. Integrate drop roll into WaveManager enemy defeat
8. Create LuckyDropNotification component
9. Add rarity-based styling variants
10. Implement notification animation (enter, hold, exit)
11. Add notification trigger in GameScreen
12. Connect drop rewards to store actions
13. Add optional drop statistics tracking
14. Playtest and tune drop rates
15. Test edge cases (rapid defeats, app backgrounding)
