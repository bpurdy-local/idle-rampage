import React, {useEffect, useRef, useCallback} from 'react';
import {View, Text, StyleSheet, Pressable, GestureResponderEvent, TouchableOpacity} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {BuildingState} from '../../core/GameState';
import {BuildingType, SpecialEffectType} from '../../models/Building';
import {ProgressBar} from '../common/ProgressBar';
import {formatNumber} from '../../utils/formatters';
import {getTieredBuildingName, getTierColor} from '../../data/buildings';
import {
  calculateScrapFindCooldown,
  calculateBurstBoostChance,
  calculateCriticalWeaknessChance,
  calculateWaveExtendChance,
  calculateWeakPointDamageMultiplier,
  calculateShieldGeneratorBonus,
  SCRAP_FIND_BASE_REWARD_PERCENT,
  SCRAP_FIND_TIER_MULTIPLIERS,
  CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER,
} from '../../data/formulas';

interface BuildingCardProps {
  building: BuildingState;
  buildingType: BuildingType;
  production: number;
  upgradeCost: number;
  canAffordUpgrade: boolean;
  onAssignBuilder: () => void;
  onUnassignBuilder: () => void;
  onAssignAll: () => void;
  onFocus: () => void;
  onUpgrade: () => void;
  onEvolve: () => void;
  onShowInfo: () => void;
  availableBuilders: number;
  /** Total builders the player owns */
  totalBuilders: number;
  prestigeCount: number;
  evolutionTier: number;
  /** Level required to evolve to the next tier */
  nextEvolutionLevel?: number;
  /** Current building level for evolution progress display */
  currentBuildingLevel?: number;
  /** True if evolution is available (level requirement met) */
  canEvolve?: boolean;
  /** Cost to evolve to the next tier */
  evolutionCost?: number;
  /** True if player can afford evolution cost */
  canAffordEvolution?: boolean;
  /** If true, this building doesn't use workers (static effect building) */
  noWorkers?: boolean;
  /** The building's unique typeId for role-specific display */
  buildingTypeId?: string;
  /** Special effect type for this building (if any) */
  specialEffectType?: SpecialEffectType;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  buildingType,
  production,
  upgradeCost,
  canAffordUpgrade,
  onAssignBuilder,
  onUnassignBuilder,
  onAssignAll,
  onFocus,
  onUpgrade,
  onEvolve,
  onShowInfo,
  availableBuilders,
  totalBuilders,
  prestigeCount,
  evolutionTier,
  nextEvolutionLevel,
  currentBuildingLevel = 1,
  canEvolve = false,
  evolutionCost = 0,
  canAffordEvolution = true,
  noWorkers = false,
  buildingTypeId,
  specialEffectType,
}) => {
  const canAssign = !noWorkers && availableBuilders > 0 && building.assignedBuilders < buildingType.maxBuilders;
  const canUnassign = !noWorkers && building.assignedBuilders > 0;
  // All is available if there are unassigned workers to assign
  const canAssignAll = !noWorkers && availableBuilders > 0 && building.assignedBuilders < buildingType.maxBuilders;
  // Focus is available if building doesn't have all workers and there are workers somewhere
  const canFocus = !noWorkers && totalBuilders > 0 && building.assignedBuilders < buildingType.maxBuilders;

  // Get role-appropriate output label and formatted value
  const getOutputDisplay = (): {label: string; value: string} => {
    switch (buildingTypeId) {
      case 'scrap_works':
        return {label: 'Scrap', value: `${formatNumber(production)}/s`};
      case 'turret_station':
        return {label: 'Auto DPS', value: formatNumber(production)};
      case 'training_facility':
        // production is a decimal (e.g., 0.19), multiply by 100 for flat damage bonus
        return {label: 'Tap Bonus', value: `+${formatNumber(Math.floor(production * 100))}`};
      case 'weak_point_scanner': {
        // Show weak point damage multiplier instead of meaningless production value
        const wpMultiplier = calculateWeakPointDamageMultiplier(
          evolutionTier,
          building.level,
          building.assignedBuilders,
        );
        return {label: 'WP Damage', value: `${wpMultiplier.toFixed(1)}x`};
      }
      case 'command_center':
        // production is already the percentage (e.g., 0.15 for 15%)
        return {label: 'Boost', value: `+${Math.round(production * 100)}%`};
      case 'engineering_bay':
        // production is already the percentage (e.g., 0.10 for 10%)
        return {label: 'Discount', value: `-${Math.round(production * 100)}%`};
      case 'shield_generator': {
        // Use the actual shield generator formula (baseProduction is tier base bonus in seconds)
        const tierBaseBonus = buildingType.baseProduction;
        const shieldBonus = calculateShieldGeneratorBonus(tierBaseBonus, building.level, building.assignedBuilders);
        return {label: 'Timer Bonus', value: `+${shieldBonus.toFixed(1)}s`};
      }
      default:
        return {label: 'Output', value: `${formatNumber(production)}/s`};
    }
  };

  const outputDisplay = getOutputDisplay();

  const getSpecialEffectDisplay = (): {label: string; value: string} | null => {
    if (!specialEffectType) return null;

    const level = building.level;
    const workers = building.assignedBuilders;
    const tier = evolutionTier;

    switch (specialEffectType) {
      case 'scrap_find': {
        // Use centralized formulas from src/data/formulas/economy.ts
        const cooldownMs = calculateScrapFindCooldown(level, workers);
        const rewardPercent = SCRAP_FIND_BASE_REWARD_PERCENT * (SCRAP_FIND_TIER_MULTIPLIERS[tier - 1] ?? 1);
        return {
          label: 'Scrap Find',
          value: `${Math.round(rewardPercent * 100)}% every ${(cooldownMs / 1000).toFixed(0)}s`,
        };
      }
      case 'burst_boost': {
        // Use centralized formula from src/data/formulas/economy.ts
        const chance = calculateBurstBoostChance(level, workers, tier);
        return {
          label: 'Burst Boost',
          value: `+${(chance * 100).toFixed(1)}%`,
        };
      }
      case 'critical_weakness': {
        // Use centralized formula from src/data/formulas/economy.ts
        const chance = calculateCriticalWeaknessChance(level, workers, tier);
        return {
          label: 'Critical',
          value: `${(chance * 100).toFixed(0)}% for ${CRITICAL_WEAKNESS_DAMAGE_MULTIPLIER}x`,
        };
      }
      case 'wave_extend': {
        // Use centralized formula from src/data/formulas/economy.ts
        const chance = calculateWaveExtendChance(level, tier);
        return {
          label: 'Wave Ext.',
          value: `${(chance * 100).toFixed(0)}% chance`,
        };
      }
      default:
        return null;
    }
  };

  const specialEffectDisplay = getSpecialEffectDisplay();

  // Get tiered building name and color based on prestige
  const tieredName = getTieredBuildingName(buildingType.name, prestigeCount);
  const tierColor = getTierColor(prestigeCount);
  const hasTier = prestigeCount > 0;

  // Evolution progress info (now level-based)
  const hasNextEvolution = nextEvolutionLevel !== undefined;
  const levelsUntilEvolution = hasNextEvolution ? nextEvolutionLevel - currentBuildingLevel : 0;

  // Refs to track latest enabled states for hold-to-repeat
  const canAssignRef = useRef(canAssign);
  const canUnassignRef = useRef(canUnassign);
  const canAffordUpgradeRef = useRef(canAffordUpgrade);

  // Keep refs in sync with latest values
  useEffect(() => {
    canAssignRef.current = canAssign;
    canUnassignRef.current = canUnassign;
    canAffordUpgradeRef.current = canAffordUpgrade;
  });

  const cardOpacity = useSharedValue(0);
  const cardTranslateX = useSharedValue(-50);
  const hasAnimated = useRef(false);

  const minusBtnScale = useSharedValue(1);
  const plusBtnScale = useSharedValue(1);
  const allBtnScale = useSharedValue(1);
  const focusBtnScale = useSharedValue(1);
  const upgradeBtnScale = useSharedValue(1);

  // Hold-to-repeat state
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const HOLD_DELAY = 300; // ms before repeat starts
  const HOLD_INTERVAL = 80; // ms between repeats

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      cardOpacity.value = withTiming(1, {duration: 300, easing: Easing.out(Easing.quad)});
      cardTranslateX.value = withSpring(0, {damping: 15, stiffness: 100});
    }
  }, [cardOpacity, cardTranslateX]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{translateX: cardTranslateX.value}],
  }));

  const clearHoldTimers = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearHoldTimers();
  }, [clearHoldTimers]);

  // Clear hold timers when evolve state changes (prevents upgrade from firing when evolve button appears)
  useEffect(() => {
    clearHoldTimers();
  }, [canEvolve, clearHoldTimers]);

  const getRoleColor = () => {
    switch (buildingType.role) {
      case 'production':
        return '#4CAF50';
      case 'combat':
        return '#f44336';
      case 'utility':
        return '#2196F3';
      default:
        return '#888';
    }
  };

  const createHoldablePressHandler = (
    scale: Animated.SharedValue<number>,
    action: () => void,
    isEnabled: () => boolean,
  ) => ({
    onPressIn: (_e: GestureResponderEvent) => {
      if (isEnabled()) {
        scale.value = withSpring(0.9, {damping: 15, stiffness: 400});
        // Start hold-to-repeat after delay
        holdTimeoutRef.current = setTimeout(() => {
          holdIntervalRef.current = setInterval(() => {
            // Re-check if action is still enabled before each repeat
            if (isEnabled()) {
              action();
            } else {
              clearHoldTimers();
            }
          }, HOLD_INTERVAL);
        }, HOLD_DELAY);
      }
    },
    onPressOut: () => {
      scale.value = withSpring(1, {damping: 15, stiffness: 400});
      clearHoldTimers();
    },
    onPress: () => {
      if (isEnabled()) {
        scale.value = withSequence(
          withTiming(0.85, {duration: 50}),
          withSpring(1, {damping: 10, stiffness: 400}),
        );
        action();
      }
    },
  });

  const minusBtnStyle = useAnimatedStyle(() => ({
    transform: [{scale: minusBtnScale.value}],
  }));

  const plusBtnStyle = useAnimatedStyle(() => ({
    transform: [{scale: plusBtnScale.value}],
  }));

  const allBtnStyle = useAnimatedStyle(() => ({
    transform: [{scale: allBtnScale.value}],
  }));

  const focusBtnStyle = useAnimatedStyle(() => ({
    transform: [{scale: focusBtnScale.value}],
  }));

  const upgradeBtnStyle = useAnimatedStyle(() => ({
    transform: [{scale: upgradeBtnScale.value}],
  }));

  return (
    <Animated.View style={[styles.container, {borderLeftColor: getRoleColor()}, hasTier && {borderColor: tierColor}, cardAnimatedStyle]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={[styles.name, hasTier && {color: tierColor}]}>{tieredName}</Text>
            {evolutionTier > 1 && (
              <View style={[styles.evolutionBadge, {backgroundColor: buildingType.color}]}>
                <Text style={styles.evolutionBadgeText}>T{evolutionTier}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.infoBtn} onPress={onShowInfo}>
              <Text style={styles.infoBtnText}>?</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.level}>Lv.{building.level}</Text>
        </View>
        <Text style={styles.description}>{buildingType.description}</Text>
        {hasNextEvolution && !canEvolve && levelsUntilEvolution > 0 && (
          <Text style={styles.evolutionHint}>
            Evolves at Lv.{nextEvolutionLevel} ({levelsUntilEvolution} more)
          </Text>
        )}
        {canEvolve && (
          <Text style={styles.evolutionReady}>
            Ready to evolve!
          </Text>
        )}
      </View>

      <View style={styles.stats}>
        {noWorkers ? (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Type</Text>
            <Text style={styles.statValue}>Static Effect</Text>
          </View>
        ) : (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Builders</Text>
            <Text style={styles.statValue}>
              {building.assignedBuilders}/{buildingType.maxBuilders}
            </Text>
          </View>
        )}
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{outputDisplay.label}</Text>
          <Text style={styles.statValue}>{outputDisplay.value}</Text>
        </View>
        {specialEffectDisplay && (
          <View style={styles.stat}>
            <Text style={[styles.statLabel, styles.specialEffectLabel]}>{specialEffectDisplay.label}</Text>
            <Text style={[styles.statValue, styles.specialEffectValue]}>{specialEffectDisplay.value}</Text>
          </View>
        )}
      </View>

      {building.upgradeProgress > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Upgrading...</Text>
          <ProgressBar
            progress={building.upgradeProgress / 100}
            color="#ff9800"
            height={6}
          />
        </View>
      )}

      <View style={styles.actions}>
        {!noWorkers && (
          <View style={styles.builderActions}>
            <AnimatedPressable
              style={[styles.builderBtn, !canUnassign && styles.btnDisabled, minusBtnStyle]}
              {...createHoldablePressHandler(minusBtnScale, onUnassignBuilder, () => canUnassignRef.current)}>
              <Text style={styles.builderBtnText}>-</Text>
            </AnimatedPressable>
            <Text style={styles.builderCount}>👷 {building.assignedBuilders}</Text>
            <AnimatedPressable
              style={[styles.builderBtn, !canAssign && styles.btnDisabled, plusBtnStyle]}
              {...createHoldablePressHandler(plusBtnScale, onAssignBuilder, () => canAssignRef.current)}>
              <Text style={styles.builderBtnText}>+</Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.allBtn, !canAssignAll && styles.btnDisabled, allBtnStyle]}
              onPress={canAssignAll ? onAssignAll : undefined}>
              <Text style={styles.allBtnText}>ALL</Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.focusBtn, !canFocus && styles.btnDisabled, focusBtnStyle]}
              onPress={canFocus ? onFocus : undefined}>
              <Text style={styles.focusBtnText}>FOCUS</Text>
            </AnimatedPressable>
          </View>
        )}

        {canEvolve ? (
          <TouchableOpacity
            style={[styles.evolveBtn, !canAffordEvolution && styles.evolveBtnDisabled]}
            onPress={canAffordEvolution ? onEvolve : undefined}
            activeOpacity={0.7}>
            <Text style={styles.evolveBtnText}>
              Evolve ({formatNumber(evolutionCost)})
            </Text>
          </TouchableOpacity>
        ) : (
          <AnimatedPressable
            style={[styles.upgradeBtn, !canAffordUpgrade && styles.btnDisabled, noWorkers && styles.upgradeBtnWide, upgradeBtnStyle]}
            {...createHoldablePressHandler(upgradeBtnScale, onUpgrade, () => canAffordUpgradeRef.current)}>
            <Text style={styles.upgradeBtnText}>
              Upgrade ({formatNumber(upgradeCost)})
            </Text>
          </AnimatedPressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
  },
  evolutionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  evolutionBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  evolutionHint: {
    color: '#ffd700',
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
  evolutionReady: {
    color: '#00ff00',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  level: {
    color: '#ff9800',
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
    backgroundColor: '#0f0f1a',
    borderRadius: 6,
    padding: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 10,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  specialEffectLabel: {
    color: '#FFD700',
  },
  specialEffectValue: {
    color: '#FFD700',
    fontSize: 11,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressLabel: {
    color: '#ff9800',
    fontSize: 10,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  builderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  builderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allBtn: {
    paddingHorizontal: 6,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  focusBtn: {
    paddingHorizontal: 6,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  btnDisabled: {
    backgroundColor: '#333',
  },
  builderBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  allBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  focusBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  builderCount: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 8,
  },
  upgradeBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  upgradeBtnWide: {
    flex: 1,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  evolveBtn: {
    backgroundColor: '#9C27B0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  evolveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  evolveBtnDisabled: {
    backgroundColor: '#4a235a',
    borderColor: '#666',
  },
});
