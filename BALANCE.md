# Idle Rampage Balance Configuration

This document outlines all balance values and formulas used in the game. Reference this when tuning gameplay.

**Last Updated**: 2024

**Design Goals**:
- First prestige takes ~2 hours of active play
- 50 workers + max prestige + max level = ~80-90% special effect trigger chance
- Workers are the primary scaling factor for special effects
- No multiplicative stacking explosion for damage
- Critical hit and burst don't stack multiplicatively (use higher)

---

## 1. Prestige System

### Prestige Unlock
| Setting | Value |
|---------|-------|
| Unlock wave | 40 |
| Base blueprints at unlock | 20 |
| Blueprints per wave above base | 3 |
| Blueprint wave scaling | 1.06x |

### Blueprint Earnings by Wave
| Wave | Blueprints |
|------|------------|
| 40 | 20 |
| 50 | 55 |
| 75 | 175 |
| 100 | 420 |
| 150 | 1,400 |

### Prestige Milestones
| Tier | Name | Prestiges Required | Multiplier |
|------|------|-------------------|------------|
| 0 | Base | 0 | 1.0x |
| 1 | Mk II | 1 | 1.3x |
| 2 | Mk III | 3 | 1.7x |
| 3 | Advanced | 5 | 2.2x |
| 4 | Enhanced | 8 | 3.0x |
| 5 | Superior | 12 | 4.0x |
| 6 | Elite | 18 | 5.5x |
| 7 | Legendary | 25 | 7.5x |
| 8 | Transcendent | 40 | 10.0x |
| 9 | Ultimate | 60 | 15.0x |

---

## 2. Builder Costs (Blueprint Currency)

| Builder Range | Cost Each |
|---------------|-----------|
| 1-10 | 8 |
| 11-25 | 15 |
| 26-50 | 30 |
| 51-100 | 60 |
| 101-150 | 100 |
| 151-200 | 175 |
| 201-250 | 300 |

**Total for 250 builders**: ~52,000 blueprints

---

## 3. Prestige Upgrades

### Existing Upgrades (Rebalanced)
| Upgrade | Base Cost | Cost Mult | Max Level | Effect/Level | Max Effect |
|---------|-----------|-----------|-----------|--------------|------------|
| Production Boost | 3 | 1.22x | 20 | +12% | 3.4x |
| Tap Power | 3 | 1.22x | 20 | +15% | 4.0x |
| Auto Damage | 4 | 1.25x | 20 | +12% | 3.4x |
| Wave Rewards | 5 | 1.28x | 15 | +10% | 2.5x |
| Burst Chance | 6 | 1.30x | 12 | +1.5% | +18% |
| Burst Damage | 6 | 1.30x | 12 | +0.8x | 14.6x |
| Head Start | 8 | 1.35x | 10 | +100 scrap/wave | 1000/wave |

### New Upgrades
| Upgrade | Base Cost | Cost Mult | Max Level | Effect/Level | Max Effect |
|---------|-----------|-----------|-----------|--------------|------------|
| Critical Eye | 6 | 1.30x | 12 | +1% crit chance | +12% |
| Time Dilation | 6 | 1.30x | 12 | +0.6% wave extend | +7.2% |
| Scrap Magnetism | 5 | 1.25x | 12 | +8% scrap find | +96% (1.96x) |

---

## 4. Enemy Scaling

### Enemy Tiers
| Tier | Name | Waves | Base HP | HP/Wave | Base Reward | Reward/Wave |
|------|------|-------|---------|---------|-------------|-------------|
| 1 | Scrap Bot | 1-12 | 80 | 1.28x | 12 | 1.12x |
| 2 | Drone | 13-30 | 400 | 1.24x | 40 | 1.10x |
| 3 | Loader | 31-55 | 2,000 | 1.20x | 150 | 1.08x |
| 4 | Mech | 56-80 | 15,000 | 1.17x | 600 | 1.06x |
| 5 | AI Unit | 81+ | 100,000 | 1.14x | 3,000 | 1.05x |

### Sample HP at Key Waves
| Wave | Approx HP |
|------|-----------|
| 12 | 650 |
| 30 | 4,500 |
| 40 | 11,000 |
| 55 | 28,000 |
| 80 | 180,000 |
| 100 | 600,000 |

### Boss Configuration
| Setting | Value |
|---------|-------|
| Boss interval | Every 10 waves |
| Boss HP multiplier | 2.0x |
| Boss reward multiplier | 4.0x |
| Boss timer multiplier | 1.8x |

---

## 5. Building Configuration

### Cost Multipliers (per level)
| Building | Cost Multiplier |
|----------|-----------------|
| Scrap Works | 1.12x |
| Weak Point Scanner | 1.14x |
| Training Facility | 1.14x |
| Command Center | 1.18x |
| Engineering Bay | 1.15x |
| Shield Generator | 1.16x |

### Building Unlock Waves
| Building | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|----------|--------|--------|--------|--------|--------|
| Scrap Works | 1 | 8 | 24 | 48 | 78 |
| Training Facility | 3 | 16 | 36 | 62 | 88 |
| Weak Point Scanner | 5 | 12 | 32 | 56 | 84 |
| Engineering Bay | 10 | 28 | 52 | 74 | 98 |
| Shield Generator | 15 | 40 | 64 | 90 | — |
| Command Center | 20 | 44 | 68 | 94 | — |

### Max Builders per Building
| Building | Max Builders |
|----------|--------------|
| Scrap Works | 50 |
| Training Facility | 50 |
| Weak Point Scanner | 50 |
| Shield Generator | 50 |
| Command Center | 20 |
| Engineering Bay | 15 |

---

## 6. Production Scaling

### Level Multiplier
```
Formula: 1.04^(level-1) with soft cap at level 50
```

| Level | Multiplier |
|-------|------------|
| 1 | 1.0x |
| 10 | 1.48x |
| 25 | 2.56x |
| 50 | 7.1x |
| 75 | ~10x |
| 100 | ~12x |

### Level Milestones
| Level | Production Bonus |
|-------|------------------|
| 25 | +20% |
| 50 | +40% |
| 75 | +60% |
| 100 | +80% |

### Worker Efficiency
```
Decay rate: 0.08
Formula: 1 / (1 + (position - 1) * 0.08)
```

| Worker Position | Efficiency |
|-----------------|------------|
| 1 | 100% |
| 5 | 76% |
| 10 | 58% |
| 20 | 40% |
| 50 | 20% |

### Worker Milestones
| Threshold | Bonus |
|-----------|-------|
| 5 workers | +15% |
| 10 workers | +30% |
| 20 workers | +50% |

### Wave Production Bonus
```
Formula: 1 + log10(wave + 1) * 0.6 + wave * 0.025 + milestones
```

| Wave | Milestone Bonus |
|------|-----------------|
| 15 | +15% |
| 25 | +25% |
| 40 | +40% |
| 50 | +50% |
| 75 | +75% |
| 100 | +100% |

---

## 7. Combat System

### Base Tap Damage
| Setting | Value |
|---------|-------|
| Base tap damage | 8 |
| Tap variance | 90%-110% |
| Tap cooldown | 150ms |

### Training Facility Effect
Training Facility provides a **percentage bonus** to tap damage, not flat damage.

| Tier | Base % Bonus |
|------|--------------|
| 1 | 3% |
| 2 | 8% |
| 3 | 15% |
| 4 | 25% |
| 5 | 40% |

**Max training bonus**: +300% (4x tap damage) at L50, 50W, T5

### Burst Attack
| Setting | Value |
|---------|-------|
| Base burst chance | 5% |
| Base burst multiplier | 6x |
| Max burst chance | 50% |
| Max burst multiplier | 20x |

### Critical Weakness (Weak Point)
| Setting | Value |
|---------|-------|
| Base damage multiplier | 1.5x |
| Max damage multiplier | 4.0x |
| Per tier bonus | +0.4x |
| Per level bonus | +0.015x |
| Per worker bonus | +0.02x |

**Important**: Critical and Burst do NOT stack multiplicatively. Use the higher multiplier.

### Max Damage Calculation
```
Base: 8
Training (+300%): 8 × 4 = 32
Prestige Tap (4x): 32 × 4 = 128
Tier Multiplier (15x): 128 × 15 = 1,920
Burst (20x) OR Weak Point (4x): 1,920 × 20 = 38,400
Variance: 38,400 × 1.1 = ~42,000

Max tap damage: ~42,000
```

---

## 8. Special Effects

### Burst Boost (Training Facility)
| Setting | Value |
|---------|-------|
| Base chance | 3% |
| Per level | +0.2% |
| Per worker | +0.5% |
| Per tier | +2% |
| Max cap | 50% |

**At max (L50, 50W, T5)**: 48.8%
**With prestige (+18%)**: Capped at 50%

### Critical Weakness (Weak Point Scanner)
| Setting | Value |
|---------|-------|
| Base chance | 5% |
| Per level | +0.3% |
| Per worker | +0.8% |
| Per tier | +3% |
| Max cap | 85% |

**At max (L50, 50W, T5)**: 71.7%
**With prestige (+12%)**: 83.7%

### Wave Extend (Shield Generator)
| Setting | Value |
|---------|-------|
| Base chance | 6% |
| Per level | +0.3% |
| Per worker | +0.6% |
| Per tier | +3% |
| Max cap | 75% |

**At max (L50, 50W, T4)**: 60.7%
**With prestige (+7.2%)**: 67.9%

### Scrap Find (Scrap Works)
| Setting | Value |
|---------|-------|
| Base cooldown | 25s |
| Per level reduction | -0.2s |
| Per worker reduction | -0.3s |
| Min cooldown | 8s |
| Base reward | 20% of wave reward |

**At max (L50, 50W)**: 8s cooldown
**With Scrap Magnetism (1.96x)**: Effective ~4s

---

## 9. Command Center

| Setting | Value |
|---------|-------|
| Max builders | 20 |
| Base boost (Tier 1) | 10% |
| Base boost (Tier 4) | 35% |
| Per level bonus | +1% |
| Per worker bonus | +1% |
| Max boost cap | 80% |

---

## 10. Engineering Bay

| Setting | Value |
|---------|-------|
| Max builders | 15 |
| Base discount (Tier 1) | 8% |
| Base discount (Tier 5) | 30% |
| Per level bonus | +0.8% |
| Per worker bonus | +0.8% |
| Max discount cap | 50% |

---

## 11. Wave Timing

| Setting | Value |
|---------|-------|
| Base wave timer | 22s |
| Timer growth per wave | +0.2s |
| Max wave timer | 60s |
| Boss timer multiplier | 1.8x |

---

## 12. Initial Game State

| Setting | Value |
|---------|-------|
| Starting scrap | 50 |
| Base tap damage | 8 |
| Auto damage per tick | 0.5 |
| Burst chance | 5% |
| Burst multiplier | 6x |
| Starting builders | 5 |
| Max purchasable builders | 250 |
| Wave timer max | 22s |

---

## 13. Offline Production

| Setting | Value |
|---------|-------|
| Offline efficiency | 50% |
| Max offline hours | 8 |

---

## 14. Evolution Behavior

When a building evolves to a new tier:
- **Level is preserved** (not reset to 1)
- New tier's base production applies
- This rewards continued investment

---

## 15. Blueprint Economy Summary

| Category | Total Cost |
|----------|------------|
| All builders (250) | ~52,000 BP |
| All existing upgrades | ~8,500 BP |
| All new upgrades | ~2,500 BP |
| **Grand Total** | **~63,000 BP** |

---

## Tuning Notes

### If first prestige is too fast:
- Increase enemy HP scaling (e.g., 1.28x → 1.32x for Scrap Bot)
- Reduce base wave timer (22s → 18s)
- Increase prestige wave requirement (40 → 50)

### If first prestige is too slow:
- Decrease enemy HP scaling
- Increase base wave timer
- Lower prestige wave requirement

### If late game is too easy:
- Increase AI Unit HP scaling
- Reduce max prestige tier multiplier
- Lower max special effect caps

### If workers feel weak:
- Increase per-worker bonuses for special effects
- Decrease worker efficiency decay rate
- Increase worker milestone bonuses

### If tapping feels weak:
- Increase base tap damage
- Increase training facility % bonus
- Increase prestige tap power effect

### If tapping is OP:
- Reduce training facility % bonus caps
- Lower burst/critical multipliers
- Ensure burst and critical don't stack
