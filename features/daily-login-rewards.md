# Feature Plan: Daily Login Rewards

**Created: 2025-11-28**

---

## Summary

Add a daily login rewards system that grants players escalating rewards for consecutive daily logins. Players receive scrap, blueprints, or bonus builders based on their current streak day. Streaks reset if a day is missed, creating FOMO that drives daily engagement.

**What problem does it solve?**
- Players have no incentive to open the app daily
- Retention drops after initial excitement wears off
- No habit-forming mechanic exists

**Why is this needed?**
- Daily login rewards are proven to increase DAU (daily active users)
- Creates a psychological commitment to maintain streaks
- Low-effort, high-impact retention mechanic

---

## Acceptance Criteria

- [ ] Player sees a daily reward popup on first app open each calendar day
- [ ] Rewards escalate over a 7-day cycle (day 7 is the best reward)
- [ ] Consecutive login streak is tracked and displayed
- [ ] Missing a day resets the streak to day 1
- [ ] Rewards are automatically claimed on popup dismiss
- [ ] Streak and last login date persist through app restarts
- [ ] Streak survives prestige resets
- [ ] Reward history is visible somewhere (optional: streak indicator in UI)

---

## Scope / Non-Goals

### In Scope
- 7-day reward cycle with escalating rewards
- Streak tracking with reset on missed day
- Popup modal showing today's reward and current streak
- Persistence of streak data in save file
- Integration with existing resource systems (scrap, blueprints, builders)

### Non-Goals
- Ad watching to double rewards (future enhancement)
- Monthly calendars with special milestone rewards
- Push notifications for streak reminders
- Social sharing of streaks
- Catch-up mechanics for missed days

---

## Files to Modify

### New Files

- `src/data/dailyRewards.ts` - Define the 7-day reward cycle with reward types and amounts for each day

- `src/systems/DailyRewardSystem.ts` - Handle streak logic: check if new day, calculate current streak day, determine if streak broken, return appropriate reward

- `src/components/game/DailyRewardModal.tsx` - Modal component showing the reward popup with current day, streak count, and claim button

### Modified Files

- `src/core/GameState.ts` - Add dailyRewards state to interface containing lastLoginDate, currentStreak, and totalDaysLoggedIn

- `src/stores/gameStore.ts` - Add actions for claiming daily reward, updating streak, and resetting streak

- `src/screens/GameScreen.tsx` - Check for daily reward on mount, show DailyRewardModal when reward available

- `src/services/SaveService.ts` - Include daily reward state in save/load serialization

---

## Design / Approach

### Reward Cycle Structure

The reward cycle repeats every 7 days with escalating value:

| Day | Reward Type | Amount | Rationale |
|-----|------------|--------|-----------|
| 1 | Scrap | 100 | Easy start |
| 2 | Scrap | 250 | Slight increase |
| 3 | Blueprints | 5 | Introduce premium currency |
| 4 | Scrap | 500 | Bigger scrap reward |
| 5 | Blueprints | 10 | More blueprints |
| 6 | Scrap | 1000 | Large scrap reward |
| 7 | Builders | 1 | Best reward - permanent |

After day 7, the cycle repeats from day 1 but the streak counter continues incrementing.

### Streak Logic

On app foreground or initial load:
1. Get current date (midnight-normalized to local timezone)
2. Compare to lastLoginDate in state
3. If same day: no reward, already claimed
4. If next consecutive day: increment streak, grant reward for (streak % 7) + 1
5. If more than 1 day gap: reset streak to 1, grant day 1 reward
6. Update lastLoginDate to today

### State Shape

```
dailyRewards: {
  lastLoginDate: string | null,  // ISO date string "2025-11-28"
  currentStreak: number,         // Current consecutive days
  totalDaysLoggedIn: number,     // Lifetime stat
  hasClaimedToday: boolean       // Prevents double claiming
}
```

### Modal UX

The modal appears automatically after app loads if a reward is available. Shows:
- "Day X Reward!" header
- The reward with icon and amount
- Current streak: "X days in a row!"
- "Claim" button that dismisses and grants reward
- Closing the modal also claims the reward (no way to skip)

### Integration Points

- Uses existing `addScrap()` and `addBlueprints()` store actions
- Uses existing `addBuilders()` for builder rewards
- Hooks into `useAppState` for foreground detection
- Saves with existing SaveService auto-save

---

## Tests to Add/Update

### Unit Tests - `tests/systems/DailyRewardSystem.test.ts`

- Returns day 1 reward for first-ever login
- Returns correct reward for each day 1-7 of cycle
- Increments streak when logging in on consecutive days
- Resets streak to 1 when a day is missed
- Handles timezone edge cases (login at 11:59pm then 12:01am)
- Correctly cycles rewards after day 7 (day 8 = day 1 rewards)
- Returns no reward if already claimed today
- Handles null lastLoginDate (new player)

### Integration Tests

- Daily reward state persists through save/load
- Daily reward state survives prestige reset
- Correct resources granted after claiming

### Manual Testing

- [ ] Fresh install shows day 1 reward on first open
- [ ] Closing and reopening same day shows no reward
- [ ] Opening next day shows day 2 reward with streak = 2
- [ ] Skipping a day shows day 1 reward with streak = 1
- [ ] Day 7 reward grants builder correctly
- [ ] Streak display shows correct count
- [ ] Modal cannot be dismissed without claiming

---

## Risks & Rollback

### Risks

**Risk: Timezone manipulation for extra rewards**
- Mitigation: Use server time if backend added later; for now, local time is acceptable for single-player
- Impact: Low - only affects their own progression

**Risk: Date parsing issues across locales**
- Mitigation: Use ISO date strings and consistent date normalization
- Mitigation: Thorough testing across different device locales

**Risk: Modal interrupts urgent gameplay**
- Mitigation: Show modal after game state loads, not during combat
- Mitigation: Keep modal dismissible with single tap

### Rollback

- Feature can be disabled by not showing modal (data still saved)
- Daily reward state is isolated and can be ignored if feature removed
- No impact on core game systems if disabled

---

## Evidence

- `src/core/GameState.ts:1-50` - Existing state structure to extend
- `src/stores/gameStore.ts:1-100` - Store pattern for new actions
- `src/services/SaveService.ts:1-80` - Save/load pattern to follow
- `src/screens/GameScreen.tsx:1-150` - Mount/lifecycle hooks location
- `src/components/game/PrestigePanel.tsx` - Modal pattern to follow

---

## Assumptions

- Calendar day is based on device local time (not UTC)
- Players cannot manipulate device time to exploit (accepted risk)
- Modal component can use existing Card/Button components
- No backend validation required for MVP
- Rewards should be meaningful but not game-breaking

---

## Open Questions

1. Should streak be displayed persistently in the UI (e.g., top bar)?
2. Should there be a "streak shield" IAP that prevents streak loss?
3. What exact reward amounts feel right for game balance?
4. Should day 7 reward always be a builder, or rotate special rewards?

---

## Tasks

1. Create daily rewards data file with 7-day reward cycle definition
2. Add daily reward state interface to GameState
3. Implement DailyRewardSystem with streak calculation logic
4. Add streak check and update methods
5. Add daily reward actions to Zustand store
6. Create DailyRewardModal component with reward display
7. Add modal trigger logic to GameScreen on mount
8. Update SaveService to persist daily reward state
9. Write unit tests for DailyRewardSystem
10. Write integration tests for save/load of streak data
11. Manual test full 7-day cycle simulation
12. Tune reward amounts based on game balance
