import React, {useEffect} from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import {Card} from '../common/Card';
import {Button} from '../common/Button';
import {useAnimatedCounter} from '../../hooks/useAnimatedCounter';
import {formatNumber, formatOfflineDuration} from '../../utils/formatters';

interface OfflineEarningsModalProps {
  offlineTime: number;
  earnings: number;
  productionRate: number;
  onCollect: () => void;
}

export const OfflineEarningsModal: React.FC<OfflineEarningsModalProps> = ({
  offlineTime,
  earnings,
  productionRate,
  onCollect,
}) => {
  const {value: displayedEarnings, animate} = useAnimatedCounter({
    duration: 1500,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      animate(earnings);
    }, 300);

    return () => clearTimeout(timer);
  }, [earnings, animate]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          You were away for {formatOfflineDuration(offlineTime)}
        </Text>

        <Card style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Scrap Collected</Text>

          <View style={styles.earningsDisplay}>
            <Text style={styles.scrapIcon}>⚙️</Text>
            <Text style={styles.earningsAmount}>
              {formatNumber(displayedEarnings)}
            </Text>
          </View>

          <Text style={styles.scrapLabel}>SCRAP</Text>
        </Card>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Production:</Text>
            <Text style={styles.statValue}>{formatNumber(productionRate)}/sec</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Efficiency:</Text>
            <Text style={styles.statValue}>50% (offline)</Text>
          </View>
        </View>

        <Button
          title="Collect"
          onPress={onCollect}
          variant="primary"
          style={styles.collectButton}
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
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 24,
  },
  earningsCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#1a1a2e',
    borderColor: '#8B4513',
    borderWidth: 2,
  },
  earningsLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  earningsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scrapIcon: {
    fontSize: 40,
  },
  earningsAmount: {
    color: '#8B4513',
    fontSize: 48,
    fontWeight: '700',
  },
  scrapLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 2,
  },
  statsContainer: {
    marginVertical: 24,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  statValue: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  collectButton: {
    minWidth: 200,
  },
});
