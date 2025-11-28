import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {PrestigeTier} from '../../data/prestigeMilestones';

interface MilestonePopupProps {
  visible: boolean;
  tier: PrestigeTier | null;
  onDismiss: () => void;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const MilestonePopup: React.FC<MilestonePopupProps> = ({
  visible,
  tier,
  onDismiss,
}) => {
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.5);
  const cardOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);

  useEffect(() => {
    if (visible && tier) {
      // Reset values
      overlayOpacity.value = 0;
      cardScale.value = 0.5;
      cardOpacity.value = 0;
      glowOpacity.value = 0;
      titleScale.value = 0.8;

      // Animate in
      overlayOpacity.value = withTiming(1, {duration: 300});
      cardOpacity.value = withTiming(1, {duration: 300});
      cardScale.value = withSequence(
        withSpring(1.1, {damping: 8, stiffness: 200}),
        withSpring(1, {damping: 12, stiffness: 150}),
      );
      titleScale.value = withDelay(
        200,
        withSpring(1, {damping: 8, stiffness: 200}),
      );
      glowOpacity.value = withSequence(
        withDelay(300, withTiming(0.8, {duration: 300})),
        withTiming(0.3, {duration: 1000}),
        withTiming(0.8, {duration: 1000}),
      );
    }
  }, [visible, tier, overlayOpacity, cardScale, cardOpacity, glowOpacity, titleScale]);

  const handleDismiss = () => {
    overlayOpacity.value = withTiming(0, {duration: 200});
    cardOpacity.value = withTiming(0, {duration: 200});
    cardScale.value = withTiming(0.8, {duration: 200, easing: Easing.in(Easing.quad)}, () => {
      runOnJS(onDismiss)();
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{scale: cardScale.value}],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{scale: titleScale.value}],
  }));

  if (!visible || !tier) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="auto">
      <Animated.View style={[styles.glow, {backgroundColor: tier.color}, glowStyle]} />
      <Animated.View style={[styles.card, {borderColor: tier.color}, cardStyle]}>
        <View style={styles.header}>
          <Text style={styles.milestone}>MILESTONE REACHED!</Text>
        </View>

        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <Text style={[styles.tierName, {color: tier.color}]}>{tier.name}</Text>
          <Text style={styles.tierSubtitle}>Buildings Evolved</Text>
        </Animated.View>

        <View style={styles.bonusContainer}>
          <Text style={styles.bonusLabel}>All Building Output</Text>
          <Text style={[styles.bonusValue, {color: tier.color}]}>{tier.multiplier}x</Text>
        </View>

        <Text style={styles.description}>
          All your buildings have evolved! They now produce {tier.multiplier}x more resources and deal {tier.multiplier}x more damage.
        </Text>

        <TouchableOpacity style={[styles.button, {backgroundColor: tier.color}]} onPress={handleDismiss}>
          <Text style={styles.buttonText}>Awesome!</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  glow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    opacity: 0.3,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: SCREEN_WIDTH * 0.85,
    borderWidth: 3,
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  milestone: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tierName: {
    fontSize: 36,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  tierSubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  bonusContainer: {
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  bonusLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  bonusValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  description: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
