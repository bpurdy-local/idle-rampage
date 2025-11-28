import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
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

interface BuildingCardProps {
  building: BuildingState;
  buildingType: BuildingType;
  production: number;
  upgradeCost: number;
  canAffordUpgrade: boolean;
  onAssignBuilder: () => void;
  onUnassignBuilder: () => void;
  onUpgrade: () => void;
  availableBuilders: number;
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
  availableBuilders,
}) => {
  const canAssign = availableBuilders > 0 && building.assignedBuilders < buildingType.maxBuilders;
  const canUnassign = building.assignedBuilders > 0;

  const cardOpacity = useSharedValue(0);
  const cardTranslateX = useSharedValue(-50);
  const hasAnimated = useRef(false);

  const minusBtnScale = useSharedValue(1);
  const plusBtnScale = useSharedValue(1);
  const upgradeBtnScale = useSharedValue(1);

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

  const getRoleColor = () => {
    switch (buildingType.role) {
      case 'production':
        return '#4CAF50';
      case 'combat':
        return '#f44336';
      case 'research':
        return '#9c27b0';
      case 'utility':
        return '#2196F3';
      default:
        return '#888';
    }
  };

  const createPressHandler = (
    scale: Animated.SharedValue<number>,
    action: () => void,
    enabled: boolean,
  ) => ({
    onPressIn: () => {
      if (enabled) {
        scale.value = withSpring(0.9, {damping: 15, stiffness: 400});
      }
    },
    onPressOut: () => {
      scale.value = withSpring(1, {damping: 15, stiffness: 400});
    },
    onPress: () => {
      if (enabled) {
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
    <Animated.View style={[styles.container, {borderLeftColor: getRoleColor()}, cardAnimatedStyle]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{buildingType.name}</Text>
          <Text style={styles.level}>Lv.{building.level}</Text>
        </View>
        <Text style={styles.description}>{buildingType.description}</Text>
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
            {...createPressHandler(minusBtnScale, onUnassignBuilder, canUnassign)}>
            <Text style={styles.builderBtnText}>-</Text>
          </AnimatedPressable>
          <Text style={styles.builderCount}>👷 {building.assignedBuilders}</Text>
          <AnimatedPressable
            style={[styles.builderBtn, !canAssign && styles.btnDisabled, plusBtnStyle]}
            {...createPressHandler(plusBtnScale, onAssignBuilder, canAssign)}>
            <Text style={styles.builderBtnText}>+</Text>
          </AnimatedPressable>
        </View>

        <AnimatedPressable
          style={[styles.upgradeBtn, !canAffordUpgrade && styles.btnDisabled, upgradeBtnStyle]}
          {...createPressHandler(upgradeBtnScale, onUpgrade, canAffordUpgrade)}>
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
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
