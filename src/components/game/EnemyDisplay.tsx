import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent} from 'react-native';
import {EnemyState} from '../../core/GameState';
import {ProgressBar} from '../common/ProgressBar';
import {formatNumber, formatTime} from '../../utils/formatters';

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
  if (!enemy) {
    return (
      <View style={styles.container}>
        <Text style={styles.waitingText}>Preparing Wave {currentWave}...</Text>
      </View>
    );
  }

  const healthPercent = enemy.currentHealth / enemy.maxHealth;
  const timerPercent = waveTimer / waveTimerMax;

  const handlePress = (event: GestureResponderEvent) => {
    const {pageX, pageY} = event.nativeEvent;
    onTap(pageX, pageY);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}>
      <View style={styles.waveInfo}>
        <Text style={styles.waveText}>Wave {currentWave}</Text>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(waveTimer)}</Text>
          <ProgressBar
            progress={timerPercent}
            color="#ff9800"
            backgroundColor="#333"
            height={4}
            style={styles.timerBar}
          />
        </View>
      </View>

      <View style={styles.enemyContainer}>
        <Text style={styles.enemyIcon}>🤖</Text>
        <Text style={styles.enemyName}>{enemy.name}</Text>
      </View>

      <View style={styles.healthContainer}>
        <ProgressBar
          progress={healthPercent}
          backgroundColor="#333"
          height={20}
          useHealthGradient
        />
        <Text style={styles.healthText}>
          {formatNumber(enemy.currentHealth)} / {formatNumber(enemy.maxHealth)}
        </Text>
      </View>

      <Text style={styles.tapHint}>TAP TO ATTACK!</Text>
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
  waveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
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
  timerBar: {
    width: 80,
  },
  enemyContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  enemyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  enemyName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
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
  tapHint: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
});
