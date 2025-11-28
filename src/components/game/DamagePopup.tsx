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

export interface DamagePopupData {
  id: string;
  damage: number;
  isBurst: boolean;
  x: number;
  y: number;
}

interface DamagePopupProps {
  data: DamagePopupData;
  onComplete: (id: string) => void;
}

const ANIMATION_DURATION = 800;
const FLOAT_DISTANCE = 60;

export const DamagePopup: React.FC<DamagePopupProps> = ({data, onComplete}) => {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);

  const horizontalDrift = (Math.random() - 0.5) * 40;

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, {duration: 100, easing: Easing.out(Easing.quad)}),
      withTiming(1, {duration: 100}),
    );

    translateY.value = withTiming(-FLOAT_DISTANCE, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    translateX.value = withTiming(horizontalDrift, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    opacity.value = withTiming(
      0,
      {
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
      },
      finished => {
        if (finished) {
          runOnJS(onComplete)(data.id);
        }
      },
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {left: data.x, top: data.y},
        animatedStyle,
      ]}
      pointerEvents="none">
      {data.isBurst && <Text style={styles.burstLabel}>BURST!</Text>}
      <Text style={[styles.damageText, data.isBurst && styles.burstDamageText]}>
        {formatNumber(data.damage)}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1000,
  },
  damageText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  burstDamageText: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: '800',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  burstLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: -4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
});
