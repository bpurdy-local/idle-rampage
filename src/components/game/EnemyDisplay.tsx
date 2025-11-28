import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent} from 'react-native';
import {EnemyState} from '../../core/GameState';
import {ProgressBar} from '../common/ProgressBar';
import {formatNumber, formatTime} from '../../utils/formatters';
import {BOSS_CONFIG} from '../../data/enemies';

interface EnemyDisplayProps {
  enemy: EnemyState | null;
  waveTimer: number;
  waveTimerMax: number;
  currentWave: number;
  onTap: (x?: number, y?: number) => void;
}

export const EnemyDisplay: React.FC<EnemyDisplayProps> = ({
  enemy,
  waveTimer,
  waveTimerMax,
  currentWave,
  onTap,
}) => {
  const wavesUntilBoss = BOSS_CONFIG.waveInterval - (currentWave % BOSS_CONFIG.waveInterval);
  const showBossIndicator = wavesUntilBoss <= 3 && wavesUntilBoss < BOSS_CONFIG.waveInterval;

  if (!enemy) {
    return (
      <View style={styles.container}>
        <Text style={styles.waitingText}>Preparing Wave {currentWave}...</Text>
      </View>
    );
  }

  const healthPercent = enemy.currentHealth / enemy.maxHealth;
  const timerPercent = waveTimer / waveTimerMax;
  const isBoss = enemy.isBoss === true;

  const handlePress = (event: GestureResponderEvent) => {
    const {pageX, pageY} = event.nativeEvent;
    onTap(pageX, pageY);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isBoss && styles.bossContainer]}
      onPress={handlePress}
      activeOpacity={0.9}>
      <View style={styles.waveInfo}>
        <View style={styles.waveTextContainer}>
          {isBoss && <Text style={styles.bossLabel}>BOSS</Text>}
          <Text style={[styles.waveText, isBoss && styles.bossWaveText]}>
            Wave {currentWave}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, isBoss && styles.bossTimerText]}>
            {formatTime(waveTimer)}
          </Text>
          <ProgressBar
            progress={timerPercent}
            color={isBoss ? '#FFD700' : '#ff9800'}
            backgroundColor="#333"
            height={4}
            style={styles.timerBar}
          />
        </View>
      </View>

      {!isBoss && showBossIndicator && (
        <View style={styles.bossIndicator}>
          <Text style={styles.bossIndicatorText}>
            Boss in {wavesUntilBoss} wave{wavesUntilBoss !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <View style={styles.enemyContainer}>
        <Text style={[styles.enemyIcon, isBoss && styles.bossIcon]}>
          {isBoss ? '👹' : '🤖'}
        </Text>
        <Text style={[styles.enemyName, isBoss && styles.bossName]}>
          {enemy.name}
        </Text>
      </View>

      <View style={styles.healthContainer}>
        <ProgressBar
          progress={healthPercent}
          color={isBoss ? '#B22222' : undefined}
          backgroundColor="#333"
          height={isBoss ? 24 : 20}
          useHealthGradient={!isBoss}
        />
        <Text style={[styles.healthText, isBoss && styles.bossHealthText]}>
          {formatNumber(enemy.currentHealth)} / {formatNumber(enemy.maxHealth)}
        </Text>
      </View>

      <Text style={[styles.tapHint, isBoss && styles.bossTapHint]}>
        {isBoss ? 'DEFEAT THE BOSS!' : 'TAP TO ATTACK!'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  bossContainer: {
    borderColor: '#FFD700',
    borderWidth: 2,
    backgroundColor: '#2a1a1a',
  },
  waitingText: {
    color: '#888',
    fontSize: 18,
    paddingVertical: 60,
  },
  waveInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  waveTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  bossWaveText: {
    color: '#FFD700',
  },
  bossLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: '#8B0000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerText: {
    color: '#ff9800',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bossTimerText: {
    color: '#FFD700',
  },
  timerBar: {
    width: 80,
  },
  bossIndicator: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  bossIndicatorText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
  },
  enemyContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  enemyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  bossIcon: {
    fontSize: 80,
  },
  enemyName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  bossName: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '800',
  },
  healthContainer: {
    width: '100%',
    marginBottom: 12,
  },
  healthText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  bossHealthText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
  },
  tapHint: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  bossTapHint: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '800',
  },
});
