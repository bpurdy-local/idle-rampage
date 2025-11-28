import React, {useEffect} from 'react';
import {StyleSheet, Text, Pressable} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface PrestigeTabGlowProps {
  canPrestige: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PrestigeTabGlow: React.FC<PrestigeTabGlowProps> = ({
  canPrestige,
  onPress,
}) => {
  const glowOpacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (canPrestige) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, {duration: 1000, easing: Easing.inOut(Easing.quad)}),
          withTiming(0.3, {duration: 1000, easing: Easing.inOut(Easing.quad)}),
        ),
        -1,
        true,
      );
    } else {
      glowOpacity.value = withTiming(0, {duration: 200});
    }
  }, [canPrestige, glowOpacity]);

  const handlePressIn = () => {
    scale.value = withTiming(0.95, {duration: 100});
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {duration: 100});
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <AnimatedPressable
      style={[styles.tab, containerStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      {canPrestige && (
        <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none" />
      )}
      <Text style={[styles.tabText, canPrestige && styles.tabTextActive]}>
        Prestige
      </Text>
      {canPrestige && <Text style={styles.readyIndicator}>!</Text>}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#9c27b0',
    borderRadius: 4,
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    zIndex: 1,
  },
  tabTextActive: {
    color: '#fff',
  },
  readyIndicator: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 4,
    zIndex: 1,
  },
});
