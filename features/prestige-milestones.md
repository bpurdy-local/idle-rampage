# Feature Plan: Prestige Milestones (Building Evolutions)

---

## Summary

Add a prestige milestone system that unlocks building evolutions at specific prestige counts (up to prestige 100). Each milestone transforms buildings into upgraded versions with the same function but better stats, providing visible long-term progression and "power fantasy" moments.

**Problem Solved:** After purchasing prestige upgrades, there's no visible change to the game world. Players need tangible evidence of their progress beyond numbers.

**Why Needed:** Building evolutions create collection/completionist drive, provide clear long-term goals, and make each prestige run feel more rewarding as buildings visually and statistically improve.

---

## Acceptance Criteria

- [ ] Prestige milestones unlock at prestige counts: 1, 3, 5, 10, 20, 35, 50, 75, 100
- [ ] Each milestone evolves all 7 buildings to a new tier simultaneously
- [ ] Evolved buildings have the same role/function but improved base stats
- [ ] Evolved buildings have new names reflecting their tier (e.g., "Scrap Collector" → "Scrap Harvester" → "Scrap Excavator")
- [ ] Evolved buildings have distinct colors to show progression
- [ ] Building evolution is permanent and persists through future prestiges
- [ ] UI shows current building tier and next milestone requirement
- [ ] A celebration popup appears when a milestone is reached
- [ ] Players can view all building tiers and their stats in a Building Info modal

---

## Scope / Non-Goals

### In Scope
- 9 evolution tiers for all 7 buildings (base + 8 upgrades = 9 total tiers)
- Stat multipliers per tier (production, combat effectiveness)
- New names and colors for each building tier
- Prestige milestone tracking in player state
- Milestone celebration UI
- Building tier display in BuildingCard and BuildingInfoModal

### Non-Goals
- Unique building sprites/icons per tier (reuse existing icons, change colors)
- Individual building evolution (all buildings evolve together)
- Building evolution choices or branching paths
- Building tier-specific abilities or mechanics
- Animated evolution sequences
- Building tier achievements/trophies

---

## Files to Modify

### Data Layer
- `src/data/buildings.ts` - Add building tier definitions with names, colors, and stat multipliers for all 9 tiers
- `src/data/prestigeMilestones.ts` (NEW) - Define milestone thresholds and rewards

### Models Layer
- `src/models/Building.ts` - Add `tier` property to BuildingType or create BuildingTier interface

### Core Layer
- `src/core/GameState.ts` - Add `buildingTier` to PlayerState, add milestone tracking

### Systems Layer
- `src/systems/ProductionSystem.ts` - Apply building tier multipliers to production calculations
- `src/systems/CombatSystem.ts` - Apply building tier multipliers to combat calculations
- `src/systems/PrestigeSystem.ts` - Check for milestone on prestige, trigger evolution

### Store Layer
- `src/stores/gameStore.ts` - Add `checkPrestigeMilestone()` action, add `buildingTier` state

### UI Layer
- `src/components/game/BuildingCard.tsx` - Display current building tier name and color
- `src/components/game/BuildingInfoModal.tsx` - Show tier progression and stats per tier
- `src/screens/GameScreen.tsx` - Show milestone celebration popup, display next milestone target

---

## Design / Approach

### Milestone Thresholds
Nine prestige milestones that feel achievable but spread across long-term play:

| Tier | Name Suffix | Prestige Required | Stat Multiplier |
|------|-------------|-------------------|-----------------|
| 0 | (base) | 0 | 1.0x |
| 1 | Mk II | 1 | 1.2x |
| 2 | Mk III | 3 | 1.5x |
| 3 | Advanced | 5 | 2.0x |
| 4 | Enhanced | 10 | 2.5x |
| 5 | Superior | 20 | 3.5x |
| 6 | Elite | 35 | 5.0x |
| 7 | Legendary | 50 | 7.5x |
| 8 | Transcendent | 75 | 10.0x |
| 9 | Ultimate | 100 | 15.0x |

### Building Tier Data Structure
Each building has 9 named variants with colors that progress from basic to prestigious:

```
Scrap Collector → Scrap Collector Mk II → Scrap Collector Mk III →
Advanced Scrap Harvester → Enhanced Scrap Harvester → Superior Scrap Excavator →
Elite Scrap Excavator → Legendary Scrap Extractor → Transcendent Scrap Core →
Ultimate Scrap Nexus
```

Colors progress from muted browns/grays to vibrant golds/purples to show advancement.

### State Management
PlayerState gains a `buildingTier: number` field (0-9) that persists permanently. This is separate from prestigeCount - once you reach tier 3, you stay at tier 3 even if you prestige more.

### Milestone Check Flow
1. Player triggers prestige
2. `resetForPrestige()` increments prestigeCount
3. `checkPrestigeMilestone()` compares prestigeCount to milestone thresholds
4. If a new threshold is crossed, increment `buildingTier`
5. Emit `MILESTONE_REACHED` event with tier info
6. GameScreen shows celebration popup

### Production Integration
ProductionSystem already applies various multipliers. Building tier becomes another multiplier:
- Base production × level bonus × builder count × prestige upgrades × wave bonus × **tier multiplier** × boosts

### Combat Integration
CombatSystem applies tier multiplier to:
- Auto-damage from Turret Bay
- Tap damage bonus from Training Ground
- Burst improvements from Weapons Lab

### UI Changes
**BuildingCard:**
- Name shows tier variant: "Scrap Collector Mk II"
- Card border/background uses tier color
- Small tier badge (e.g., "II", "III", "ADV")

**BuildingInfoModal:**
- Shows all 9 tiers for the building
- Current tier highlighted
- Next tier requirements shown
- Stats comparison between tiers

**GameScreen:**
- Near prestige button: "Next milestone: Prestige 5 more times"
- Celebration popup on milestone: "Buildings Evolved! All buildings are now Mk III!"

### Celebration Popup
A modal that appears after prestige when a milestone is reached:
- Large tier icon/badge
- "MILESTONE REACHED!" header
- "All buildings evolved to [Tier Name]"
- Stats comparison: "Production +50%!"
- Dismiss button

---

## Tests to Add/Update

### Unit Tests
- `tests/data/prestigeMilestones.test.ts` (NEW)
  - Test milestone threshold values are correct
  - Test tier multiplier values are correct
  - Test `getTierForPrestigeCount()` returns correct tier

- `tests/systems/PrestigeSystem.test.ts`
  - Test milestone check triggers on prestige
  - Test buildingTier increments at correct thresholds
  - Test buildingTier does not exceed max (9)
  - Test buildingTier persists through multiple prestiges

- `tests/systems/ProductionSystem.test.ts`
  - Test tier multiplier applies to production
  - Test tier multiplier stacks with other multipliers

- `tests/systems/CombatSystem.test.ts`
  - Test tier multiplier applies to auto-damage
  - Test tier multiplier applies to tap damage bonus

### Integration Tests
- Test full prestige flow triggers milestone when threshold crossed
- Test milestone popup appears after prestige
- Test building cards display correct tier names

### Manual Testing
- [ ] Prestige once and verify Mk II evolution
- [ ] Verify building names and colors update
- [ ] Verify production increases by expected amount
- [ ] Verify combat damage increases by expected amount
- [ ] Verify milestone popup appears with correct info
- [ ] Prestige multiple times and verify all thresholds work
- [ ] Verify tier persists after app restart
- [ ] Test on iOS and Android

---

## Risks & Rollback

### Risks
- **Balance disruption:** 15x multiplier at tier 9 may break game balance. Mitigation: Values are easily tunable in data file; late-game is already exponential.
- **Grind feels too long:** Prestige 100 may feel unachievable. Mitigation: Early tiers (1, 3, 5) provide quick wins; players don't need to reach 100.
- **Visual confusion:** Too many building name variants. Mitigation: Use consistent naming patterns; show tier badge for quick identification.
- **Save migration:** Existing saves lack `buildingTier`. Mitigation: Default to 0; calculate correct tier from existing prestigeCount on load.

### Rollback
- Feature is additive; removing tier multipliers reverts to base behavior
- `buildingTier` can be ignored in calculations if feature is disabled
- No breaking changes to existing state structure

---

## Evidence

- `src/data/buildings.ts:1-112` - Building definitions to extend with tiers
- `src/core/GameState.ts:37-49` - PlayerState to add buildingTier
- `src/systems/ProductionSystem.ts` - Production multiplier integration point
- `src/systems/CombatSystem.ts` - Combat multiplier integration point
- `src/stores/gameStore.ts:310-342` - `resetForPrestige()` to add milestone check
- `src/components/game/BuildingCard.tsx` - Building display to show tier
- `src/components/game/BuildingInfoModal.tsx` - Info modal to show tier progression

---

## Assumptions

- Players understand prestige count accumulates permanently
- Players are motivated by visible building name/color changes
- 9 tiers provide enough long-term goals without overwhelming
- Existing prestige upgrade system remains unchanged (blueprints still work the same)
- Building tier affects all buildings uniformly (no per-building evolution)

---

## Open Questions

1. Should tier names follow a consistent pattern (Mk II, Mk III...) or have unique names per building?
2. Should there be intermediate visual feedback as players approach a milestone?
3. Should the tier multiplier apply to blueprint-purchased upgrades as well, or just base production?
4. Should there be a "Building Evolution" tab in prestige panel showing all tier progressions?

---

## Tasks

1. [x] Create `src/data/prestigeMilestones.ts` with milestone thresholds and tier definitions
2. [x] Extend `src/data/buildings.ts` with tier name variants and colors for all 7 buildings × 9 tiers
3. [x] Add `buildingTier: number` to PlayerState in GameState.ts
4. [x] Create `getTierForPrestigeCount(count: number)` helper function
5. [x] Add `checkPrestigeMilestone()` action to gameStore
6. [x] Modify `resetForPrestige()` to call milestone check after incrementing prestigeCount
7. [x] Add `MILESTONE_REACHED` event to EventBus
8. [x] Modify ProductionSystem to apply tier multiplier to production calculations
9. [x] Modify CombatSystem to apply tier multiplier to combat calculations
10. [x] Update BuildingCard to display tier-specific name and color
11. [x] Update BuildingInfoModal to show tier progression and stats
12. [x] Create MilestonePopup component for celebration UI
13. [x] Add milestone popup trigger to GameScreen on prestige
14. [ ] Add "Next milestone" indicator near prestige button
15. [ ] Handle save migration for existing saves (default buildingTier to calculated value)
16. [x] Write unit tests for milestone thresholds and tier calculations
17. [ ] Write integration tests for prestige milestone flow
18. [ ] Manual testing across all 9 milestones on iOS and Android

---

## Implementation Complete: 2025-11-28
