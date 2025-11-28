import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {BuildingEvolutionTier} from '../../models/Building';

interface BuildingEvolutionPopupProps {
  visible: boolean;
  buildingId: string;
  newTier: BuildingEvolutionTier | null;
  onDismiss: () => void;
}

export const BuildingEvolutionPopup: React.FC<BuildingEvolutionPopupProps> = ({
  visible,
  newTier,
  onDismiss,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible && newTier) {
      // Animate in
      opacity.value = withTiming(1, {duration: 300});
      scale.value = withSequence(
        withSpring(1.1, {damping: 8, stiffness: 200}),
        withSpring(1, {damping: 15, stiffness: 300}),
      );
      glowOpacity.value = withSequence(
        withTiming(0.8, {duration: 200}),
        withDelay(500, withTiming(0.3, {duration: 300})),
      );

      // Auto-dismiss after 3 seconds
      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, {duration: 300}, () => {
          runOnJS(onDismiss)();
        });
        scale.value = withTiming(0.8, {duration: 300});
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible, newTier, opacity, scale, glowOpacity, onDismiss]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!visible || !newTier) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.View
          style={[
            styles.glow,
            {backgroundColor: newTier.color},
            glowStyle,
          ]}
        />
        <View style={styles.content}>
          <Text style={styles.title}>EVOLVED!</Text>
          <View style={[styles.tierBadge, {backgroundColor: newTier.color}]}>
            <Text style={styles.tierText}>TIER {newTier.tier}</Text>
          </View>
          <Text style={[styles.buildingName, {color: newTier.color}]}>
            {newTier.name}
          </Text>
          <Text style={styles.description}>{newTier.description}</Text>
          <Text style={styles.tapToDismiss}>Tap to continue</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
  },
  glow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 200,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffd700',
    marginBottom: 12,
    textShadowColor: '#ffd700',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  tierText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  buildingName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 16,
  },
  tapToDismiss: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
