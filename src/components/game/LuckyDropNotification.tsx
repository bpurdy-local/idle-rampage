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
import {LuckyDrop, RARITY_COLORS, DROP_ICONS} from '../../data/luckyDrops';
import {formatNumber} from '../../utils/formatters';

interface LuckyDropNotificationProps {
  drop: LuckyDrop;
  amount: number;
  onComplete: () => void;
}

export const LuckyDropNotification: React.FC<LuckyDropNotificationProps> = ({
  drop,
  amount,
  onComplete,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.8);

  const rarityColor = RARITY_COLORS[drop.rarity];
  const icon = DROP_ICONS[drop.type];

  useEffect(() => {
    const duration = 300;
    const holdDuration = 2000;

    opacity.value = withSequence(
      withTiming(1, {duration, easing: Easing.out(Easing.cubic)}),
      withDelay(
        holdDuration,
        withTiming(0, {duration, easing: Easing.in(Easing.cubic)}, finished => {
          if (finished) {
            runOnJS(onComplete)();
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
  }, [opacity, translateY, scale, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}, {scale: scale.value}],
  }));

  const formatDropAmount = (): string => {
    if (drop.type === 'scrap') {
      return `+${formatNumber(amount)} Scrap`;
    }
    if (drop.type === 'blueprints') {
      return `+${amount} Blueprint${amount > 1 ? 's' : ''}`;
    }
    if (drop.type === 'boost') {
      return `2x Boost (${drop.boostDuration}s)`;
    }
    if (drop.type === 'builder') {
      return '+1 Builder';
    }
    return `+${amount}`;
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.notification, {borderColor: rarityColor}]}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.dropName, {color: rarityColor}]}>
            {drop.name}
          </Text>
          <Text style={styles.amount}>{formatDropAmount()}</Text>
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
  dropName: {
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
});
