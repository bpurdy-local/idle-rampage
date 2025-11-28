# Feature Plan: Damage Popups

**Created: 2025-11-28**

---

## Summary

Add floating damage numbers that appear when damage is dealt to enemies. Numbers animate upward and fade out, providing satisfying visual feedback for player actions. Burst attacks display larger, differently colored numbers to emphasize their impact.

**What problem does it solve?**
- Tapping feels unrewarding without visual feedback
- Players can't see how much damage they're dealing
- Burst attacks don't feel special or impactful
- Combat lacks "juice" and visceral satisfaction

**Why is this needed?**
- Visual feedback is core to satisfying game feel
- Damage numbers are expected in combat games
- Helps players understand combat effectiveness
- Makes burst attacks feel exciting and rewarding

---

## Acceptance Criteria

- [ ] Damage numbers appear at tap location when tap damage is dealt
- [ ] Auto-damage shows periodic damage numbers near enemy
- [ ] Numbers animate upward with slight horizontal variance
- [ ] Numbers fade out over ~0.5-1 second duration
- [ ] Burst attack numbers are larger and use a distinct color (gold/yellow)
- [ ] Regular damage numbers use white/standard color
- [ ] Multiple damage numbers can display simultaneously
- [ ] Performance remains smooth (60fps) with many popups
- [ ] Numbers use formatted display (1.2K, 3.5M, etc.)

---

## Scope / Non-Goals

### In Scope
- Floating damage text on tap damage
- Floating damage text on auto-damage ticks
- Visual distinction for burst attacks (size, color)
- Smooth fade-up animation using react-native-reanimated
- Number formatting using existing formatNumber utility
- Configurable animation duration and style

### Non-Goals
- Damage number aggregation/combining
- Critical hit indicators beyond burst
- Healing numbers (no healing mechanic exists)
- Damage type indicators (fire, ice, etc.)
- Combo multiplier displays
- Screen shake or other impact effects

---

## Files to Modify

### New Files

- `src/components/game/DamagePopup.tsx` - Single animated damage number component with Reanimated animations

- `src/components/game/DamagePopupManager.tsx` - Container managing multiple active popups, handles spawning and cleanup

- `src/hooks/useDamagePopups.ts` - Hook providing spawn function and managing popup state array

### Modified Files

- `src/screens/GameScreen.tsx` - Integrate DamagePopupManager, pass spawn function to tap handler and combat tick

- `src/systems/CombatSystem.ts` - Return damage amount and burst status from damage methods for popup display

- `src/core/EventBus.ts` - Ensure ENEMY_DAMAGED event includes damage amount and isBurst flag (may already exist)

---

## Design / Approach

### Popup Data Structure

Each popup instance contains:
```
{
  id: string,           // Unique ID for React key
  damage: number,       // Damage amount to display
  isBurst: boolean,     // Whether this was a burst attack
  x: number,            // Starting X position
  y: number,            // Starting Y position
  timestamp: number     // Creation time for cleanup
}
```

### Animation Behavior

Using react-native-reanimated for smooth 60fps animations:

1. **Entry**: Popup spawns at (x, y) with scale 0, immediately animates to scale 1
2. **Movement**: Translates upward by 50-80 pixels over duration
3. **Horizontal drift**: Random offset of -20 to +20 pixels for variety
4. **Fade**: Opacity animates from 1 to 0
5. **Exit**: Component removed from array after animation completes

Duration: ~800ms total (configurable)

### Visual Styling

**Regular Damage:**
- Color: White with subtle shadow
- Font size: 18-24pt
- Weight: Bold

**Burst Damage:**
- Color: Gold/Yellow (#FFD700) with glow effect
- Font size: 28-36pt (1.5x larger)
- Weight: Extra bold
- Optional: "BURST!" text above number

### Spawn Triggers

1. **Tap Damage**: On `TAP_REGISTERED` event, spawn popup at tap coordinates
2. **Auto Damage**: On periodic auto-damage tick, spawn popup near enemy center with slight randomization
3. **Burst Attack**: Same triggers but with `isBurst: true`

### Performance Considerations

- Maximum popup limit (e.g., 20 active at once)
- Old popups removed when limit exceeded
- Use `useSharedValue` and `useAnimatedStyle` for native thread animations
- Avoid re-renders of parent components when popups update

### Manager Architecture

DamagePopupManager maintains array of active popups:
1. Receives spawn requests via exposed function
2. Adds popup to state array with unique ID
3. Each DamagePopup handles its own animation
4. Popup calls onComplete callback when animation finishes
5. Manager removes completed popup from array

---

## Tests to Add/Update

### Unit Tests - `tests/components/DamagePopup.test.tsx`

- Renders damage number correctly formatted
- Applies burst styling when isBurst is true
- Calls onComplete after animation duration
- Formats large numbers correctly (1000 -> 1K)

### Unit Tests - `tests/hooks/useDamagePopups.test.ts`

- spawn() adds popup to array
- Popups are removed after completion
- Maximum popup limit is enforced
- Each popup gets unique ID

### Integration Tests

- Tap on enemy spawns damage popup
- Auto-damage tick spawns popup
- Burst attack spawns burst-styled popup
- Multiple rapid taps create multiple popups

### Manual Testing

- [ ] Tap shows damage number at tap location
- [ ] Number floats up and fades smoothly
- [ ] Burst attacks show larger gold numbers
- [ ] Rapid tapping doesn't cause lag or dropped frames
- [ ] Numbers display correctly on different screen sizes
- [ ] Auto-damage popups appear during combat

---

## Risks & Rollback

### Risks

**Risk: Performance degradation with many popups**
- Mitigation: Cap maximum active popups at 20
- Mitigation: Use native driver animations via Reanimated
- Mitigation: Remove popups immediately after animation completes

**Risk: Popups obscure important UI elements**
- Mitigation: Popups animate upward and away from enemy
- Mitigation: Short duration prevents buildup
- Mitigation: Semi-transparent to allow seeing through

**Risk: Animation jank on lower-end devices**
- Mitigation: Test on minimum spec devices
- Mitigation: Reduce animation complexity if needed
- Fallback: Disable popups via config flag

### Rollback

- Feature is purely visual, no game logic dependencies
- Can be disabled by not rendering DamagePopupManager
- No save data or state to clean up
- Core combat system unchanged

---

## Evidence

- `src/components/game/EnemyDisplay.tsx` - Location for popup positioning reference
- `src/core/EventBus.ts:GameEvents` - Event names for damage triggers
- `src/systems/CombatSystem.ts:applyDamage` - Damage application with isBurst flag
- `src/utils/formatters.ts:formatNumber` - Number formatting utility
- `src/screens/GameScreen.tsx` - Tap handler integration point

---

## Assumptions

- react-native-reanimated is already configured (confirmed in project)
- Tap coordinates are available from touch event
- EventBus provides damage amount in ENEMY_DAMAGED payload
- Performance target of 60fps is achievable with Reanimated
- Popup positioning can use absolute positioning within game screen

---

## Open Questions

1. Should auto-damage popups be smaller/less prominent than tap damage?
2. Should there be a toggle to disable damage popups in settings?
3. What's the ideal animation duration (500ms, 800ms, 1000ms)?
4. Should burst attacks have additional effects (particles, shake)?

---

## Tasks

1. Create DamagePopup component with Reanimated animations
2. Implement fade-up animation with horizontal drift
3. Add burst styling variant (larger size, gold color)
4. Create useDamagePopups hook for state management
5. Implement popup spawning with unique IDs
6. Add popup cleanup on animation complete
7. Implement maximum popup limit
8. Create DamagePopupManager container component
9. Integrate manager into GameScreen
10. Connect tap handler to spawn popups at tap location
11. Connect auto-damage tick to spawn popups
12. Add burst detection for styling
13. Test performance with rapid tapping
14. Tune animation timing and styling
