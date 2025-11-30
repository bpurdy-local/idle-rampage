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

interface WaveExtendFlashProps {
  visible: boolean;
  bonusSeconds: number;
  onComplete: () => void;
}

const {width, height} = Dimensions.get('window');

export const WaveExtendFlash: React.FC<WaveExtendFlashProps> = ({
  visible,
  bonusSeconds,
  onComplete,
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

      const flashOpacity = 0.35;
      const flashDuration = 150;
      const fadeDuration = 400;

      opacity.value = withSequence(
        withTiming(flashOpacity, {duration: flashDuration, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: fadeDuration, easing: Easing.in(Easing.quad)}, () => {
          runOnJS(onCompleteRef.current)();
        }),
      );

      scale.value = withSequence(
        withTiming(1.1, {duration: 200, easing: Easing.out(Easing.back(2))}),
        withTiming(1, {duration: 300, easing: Easing.out(Easing.quad)}),
      );
    } else {
      opacity.value = 0;
      scale.value = 0.5;
    }
  }, [visible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value * 2.5,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.flash, animatedStyle]}
      pointerEvents="none">
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.mainText, textAnimatedStyle]}>
          WAVE EXTENDED
        </Animated.Text>
        <Animated.Text style={[styles.bonusText, textAnimatedStyle]}>
          +{bonusSeconds}s
        </Animated.Text>
      </View>
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
    backgroundColor: '#4169E1',
    zIndex: 998,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  bonusText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#87CEEB',
    marginTop: 8,
    textShadowColor: '#000',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
});
