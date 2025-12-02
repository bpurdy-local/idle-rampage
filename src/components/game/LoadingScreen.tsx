import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const LOADING_TIPS = [
  'Assign builders to boost production!',
  'Tap enemies to deal extra damage!',
  'Prestige to earn blueprints for upgrades!',
  'Boss waves give bonus rewards!',
  'Focus all builders on one building for max output!',
  'Burst attacks deal 5x damage!',
  'Buildings evolve at higher levels!',
  'Check the Depot for special items!',
  'Offline earnings cap at 8 hours!',
  'Higher waves give better scrap bonuses!',
];

interface LoadingScreenProps {
  progress?: number; // 0-1
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({progress = 0}) => {
  const [tipIndex, setTipIndex] = useState(0);

  // Gear rotations
  const gear1Rotation = useSharedValue(0);
  const gear2Rotation = useSharedValue(0);
  const gear3Rotation = useSharedValue(0);

  // Title pulse
  const titleScale = useSharedValue(1);

  // Tip fade
  const tipOpacity = useSharedValue(1);

  // Progress bar glow
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Start gear rotations at different speeds
    gear1Rotation.value = withRepeat(
      withTiming(360, {duration: 3000, easing: Easing.linear}),
      -1,
      false,
    );
    gear2Rotation.value = withRepeat(
      withTiming(-360, {duration: 2000, easing: Easing.linear}),
      -1,
      false,
    );
    gear3Rotation.value = withRepeat(
      withTiming(360, {duration: 4000, easing: Easing.linear}),
      -1,
      false,
    );

    // Title pulse
    titleScale.value = withRepeat(
      withSequence(
        withTiming(1.05, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        withTiming(1, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );

    // Progress bar glow
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, {duration: 800, easing: Easing.inOut(Easing.ease)}),
        withTiming(0.3, {duration: 800, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
  }, [gear1Rotation, gear2Rotation, gear3Rotation, titleScale, glowOpacity]);

  // Cycle through tips
  useEffect(() => {
    const interval = setInterval(() => {
      tipOpacity.value = withSequence(
        withTiming(0, {duration: 300}),
        withTiming(1, {duration: 300}),
      );
      setTimeout(() => {
        setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [tipOpacity]);

  const gear1Style = useAnimatedStyle(() => ({
    transform: [{rotate: `${gear1Rotation.value}deg`}],
  }));

  const gear2Style = useAnimatedStyle(() => ({
    transform: [{rotate: `${gear2Rotation.value}deg`}],
  }));

  const gear3Style = useAnimatedStyle(() => ({
    transform: [{rotate: `${gear3Rotation.value}deg`}],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{scale: titleScale.value}],
  }));

  const tipStyle = useAnimatedStyle(() => ({
    opacity: tipOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowOpacity.value, [0.3, 0.8], [0.3, 0.8]),
  }));

  return (
    <View style={styles.container}>
      {/* Animated gears background */}
      <View style={styles.gearsContainer}>
        <Animated.View style={[styles.gear, styles.gear1, gear1Style]}>
          <GearIcon size={80} color="#2a3a4a" />
        </Animated.View>
        <Animated.View style={[styles.gear, styles.gear2, gear2Style]}>
          <GearIcon size={60} color="#1a2a3a" />
        </Animated.View>
        <Animated.View style={[styles.gear, styles.gear3, gear3Style]}>
          <GearIcon size={100} color="#1a2a3a" />
        </Animated.View>
      </View>

      {/* Game title */}
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>IDLE</Text>
        <Text style={styles.titleAccent}>RAMPAGE</Text>
      </Animated.View>

      {/* Animated robot icon */}
      <View style={styles.robotContainer}>
        <Text style={styles.robotEmoji}>🤖</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressGlow, glowStyle]} />
          <View style={[styles.progressFill, {width: `${Math.min(progress * 100, 100)}%`}]} />
        </View>
        <Text style={styles.progressText}>
          {progress < 1 ? 'Initializing systems...' : 'Ready!'}
        </Text>
      </View>

      {/* Loading tip */}
      <Animated.View style={[styles.tipContainer, tipStyle]}>
        <Text style={styles.tipLabel}>TIP</Text>
        <Text style={styles.tipText}>{LOADING_TIPS[tipIndex]}</Text>
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

// Simple gear icon component using Unicode and styling
const GearIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <View style={[styles.gearIcon, {width: size, height: size}]}>
    {/* Gear teeth */}
    {[...Array(8)].map((_, i) => (
      <View
        key={i}
        style={[
          styles.gearTooth,
          {
            backgroundColor: color,
            width: size * 0.2,
            height: size * 0.35,
            top: -size * 0.1,
            left: size * 0.4,
            transform: [{rotate: `${i * 45}deg`}, {translateY: size * 0.35}],
          },
        ]}
      />
    ))}
    {/* Gear center */}
    <View
      style={[
        styles.gearCenter,
        {
          backgroundColor: color,
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: size * 0.3,
        },
      ]}
    />
    {/* Gear hole */}
    <View
      style={[
        styles.gearHole,
        {
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: size * 0.1,
        },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  gearsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gear: {
    position: 'absolute',
  },
  gear1: {
    top: '15%',
    right: -20,
  },
  gear2: {
    top: '40%',
    left: -15,
  },
  gear3: {
    bottom: '20%',
    right: '20%',
  },
  gearIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearTooth: {
    position: 'absolute',
    borderRadius: 2,
  },
  gearCenter: {
    position: 'absolute',
  },
  gearHole: {
    position: 'absolute',
    backgroundColor: '#0f0f1a',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    color: '#888',
    letterSpacing: 12,
  },
  titleAccent: {
    fontSize: 52,
    fontWeight: '900',
    color: '#00CED1',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 206, 209, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 20,
  },
  robotContainer: {
    marginVertical: 30,
  },
  robotEmoji: {
    fontSize: 64,
  },
  progressContainer: {
    width: SCREEN_WIDTH - 80,
    alignItems: 'center',
    marginTop: 20,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1a2a3a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00CED1',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00CED1',
    borderRadius: 4,
  },
  progressText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
  tipContainer: {
    marginTop: 50,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tipLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tipText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: '#333',
    fontSize: 12,
  },
});
