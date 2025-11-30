import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import {LuckyDrop, RARITY_COLORS, DROP_ICONS} from '../../data/luckyDrops';
import {formatNumber} from '../../utils/formatters';
import {useNotificationAnimation} from '../../hooks/useNotificationAnimation';

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
  const {animatedStyle} = useNotificationAnimation(onComplete);

  const rarityColor = RARITY_COLORS[drop.rarity];
  const icon = DROP_ICONS[drop.type];

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
