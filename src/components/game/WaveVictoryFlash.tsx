import React, {useEffect, useRef} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
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
}

const {width, height} = Dimensions.get('window');

export const WaveVictoryFlash: React.FC<WaveVictoryFlashProps> = ({
  visible,
  onComplete,
}) => {
  const opacity = useSharedValue(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (visible) {
      cancelAnimation(opacity);
      opacity.value = 0;

      opacity.value = withSequence(
        withTiming(0.4, {duration: 100, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: 300, easing: Easing.in(Easing.quad)}, () => {
          runOnJS(onCompleteRef.current)();
        }),
      );
    } else {
      opacity.value = 0;
    }
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.flash, animatedStyle]} pointerEvents="none" />
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
});
