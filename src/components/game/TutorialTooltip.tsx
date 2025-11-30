import React, {useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {DEBUG_CONFIG} from '../../data/debugConfig';
import {BuildingEvolutionTier} from '../../models/Building';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export interface TutorialTip {
  id: string;
  title: string;
  message: string;
  /** When this tip should be shown - returns true when conditions are met */
  condition: (state: TutorialState) => boolean;
  /** Position on screen */
  position: 'top' | 'middle' | 'bottom';
  /** Priority - lower numbers show first when multiple tips match */
  priority: number;
}

export interface TutorialState {
  currentWave: number;
  scrap: number;
  blueprints: number;
  totalTaps: number;
  buildingsUnlocked: string[];
  buildingLevels: Record<string, number>;
  hasAssignedBuilder: boolean;
  hasUpgradedBuilding: boolean;
  hasPurchasedPrestige: boolean;
  prestigeCount: number;
  highestWave: number;
}

// Define all tutorial tips
export const TUTORIAL_TIPS: TutorialTip[] = [
  {
    id: 'tap_to_attack',
    title: 'Tap to Attack!',
    message: 'Tap on enemies to deal damage. The faster you tap, the faster they fall!',
    condition: (state) => state.totalTaps < 10 && state.currentWave === 1,
    position: 'middle',
    priority: 1,
  },
  {
    id: 'assign_builders',
    title: 'Assign Builders',
    message: 'Tap the + button on buildings to assign builders. More builders = faster production!',
    condition: (state) => !state.hasAssignedBuilder && state.currentWave >= 1 && state.scrap > 50,
    position: 'bottom',
    priority: 2,
  },
  {
    id: 'upgrade_buildings',
    title: 'Upgrade Your Buildings',
    message: 'Tap the upgrade button when you have enough scrap to boost production.',
    condition: (state) => !state.hasUpgradedBuilding && state.scrap >= 100 && state.currentWave >= 2,
    position: 'bottom',
    priority: 3,
  },
  {
    id: 'weak_point_scanner',
    title: 'Weak Points Detected!',
    message: 'Your scanner reveals weak points. Tap the cyan targets for bonus damage! Assign builders for more targets.',
    condition: (state) => state.buildingsUnlocked.includes('weak_point_scanner') && state.currentWave <= 8,
    position: 'middle',
    priority: 4,
  },
  {
    id: 'boss_incoming',
    title: 'Boss Approaching!',
    message: 'Every 10 waves, a powerful boss appears. They\'re tough but drop great rewards!',
    condition: (state) => state.currentWave === 9 && state.highestWave < 10,
    position: 'top',
    priority: 5,
  },
  {
    id: 'prestige_available',
    title: 'Prestige Unlocked!',
    message: 'Reach wave 10+ to prestige! Reset progress but earn Blueprints for permanent upgrades.',
    condition: (state) => state.currentWave >= 10 && state.prestigeCount === 0 && !state.hasPurchasedPrestige,
    position: 'top',
    priority: 6,
  },
  {
    id: 'training_facility',
    title: 'Training Facility',
    message: 'This building boosts your tap damage. Level it up to hit harder!',
    condition: (state) => state.buildingsUnlocked.includes('training_facility') && (state.buildingLevels['training_facility'] ?? 1) === 1,
    position: 'bottom',
    priority: 7,
  },
  {
    id: 'engineering_bay',
    title: 'Engineering Bay',
    message: 'Reduces upgrade costs! A great investment for long-term progression.',
    condition: (state) => state.buildingsUnlocked.includes('engineering_bay') && (state.buildingLevels['engineering_bay'] ?? 1) === 1,
    position: 'bottom',
    priority: 8,
  },
  {
    id: 'shield_generator',
    title: 'Shield Generator',
    message: 'Adds extra time to defeat enemies. Upgrade it when waves get tough!',
    condition: (state) => state.buildingsUnlocked.includes('shield_generator') && (state.buildingLevels['shield_generator'] ?? 1) === 1,
    position: 'bottom',
    priority: 9,
  },
];

interface TutorialTooltipProps {
  tip: TutorialTip;
  onDismiss: (tipId: string) => void;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({tip, onDismiss}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(20);

  useEffect(() => {
    // Animate in
    opacity.value = withTiming(1, {duration: 300});
    scale.value = withSpring(1, {damping: 15});
    translateY.value = withSpring(0, {damping: 15});
  }, [opacity, scale, translateY]);

  const handleDismiss = useCallback(() => {
    // Animate out
    opacity.value = withTiming(0, {duration: 200});
    scale.value = withTiming(0.8, {duration: 200});
    translateY.value = withTiming(20, {duration: 200});

    // Call dismiss after animation
    setTimeout(() => onDismiss(tip.id), 200);
  }, [opacity, scale, translateY, onDismiss, tip.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {scale: scale.value},
      {translateY: translateY.value},
    ],
  }));

  const positionStyle = {
    top: tip.position === 'top' ? 100 : tip.position === 'middle' ? '40%' as const : undefined,
    bottom: tip.position === 'bottom' ? 180 : undefined,
  };

  return (
    <Animated.View style={[styles.container, positionStyle, animatedStyle]}>
      <View style={styles.tooltip}>
        <View style={styles.header}>
          <Text style={styles.title}>{tip.title}</Text>
          <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.message}>{tip.message}</Text>
        <TouchableOpacity onPress={handleDismiss} style={styles.gotItButton}>
          <Text style={styles.gotItText}>Got it!</Text>
        </TouchableOpacity>
      </View>
      {/* Arrow pointer */}
      {tip.position === 'bottom' && <View style={styles.arrowDown} />}
      {tip.position === 'top' && <View style={styles.arrowUp} />}
    </Animated.View>
  );
};

interface TutorialManagerProps {
  tutorialState: TutorialState;
  dismissedTips: Set<string>;
  onDismissTip: (tipId: string) => void;
}

export const TutorialManager: React.FC<TutorialManagerProps> = ({
  tutorialState,
  dismissedTips,
  onDismissTip,
}) => {
  // Check if tutorial is disabled in debug config
  if (DEBUG_CONFIG.DISABLE_TUTORIAL) return null;

  // Find the highest priority tip that matches conditions and hasn't been dismissed
  const activeTip = TUTORIAL_TIPS
    .filter(tip => !dismissedTips.has(tip.id) && tip.condition(tutorialState))
    .sort((a, b) => a.priority - b.priority)[0];

  if (!activeTip) return null;

  return <TutorialTooltip tip={activeTip} onDismiss={onDismissTip} />;
};

// ============================================================================
// Building Evolution Tooltip - Used for building unlock/evolution notifications
// ============================================================================

interface BuildingEvolutionTooltipProps {
  visible: boolean;
  newTier: BuildingEvolutionTier | null;
  isNewUnlock?: boolean; // true if this is a new building unlock (tier 1)
  onDismiss: () => void;
}

export const BuildingEvolutionTooltip: React.FC<BuildingEvolutionTooltipProps> = ({
  visible,
  newTier,
  isNewUnlock = false,
  onDismiss,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    if (visible && newTier) {
      // Animate in from top
      opacity.value = withTiming(1, {duration: 300});
      scale.value = withSpring(1, {damping: 15});
      translateY.value = withSpring(0, {damping: 15});

      // Auto-dismiss after 4 seconds
      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, {duration: 300});
        scale.value = withTiming(0.8, {duration: 300});
        translateY.value = withTiming(-50, {duration: 300}, () => {
          runOnJS(onDismiss)();
        });
      }, 4000);

      return () => clearTimeout(timeout);
    } else {
      // Reset
      opacity.value = 0;
      scale.value = 0.8;
      translateY.value = -50;
    }
  }, [visible, newTier, opacity, scale, translateY, onDismiss]);

  const handleDismiss = useCallback(() => {
    opacity.value = withTiming(0, {duration: 200});
    scale.value = withTiming(0.8, {duration: 200});
    translateY.value = withTiming(-50, {duration: 200});
    setTimeout(onDismiss, 200);
  }, [opacity, scale, translateY, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {scale: scale.value},
      {translateY: translateY.value},
    ],
  }));

  if (!visible || !newTier) return null;

  const title = isNewUnlock ? 'New Building Unlocked!' : 'Building Evolved!';
  const tierLabel = isNewUnlock ? 'UNLOCKED' : `TIER ${newTier.tier}`;
  const borderColor = newTier.color || '#00CED1';

  return (
    <Animated.View style={[styles.container, {top: 100}, animatedStyle]}>
      <View style={[styles.tooltip, {borderColor}]}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: borderColor}]}>{title}</Text>
          <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={evolutionStyles.content}>
          <View style={[evolutionStyles.tierBadge, {backgroundColor: borderColor}]}>
            <Text style={evolutionStyles.tierBadgeText}>{tierLabel}</Text>
          </View>
          <Text style={[evolutionStyles.buildingName, {color: borderColor}]}>
            {newTier.name}
          </Text>
        </View>
        <Text style={styles.message}>{newTier.description}</Text>
        <TouchableOpacity onPress={handleDismiss} style={[styles.gotItButton, {backgroundColor: borderColor}]}>
          <Text style={styles.gotItText}>Got it!</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const evolutionStyles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  tierBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  buildingName: {
    fontSize: 18,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#1a2a3a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#00CED1',
    shadowColor: '#00CED1',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    maxWidth: SCREEN_WIDTH - 32,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#00CED1',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    color: '#666',
    fontSize: 18,
  },
  message: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  gotItButton: {
    backgroundColor: '#00CED1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  gotItText: {
    color: '#0a0a12',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#00CED1',
    marginTop: -2,
  },
  arrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#00CED1',
    marginBottom: -2,
    position: 'absolute',
    top: -10,
  },
});
