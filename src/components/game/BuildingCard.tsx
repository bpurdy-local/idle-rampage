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
import {BuildingType} from '../../models/Building';
import {ProgressBar} from '../common/ProgressBar';
import {formatNumber} from '../../utils/formatters';
import {getTieredBuildingName, getTierColor} from '../../data/buildings';

interface BuildingCardProps {
  building: BuildingState;
  buildingType: BuildingType;
  production: number;
  upgradeCost: number;
  canAffordUpgrade: boolean;
  onAssignBuilder: () => void;
  onUnassignBuilder: () => void;
  onUpgrade: () => void;
  onShowInfo: () => void;
  availableBuilders: number;
  prestigeCount: number;
  currentWave: number;
  evolutionTier: number;
  nextEvolutionWave?: number;
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
  onUpgrade,
  onShowInfo,
  availableBuilders,
  prestigeCount,
  currentWave,
  evolutionTier,
  nextEvolutionWave,
}) => {
  const canAssign = availableBuilders > 0 && building.assignedBuilders < buildingType.maxBuilders;
  const canUnassign = building.assignedBuilders > 0;

  // Get tiered building name and color based on prestige
  const tieredName = getTieredBuildingName(buildingType.name, prestigeCount);
  const tierColor = getTierColor(prestigeCount);
  const hasTier = prestigeCount > 0;

  // Evolution progress info
  const hasNextEvolution = nextEvolutionWave !== undefined;
  const wavesUntilEvolution = hasNextEvolution ? nextEvolutionWave - currentWave : 0;

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
        {hasNextEvolution && wavesUntilEvolution > 0 && (
          <Text style={styles.evolutionHint}>
            Evolves in {wavesUntilEvolution} wave{wavesUntilEvolution !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Builders</Text>
          <Text style={styles.statValue}>
            {building.assignedBuilders}/{buildingType.maxBuilders}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Output</Text>
          <Text style={styles.statValue}>{formatNumber(production)}/s</Text>
        </View>
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
        </View>

        <AnimatedPressable
          style={[styles.upgradeBtn, !canAffordUpgrade && styles.btnDisabled, upgradeBtnStyle]}
          {...createHoldablePressHandler(upgradeBtnScale, onUpgrade, () => canAffordUpgradeRef.current)}>
          <Text style={styles.upgradeBtnText}>
            Upgrade ({formatNumber(upgradeCost)})
          </Text>
        </AnimatedPressable>
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
  btnDisabled: {
    backgroundColor: '#333',
  },
  builderBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  builderCount: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 12,
  },
  upgradeBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
