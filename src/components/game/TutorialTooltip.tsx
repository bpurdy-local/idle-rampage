import React, {useEffect, useCallback, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {BuildingEvolutionTier} from '../../models/Building';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

/** Auto-dismiss delay in milliseconds */
const AUTO_DISMISS_DELAY = 4000;

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
  const onDismissRef = useRef(onDismiss);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (visible && newTier) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Animate in from top
      opacity.value = withTiming(1, {duration: 300});
      scale.value = withSpring(1, {damping: 15});
      translateY.value = withSpring(0, {damping: 15});

      // Auto-dismiss after delay
      timeoutRef.current = setTimeout(() => {
        opacity.value = withTiming(0, {duration: 300});
        scale.value = withTiming(0.8, {duration: 300});
        translateY.value = withTiming(-50, {duration: 300}, () => {
          runOnJS(onDismissRef.current)();
        });
      }, AUTO_DISMISS_DELAY);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // Reset
      opacity.value = 0;
      scale.value = 0.8;
      translateY.value = -50;
    }
  }, [visible, newTier, opacity, scale, translateY]);

  const handleDismiss = useCallback(() => {
    // Clear auto-dismiss timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    opacity.value = withTiming(0, {duration: 200});
    scale.value = withTiming(0.8, {duration: 200});
    translateY.value = withTiming(-50, {duration: 200});
    setTimeout(() => onDismissRef.current(), 200);
  }, [opacity, scale, translateY]);

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
    <View style={[styles.container, {top: 100}]} pointerEvents="box-none">
      <Animated.View style={[styles.tooltipWrapper, animatedStyle]} pointerEvents="box-none">
        <View style={[styles.tooltip, {borderColor}]}>
          <View style={styles.header}>
            <Text style={[styles.title, {color: borderColor}]}>{title}</Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <View style={[styles.tierBadge, {backgroundColor: borderColor}]}>
              <Text style={styles.tierBadgeText}>{tierLabel}</Text>
            </View>
            <Text style={[styles.buildingName, {color: borderColor}]}>
              {newTier.name}
            </Text>
          </View>
          <Text style={styles.message}>{newTier.description}</Text>
          <TouchableOpacity onPress={handleDismiss} style={[styles.gotItButton, {backgroundColor: borderColor}]}>
            <Text style={styles.gotItText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  tooltipWrapper: {
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
});
