# Feature Plan: Offline Earnings Popup

**Created: 2025-11-28**

---

## Summary

Display a "Welcome Back" modal when players return after being away, showing the scrap earned while offline. The modal features an animated counter that rolls up to the final amount, making the reward feel substantial and satisfying.

**What problem does it solve?**
- Players don't realize they earned resources while away
- Returning to the app feels unrewarding
- Offline production feature is invisible to players
- No celebration of progress made while away

**Why is this needed?**
- Makes returning to the game feel rewarding
- Reinforces the value of idle mechanics
- Creates positive emotional response on app open
- Standard feature in idle games that players expect

---

## Acceptance Criteria

- [ ] Modal appears when returning after 60+ seconds away
- [ ] Shows "Welcome Back!" header with time away duration
- [ ] Displays animated counter rolling up to offline earnings
- [ ] Shows breakdown: time away, production rate, total earned
- [ ] "Collect" button dismisses modal and confirms earnings
- [ ] Earnings are already applied to balance (modal is informational)
- [ ] Modal only shows if earnings are greater than 0
- [ ] Works correctly after app kill and cold start
- [ ] Respects existing offline caps (8hr max, 50% efficiency)

---

## Scope / Non-Goals

### In Scope
- Welcome back modal with earnings display
- Animated number counter effect
- Time away formatted nicely (2h 30m, etc.)
- Production rate display for context
- Single "Collect" button to dismiss
- Integration with existing offline calculation in SaveService

### Non-Goals
- "Watch ad to double earnings" functionality
- Multiple reward collection options
- Offline earnings multiplier purchases
- Push notifications about offline earnings
- Social sharing of offline progress
- Detailed breakdown by building

---

## Files to Modify

### New Files

- `src/components/game/OfflineEarningsModal.tsx` - Modal component showing welcome back message, animated earnings counter, and collect button

- `src/hooks/useAnimatedCounter.ts` - Hook for animating number from 0 to target value over duration

### Modified Files

- `src/screens/GameScreen.tsx` - Add state for showing offline modal, trigger on load when offline earnings exist

- `src/services/SaveService.ts` - Return offline earnings amount from load() method for display (may already calculate this)

- `src/stores/gameStore.ts` - Add action to mark offline earnings as acknowledged

---

## Design / Approach

### Trigger Conditions

The modal shows when ALL of these are true:
1. App is loading from a saved state (not fresh install)
2. Time since last save > 60 seconds
3. Offline earnings amount > 0
4. User hasn't already seen this modal for this session

### Data Flow

1. SaveService.load() calculates offline time and earnings
2. Returns `{ state, offlineEarnings, offlineTime }`
3. GameScreen receives this on mount
4. If offlineEarnings > 0, show OfflineEarningsModal
5. Earnings already applied to state by SaveService
6. Modal is purely informational/celebratory

### Modal Content Layout

```
┌─────────────────────────────────┐
│         Welcome Back!           │
│                                 │
│    You were away for 2h 35m     │
│                                 │
│    ┌─────────────────────┐      │
│    │   ⚙️ 12,450          │      │
│    │      SCRAP           │      │
│    └─────────────────────┘      │
│                                 │
│    Production: 82/sec           │
│    Efficiency: 50% (offline)    │
│                                 │
│        [ Collect ]              │
└─────────────────────────────────┘
```

### Animated Counter

The scrap amount animates from 0 to final value:
- Duration: 1.5-2 seconds
- Easing: ease-out (fast start, slow end)
- Updates ~30 times per second for smooth appearance
- Final value snaps to exact amount
- Uses formatNumber for large values (shows 12.4K, 1.2M, etc.)

### Time Formatting

Format offline duration human-readably:
- Under 1 hour: "45 minutes"
- 1-24 hours: "2h 35m"
- Over 24 hours: "1d 4h"
- Cap display at "8 hours (max)" since that's the earning cap

### Integration with Existing System

SaveService already calculates offline production:
- Caps at 8 hours
- Applies 50% efficiency multiplier
- Considers current production rate at save time

The modal just needs to receive and display this calculated amount.

---

## Tests to Add/Update

### Unit Tests - `tests/components/OfflineEarningsModal.test.tsx`

- Renders correct scrap amount
- Renders correct time away format
- Calls onCollect when button pressed
- Formats large numbers correctly
- Shows production rate

### Unit Tests - `tests/hooks/useAnimatedCounter.test.ts`

- Animates from 0 to target value
- Completes in specified duration
- Calls onComplete when finished
- Handles 0 target (no animation needed)

### Integration Tests

- Modal appears after simulated 1 hour away
- Modal does not appear if away less than 60 seconds
- Modal does not appear on fresh install
- Correct earnings calculated with production bonuses

### Manual Testing

- [ ] Kill app, wait 5 minutes, reopen - see modal
- [ ] Modal shows reasonable earnings for time away
- [ ] Counter animation looks smooth
- [ ] Collect button dismisses modal
- [ ] Modal doesn't reappear after dismiss
- [ ] Time format is human-readable
- [ ] Large earnings formatted correctly (K, M, B)

---

## Risks & Rollback

### Risks

**Risk: Modal appears with incorrect earnings**
- Mitigation: Earnings calculated by existing SaveService logic
- Mitigation: Display matches actual applied earnings

**Risk: Counter animation causes performance issues**
- Mitigation: Use requestAnimationFrame for smooth updates
- Mitigation: Cap update frequency at 30fps
- Fallback: Show static number if animation problematic

**Risk: Modal blocks time-sensitive gameplay**
- Mitigation: Modal appears before combat resumes
- Mitigation: Single tap dismisses immediately

**Risk: Confusion about whether earnings are extra or already applied**
- Mitigation: Clear copy: "collected while away"
- Mitigation: Balance already reflects earnings before modal

### Rollback

- Modal can be disabled without affecting core functionality
- Offline earnings calculation continues to work
- No game state changes required to remove feature
- Pure UI enhancement with no data dependencies

---

## Evidence

- `src/services/SaveService.ts:load()` - Existing offline time detection
- `src/systems/ProductionSystem.ts:calculateOfflineProduction` - Offline earning calculation
- `src/components/game/PrestigePanel.tsx` - Modal pattern reference
- `src/utils/formatters.ts` - Number and time formatting utilities
- `src/hooks/useAppState.ts` - App lifecycle handling

---

## Assumptions

- SaveService.load() can be modified to return offline earnings amount
- Offline earnings are applied to state before modal shows
- Modal component can use existing Card/Button components
- Animation performance is acceptable with basic JS animation
- Player always wants to see offline earnings (no skip preference)

---

## Open Questions

1. Should very small earnings (< 10 scrap) skip the modal?
2. Should the modal show a breakdown by building type?
3. What's the ideal counter animation duration?
4. Should there be a sound effect when counter finishes?

---

## Tasks

1. Modify SaveService.load() to return offline earnings amount alongside state
2. Create useAnimatedCounter hook with configurable duration
3. Create OfflineEarningsModal component layout
4. Implement animated counter display for scrap amount
5. Format time away duration for display
6. Add production rate context display
7. Implement Collect button with dismiss callback
8. Add modal trigger logic to GameScreen
9. Add state to track if modal has been shown this session
10. Test with various offline durations
11. Tune animation timing for satisfying feel
12. Ensure modal respects offline caps in display
