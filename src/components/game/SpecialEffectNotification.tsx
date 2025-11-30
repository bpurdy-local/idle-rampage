import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {formatNumber} from '../../utils/formatters';
import {SpecialEffectType} from '../../models/Building';

export interface SpecialEffectNotificationData {
  id: string;
  effectType: SpecialEffectType;
  amount?: number;
  buildingName?: string;
}

interface SpecialEffectNotificationProps {
  data: SpecialEffectNotificationData;
  onComplete: (id: string) => void;
}

const EFFECT_CONFIG: Record<
  SpecialEffectType,
  {
    icon: string;
    label: string;
    color: string;
    borderColor: string;
    formatAmount?: (amount: number) => string;
  }
> = {
  scrap_find: {
    icon: '🔧',
    label: 'SCRAP FOUND',
    color: '#8B4513',
    borderColor: '#D4A574',
    formatAmount: (amount: number) => `+${formatNumber(amount)} Scrap`,
  },
  wave_extend: {
    icon: '🛡️',
    label: 'WAVE EXTENDED',
    color: '#4169E1',
    borderColor: '#87CEEB',
    formatAmount: (amount: number) => `+${amount}s`,
  },
  burst_boost: {
    icon: '⚡',
    label: 'BURST READY',
    color: '#FF6B6B',
    borderColor: '#FFB6C1',
  },
  critical_weakness: {
    icon: '💥',
    label: 'CRITICAL HIT',
    color: '#FFD700',
    borderColor: '#FFF8DC',
  },
};

export const SpecialEffectNotification: React.FC<SpecialEffectNotificationProps> = ({
  data,
  onComplete,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.8);

  const config = EFFECT_CONFIG[data.effectType];

  useEffect(() => {
    const duration = 300;
    const holdDuration = 2000;

    opacity.value = withSequence(
      withTiming(1, {duration, easing: Easing.out(Easing.cubic)}),
      withDelay(
        holdDuration,
        withTiming(0, {duration, easing: Easing.in(Easing.cubic)}, finished => {
          if (finished) {
            runOnJS(onComplete)(data.id);
          }
        }),
      ),
    );

    translateY.value = withSequence(
      withTiming(0, {duration, easing: Easing.out(Easing.cubic)}),
      withDelay(
        holdDuration,
        withTiming(-10, {duration, easing: Easing.in(Easing.cubic)}),
      ),
    );

    scale.value = withSequence(
      withTiming(1.1, {duration: duration / 2, easing: Easing.out(Easing.cubic)}),
      withTiming(1, {duration: duration / 2, easing: Easing.in(Easing.cubic)}),
      withDelay(
        holdDuration - duration / 2,
        withTiming(0.9, {duration, easing: Easing.in(Easing.cubic)}),
      ),
    );
  }, [opacity, translateY, scale, onComplete, data.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}, {scale: scale.value}],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.notification, {borderColor: config.borderColor}]}>
        <Text style={styles.icon}>{config.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.label, {color: config.color}]}>
            {config.label}
          </Text>
          {data.amount !== undefined && config.formatAmount && (
            <Text style={styles.amount}>{config.formatAmount(data.amount)}</Text>
          )}
          {data.buildingName && (
            <Text style={styles.buildingName}>{data.buildingName}</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  buildingName: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});
