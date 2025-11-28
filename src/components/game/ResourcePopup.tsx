import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import {formatNumber} from '../../utils/formatters';

export interface ResourcePopupData {
  id: string;
  amount: number;
  type: 'scrap' | 'blueprints';
  x: number;
  y: number;
}

interface ResourcePopupProps {
  data: ResourcePopupData;
  onComplete: (id: string) => void;
}

const HOLD_DURATION = 800;
const FADE_DURATION = 600;
const FLOAT_DISTANCE = 80;

export const ResourcePopup: React.FC<ResourcePopupProps> = ({
  data,
  onComplete,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Pop in animation
    scale.value = withSequence(
      withTiming(1.4, {duration: 150, easing: Easing.out(Easing.quad)}),
      withTiming(1.1, {duration: 100}),
    );

    // Fade in quickly, hold, then fade out
    opacity.value = withSequence(
      withTiming(1, {duration: 100}),
      withDelay(
        HOLD_DURATION,
        withTiming(0, {duration: FADE_DURATION, easing: Easing.in(Easing.quad)}, finished => {
          if (finished) {
            runOnJS(onCompleteRef.current)(data.id);
          }
        }),
      ),
    );

    // Float upward slowly
    translateY.value = withTiming(-FLOAT_DISTANCE, {
      duration: HOLD_DURATION + FADE_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [data.id, opacity, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}, {scale: scale.value}],
  }));

  const getIcon = () => (data.type === 'scrap' ? '⚙️' : '📘');
  const getColor = () => (data.type === 'scrap' ? '#8B4513' : '#9c27b0');

  return (
    <Animated.View
      style={[styles.container, {left: data.x, top: data.y}, animatedStyle]}
      pointerEvents="none">
      <Text style={styles.icon}>{getIcon()}</Text>
      <Text style={[styles.amount, {color: getColor()}]}>
        +{formatNumber(data.amount)}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  icon: {
    fontSize: 20,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
});
