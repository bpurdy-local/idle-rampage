import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import {BuildingEvolutionTier} from '../../models/Building';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface EvolutionToastProps {
  visible: boolean;
  newTier: BuildingEvolutionTier | null;
  onDismiss: () => void;
}

export const EvolutionToast: React.FC<EvolutionToastProps> = ({
  visible,
  newTier,
  onDismiss,
}) => {
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    if (visible && newTier) {
      // Slide in from top
      translateY.value = withSpring(0, {damping: 15, stiffness: 150});
      opacity.value = withTiming(1, {duration: 200});

      // Shimmer effect
      shimmerPosition.value = withTiming(2, {
        duration: 1500,
        easing: Easing.linear,
      });

      // Auto-dismiss after 3.5 seconds
      const timeout = setTimeout(() => {
        translateY.value = withTiming(-120, {duration: 300});
        opacity.value = withTiming(0, {duration: 300}, () => {
          runOnJS(onDismiss)();
        });
      }, 3500);

      return () => clearTimeout(timeout);
    } else {
      // Reset for next use
      translateY.value = -120;
      opacity.value = 0;
      shimmerPosition.value = -1;
    }
  }, [visible, newTier, translateY, opacity, shimmerPosition, onDismiss]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shimmerPosition.value * SCREEN_WIDTH}],
  }));

  if (!visible || !newTier) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={[styles.accentBar, {backgroundColor: newTier.color}]} />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={[styles.tierBadge, {backgroundColor: newTier.color}]}>
            <Text style={styles.tierText}>T{newTier.tier}</Text>
          </View>
        </View>
        <View style={styles.textSection}>
          <Text style={styles.label}>EVOLVED</Text>
          <Text style={[styles.buildingName, {color: newTier.color}]}>
            {newTier.name}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.sparkle}>✨</Text>
        </View>
      </View>
      {/* Shimmer overlay */}
      <Animated.View style={[styles.shimmer, shimmerStyle]} pointerEvents="none" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  leftSection: {
    marginRight: 12,
  },
  tierBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  textSection: {
    flex: 1,
  },
  label: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '700',
  },
  rightSection: {
    marginLeft: 8,
  },
  sparkle: {
    fontSize: 20,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{skewX: '-20deg'}],
  },
});
