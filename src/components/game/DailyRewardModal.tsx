import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import {Card} from '../common/Card';
import {Button} from '../common/Button';
import {DailyRewardDefinition, getScaledRewardAmount} from '../../data/dailyRewards';
import {formatNumber} from '../../utils/formatters';

interface DailyRewardModalProps {
  reward: DailyRewardDefinition;
  streak: number;
  isStreakBroken: boolean;
  currentWave: number;
  onClaim: () => void;
}

const getRewardIcon = (type: string): string => {
  switch (type) {
    case 'scrap':
      return '⚙️';
    case 'blueprints':
      return '📘';
    case 'builders':
      return '👷';
    default:
      return '🎁';
  }
};

const getRewardColor = (type: string): string => {
  switch (type) {
    case 'scrap':
      return '#8B4513';
    case 'blueprints':
      return '#9c27b0';
    case 'builders':
      return '#4CAF50';
    default:
      return '#fff';
  }
};

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  reward,
  streak,
  isStreakBroken,
  currentWave,
  onClaim,
}) => {
  const cycleDay = ((streak - 1) % 7) + 1;
  const scaledAmount = getScaledRewardAmount(reward, currentWave);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Reward!</Text>

        {isStreakBroken && (
          <Text style={styles.streakBroken}>Streak reset - welcome back!</Text>
        )}

        <Card style={styles.rewardCard}>
          <Text style={styles.dayLabel}>Day {cycleDay}</Text>

          <View style={styles.rewardDisplay}>
            <Text style={styles.rewardIcon}>{getRewardIcon(reward.type)}</Text>
            <Text
              style={[styles.rewardAmount, {color: getRewardColor(reward.type)}]}>
              +{formatNumber(scaledAmount)}
            </Text>
            <Text style={styles.rewardType}>
              {reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}
            </Text>
          </View>

          <Text style={styles.description}>{reward.description}</Text>
        </Card>

        <View style={styles.streakContainer}>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <Text style={styles.streakValue}>
            {streak} day{streak !== 1 ? 's' : ''}
          </Text>
          <View style={styles.streakDots}>
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <View
                key={day}
                style={[
                  styles.streakDot,
                  cycleDay >= day && styles.streakDotActive,
                  day === 7 && cycleDay >= 7 && styles.streakDotSpecial,
                ]}
              />
            ))}
          </View>
        </View>

        <Button
          title="Claim Reward"
          onPress={onClaim}
          variant="primary"
          style={styles.claimButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  streakBroken: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 16,
  },
  rewardCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
  },
  dayLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  rewardDisplay: {
    alignItems: 'center',
    marginVertical: 16,
  },
  rewardIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  rewardType: {
    color: '#888',
    fontSize: 16,
    marginTop: 4,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  streakContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  streakLabel: {
    color: '#888',
    fontSize: 12,
  },
  streakValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 4,
  },
  streakDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  streakDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  streakDotActive: {
    backgroundColor: '#4CAF50',
  },
  streakDotSpecial: {
    backgroundColor: '#FFD700',
  },
  claimButton: {
    minWidth: 200,
  },
});
