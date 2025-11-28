import React, {useEffect} from 'react';
import {StyleSheet, Text} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
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

const ANIMATION_DURATION = 1000;
const FLOAT_DISTANCE = 50;

export const ResourcePopup: React.FC<ResourcePopupProps> = ({
  data,
  onComplete,
}) => {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.3, {duration: 150, easing: Easing.out(Easing.quad)}),
      withTiming(1, {duration: 100}),
    );

    translateY.value = withTiming(-FLOAT_DISTANCE, {
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
  }, [data.id, opacity, translateY, scale, onComplete]);

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
    gap: 4,
    zIndex: 1000,
  },
  icon: {
    fontSize: 16,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
});
