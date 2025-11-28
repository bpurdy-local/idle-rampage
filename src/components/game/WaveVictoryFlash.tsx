import React, {useEffect, useRef} from 'react';
import {StyleSheet, Dimensions, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';

interface WaveVictoryFlashProps {
  visible: boolean;
  onComplete: () => void;
  isBoss?: boolean;
}

const {width, height} = Dimensions.get('window');

export const WaveVictoryFlash: React.FC<WaveVictoryFlashProps> = ({
  visible,
  onComplete,
  isBoss = false,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (visible) {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      opacity.value = 0;
      scale.value = 0.5;

      const flashOpacity = isBoss ? 0.6 : 0.4;
      const flashDuration = isBoss ? 150 : 100;
      const fadeDuration = isBoss ? 500 : 300;

      opacity.value = withSequence(
        withTiming(flashOpacity, {duration: flashDuration, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: fadeDuration, easing: Easing.in(Easing.quad)}, () => {
          runOnJS(onCompleteRef.current)();
        }),
      );

      if (isBoss) {
        scale.value = withSequence(
          withTiming(1.2, {duration: 200, easing: Easing.out(Easing.back(2))}),
          withTiming(1, {duration: 300, easing: Easing.out(Easing.quad)}),
        );
      }
    } else {
      opacity.value = 0;
      scale.value = 0.5;
    }
  }, [visible, opacity, scale, isBoss]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value * 2,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.flash, isBoss && styles.bossFlash, animatedStyle]}
      pointerEvents="none">
      {isBoss && (
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.bossText, textAnimatedStyle]}>
            BOSS DEFEATED!
          </Animated.Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: '#4CAF50',
    zIndex: 998,
  },
  bossFlash: {
    backgroundColor: '#FFD700',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bossText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#8B0000',
    textShadowColor: '#000',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
});
