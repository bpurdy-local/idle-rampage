import React, {useRef, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Pressable} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {Card} from '../common/Card';
import {Button} from '../common/Button';
import {ProgressBar} from '../common/ProgressBar';
import {formatNumber} from '../../utils/formatters';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Hold-to-repeat constants
const HOLD_DELAY = 300; // ms before repeat starts
const HOLD_INTERVAL = 80; // ms between repeats

interface PrestigeUpgradeItem {
  id: string;
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  nextCost: number | null;
  canAfford: boolean;
  currentEffect: number;
}

// Separate component for upgrade items to manage individual animation state
interface UpgradeItemProps {
  upgrade: PrestigeUpgradeItem;
  canAfford: boolean;
  onPurchase: (id: string) => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({upgrade, canAfford, onPurchase}) => {
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnScale = useSharedValue(1);
  const canAffordRef = useRef(canAfford);

  // Keep ref in sync with latest value
  useEffect(() => {
    canAffordRef.current = canAfford;
  });

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

  useEffect(() => {
    return () => clearHoldTimers();
  }, [clearHoldTimers]);

  // Store onPurchase in a ref to avoid recreating handlers
  const onPurchaseRef = useRef(onPurchase);
  const upgradeIdRef = useRef(upgrade.id);
  useEffect(() => {
    onPurchaseRef.current = onPurchase;
    upgradeIdRef.current = upgrade.id;
  });

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{scale: btnScale.value}],
  }));

  const handlePressIn = useCallback(() => {
    if (canAffordRef.current) {
      btnScale.value = withSpring(0.95, {damping: 15, stiffness: 400});
      holdTimeoutRef.current = setTimeout(() => {
        holdIntervalRef.current = setInterval(() => {
          if (canAffordRef.current) {
            onPurchaseRef.current(upgradeIdRef.current);
          } else {
            clearHoldTimers();
          }
        }, HOLD_INTERVAL);
      }, HOLD_DELAY);
    }
  }, [btnScale, clearHoldTimers]);

  const handlePressOut = useCallback(() => {
    btnScale.value = withSpring(1, {damping: 15, stiffness: 400});
    clearHoldTimers();
  }, [btnScale, clearHoldTimers]);

  const handlePress = useCallback(() => {
    if (canAffordRef.current) {
      btnScale.value = withSequence(
        withTiming(0.9, {duration: 50}),
        withSpring(1, {damping: 10, stiffness: 400}),
      );
      onPurchaseRef.current(upgradeIdRef.current);
    }
  }, [btnScale]);

  return (
    <View style={styles.upgradeItem}>
      <View style={styles.upgradeInfo}>
        <Text style={styles.upgradeName}>{upgrade.name}</Text>
        <Text style={styles.upgradeLevel}>
          Lv.{upgrade.currentLevel}/{upgrade.maxLevel}
        </Text>
      </View>
      <Text style={styles.upgradeDesc}>{upgrade.description}</Text>
      {upgrade.nextCost !== null && (
        <AnimatedPressable
          style={[
            styles.buyBtn,
            !canAfford && styles.buyBtnDisabled,
            btnStyle,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}>
          <Text style={styles.buyBtnText}>
            {formatNumber(upgrade.nextCost)} BP
          </Text>
        </AnimatedPressable>
      )}
      {upgrade.nextCost === null && (
        <Text style={styles.maxedText}>MAXED</Text>
      )}
    </View>
  );
};

interface PrestigePanelProps {
  blueprints: number;
  prestigeCount: number;
  currentWave: number;
  canPrestige: boolean;
  blueprintsToEarn: number;
  prestigeRequirement: number;
  upgrades: PrestigeUpgradeItem[];
  // Builder purchase props
  totalBuilders: number;
  maxBuilders: number;
  builderCost: number;
  canAffordBuilder: boolean;
  onPrestige: () => void;
  onPurchaseUpgrade: (upgradeId: string) => void;
  onPurchaseBuilder: () => void;
  onClose: () => void;
}

export const PrestigePanel: React.FC<PrestigePanelProps> = ({
  blueprints,
  prestigeCount,
  currentWave,
  canPrestige,
  blueprintsToEarn,
  prestigeRequirement,
  upgrades,
  totalBuilders,
  maxBuilders,
  builderCost,
  canAffordBuilder,
  onPrestige,
  onPurchaseUpgrade,
  onPurchaseBuilder,
  onClose,
}) => {
  const isAtMaxBuilders = totalBuilders >= maxBuilders;

  // Hold-to-repeat state
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Button scale animations
  const builderBtnScale = useSharedValue(1);

  // Refs to track latest enabled states for hold-to-repeat
  const canAffordBuilderRef = useRef(canAffordBuilder);

  // Keep refs in sync with latest values
  useEffect(() => {
    canAffordBuilderRef.current = canAffordBuilder;
  });

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

  const createHoldablePressHandler = (
    scale: Animated.SharedValue<number>,
    action: () => void,
    isEnabled: () => boolean,
  ) => ({
    onPressIn: () => {
      if (isEnabled()) {
        scale.value = withSpring(0.95, {damping: 15, stiffness: 400});
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
          withTiming(0.9, {duration: 50}),
          withSpring(1, {damping: 10, stiffness: 400}),
        );
        action();
      }
    },
  });

  const builderBtnStyle = useAnimatedStyle(() => ({
    transform: [{scale: builderBtnScale.value}],
  }));
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prestige</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtnTouchable} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatNumber(blueprints)}</Text>
          <Text style={styles.statLabel}>Blueprints</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{prestigeCount}</Text>
          <Text style={styles.statLabel}>Prestiges</Text>
        </View>
      </View>

      <Card style={styles.prestigeCard}>
        <Text style={styles.sectionTitle}>Reset Progress</Text>
        <Text style={styles.prestigeInfo}>
          Wave {currentWave} / {prestigeRequirement} required
        </Text>
        <ProgressBar
          progress={Math.min(currentWave / prestigeRequirement, 1)}
          color={canPrestige ? '#4CAF50' : '#666'}
          height={8}
          style={styles.progressBar}
        />
        {canPrestige ? (
          <>
            <Text style={styles.earnText}>
              Earn {formatNumber(blueprintsToEarn)} Blueprints
            </Text>
            <Button
              title="Prestige Now"
              onPress={onPrestige}
              variant="primary"
              style={styles.prestigeBtn}
            />
          </>
        ) : (
          <Text style={styles.notReadyText}>
            Reach wave {prestigeRequirement} to prestige
          </Text>
        )}
      </Card>

      <Card style={styles.builderCard}>
        <View style={styles.builderHeader}>
          <Text style={styles.sectionTitle}>Buy Builders</Text>
          <Text style={styles.builderCount}>
            {totalBuilders}/{maxBuilders}
          </Text>
        </View>
        <Text style={styles.builderDesc}>
          Permanently increase your builder pool
        </Text>
        {isAtMaxBuilders ? (
          <Text style={styles.maxedText}>MAX BUILDERS</Text>
        ) : (
          <AnimatedPressable
            style={[
              styles.buyBtn,
              !canAffordBuilder && styles.buyBtnDisabled,
              builderBtnStyle,
            ]}
            {...createHoldablePressHandler(
              builderBtnScale,
              onPurchaseBuilder,
              () => canAffordBuilderRef.current && !isAtMaxBuilders,
            )}>
            <Text style={styles.buyBtnText}>
              +1 Builder for {formatNumber(builderCost)} BP
            </Text>
          </AnimatedPressable>
        )}
      </Card>

      <Text style={styles.sectionTitle}>Upgrades</Text>
      <ScrollView style={styles.upgradeList}>
        {upgrades.map(upgrade => (
          <UpgradeItem
            key={upgrade.id}
            upgrade={upgrade}
            canAfford={upgrade.canAfford}
            onPurchase={onPurchaseUpgrade}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  closeBtnTouchable: {
    padding: 8,
  },
  closeBtn: {
    color: '#888',
    fontSize: 24,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#9c27b0',
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  prestigeCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  prestigeInfo: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    marginBottom: 12,
  },
  earnText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  prestigeBtn: {
    marginTop: 8,
  },
  notReadyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  builderCard: {
    marginBottom: 16,
  },
  builderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  builderCount: {
    color: '#9c27b0',
    fontSize: 14,
    fontWeight: '600',
  },
  builderDesc: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  upgradeList: {
    flex: 1,
  },
  upgradeItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  upgradeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upgradeName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  upgradeLevel: {
    color: '#9c27b0',
    fontSize: 12,
    fontWeight: '600',
  },
  upgradeDesc: {
    color: '#888',
    fontSize: 12,
    marginVertical: 4,
  },
  buyBtn: {
    backgroundColor: '#9c27b0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  buyBtnDisabled: {
    backgroundColor: '#333',
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  maxedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
