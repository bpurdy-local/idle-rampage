import React, {useEffect} from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
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

  // Animation values
  const containerOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0);
  const cardScale = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animations
    containerOpacity.value = withTiming(1, {duration: 300});

    titleScale.value = withDelay(
      100,
      withSpring(1, {damping: 12, stiffness: 100}),
    );

    cardScale.value = withDelay(
      300,
      withSpring(1, {damping: 15, stiffness: 120}),
    );

    cardOpacity.value = withDelay(300, withTiming(1, {duration: 300}));

    statsOpacity.value = withDelay(600, withTiming(1, {duration: 300}));

    buttonOpacity.value = withDelay(800, withTiming(1, {duration: 300}));

    // Pulsing glow effect on the card
    glowOpacity.value = withDelay(
      500,
      withSequence(
        withTiming(0.8, {duration: 500}),
        withTiming(0.3, {duration: 800, easing: Easing.inOut(Easing.quad)}),
      ),
    );

    // Start counting animation after card appears
    const timer = setTimeout(() => {
      animate(earnings);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    earnings,
    animate,
    containerOpacity,
    titleScale,
    cardScale,
    cardOpacity,
    statsOpacity,
    buttonOpacity,
    glowOpacity,
  ]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{scale: titleScale.value}],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{scale: cardScale.value}],
    opacity: cardOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, containerStyle]}>
        <Animated.Text style={[styles.title, titleStyle]}>
          Welcome Back!
        </Animated.Text>
        <Text style={styles.subtitle}>
          You were away for {formatOfflineDuration(offlineTime)}
        </Text>

        <Animated.View style={[styles.earningsCard, cardStyle]}>
          <Animated.View style={[styles.cardGlow, glowStyle]} />
          <Text style={styles.earningsLabel}>Scrap Collected</Text>

          <View style={styles.earningsDisplay}>
            <Text style={styles.scrapIcon}>⚙️</Text>
            <Text style={styles.earningsAmount}>
              +{formatNumber(displayedEarnings)}
            </Text>
          </View>

          <Text style={styles.scrapLabel}>SCRAP</Text>
        </Animated.View>

        <Animated.View style={[styles.statsContainer, statsStyle]}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Production:</Text>
            <Text style={styles.statValue}>
              {formatNumber(productionRate)}/sec
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Efficiency:</Text>
            <Text style={styles.statValue}>50% (offline)</Text>
          </View>
        </Animated.View>

        <Animated.View style={buttonStyle}>
          <Button
            title="Collect"
            onPress={onCollect}
            variant="primary"
            style={styles.collectButton}
          />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: '#FFD700',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: '#4CAF50',
    borderWidth: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    opacity: 0.2,
  },
  earningsLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    zIndex: 1,
  },
  earningsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1,
  },
  scrapIcon: {
    fontSize: 48,
  },
  earningsAmount: {
    color: '#4CAF50',
    fontSize: 52,
    fontWeight: '800',
    textShadowColor: 'rgba(76, 175, 80, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 15,
  },
  scrapLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    letterSpacing: 3,
    zIndex: 1,
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
    backgroundColor: '#4CAF50',
  },
});
