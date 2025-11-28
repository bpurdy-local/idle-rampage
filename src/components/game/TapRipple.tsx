import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

export interface TapRippleData {
  id: string;
  x: number;
  y: number;
}

interface TapRippleProps {
  data: TapRippleData;
  onComplete: (id: string) => void;
}

const RIPPLE_SIZE = 80;
const ANIMATION_DURATION = 400;

export const TapRipple: React.FC<TapRippleProps> = ({data, onComplete}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    opacity.value = withTiming(
      0,
      {
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.quad),
      },
      finished => {
        if (finished) {
          runOnJS(onComplete)(data.id);
        }
      },
    );
  }, [data.id, scale, opacity, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          left: data.x - RIPPLE_SIZE / 2,
          top: data.y - RIPPLE_SIZE / 2,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  ripple: {
    position: 'absolute',
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
    borderWidth: 3,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    zIndex: 999,
  },
});
