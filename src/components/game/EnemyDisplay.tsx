import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolateColor,
  cancelAnimation,
} from 'react-native-reanimated';
import {EnemyState} from '../../core/GameState';
import {formatNumber, formatTime} from '../../utils/formatters';
import {BOSS_CONFIG} from '../../data/enemies';

interface EnemyDisplayProps {
  enemy: EnemyState | null;
  waveTimer: number;
  waveTimerMax: number;
  currentWave: number;
  onTap: (x?: number, y?: number) => void;
}

// Threat level classification based on enemy tier
const getThreatClass = (enemyName: string): {label: string; color: string} => {
  const name = enemyName.toLowerCase();
  if (name.includes('ai unit')) return {label: 'OMEGA', color: '#ff0040'};
  if (name.includes('mech')) return {label: 'SEVERE', color: '#ff4400'};
  if (name.includes('loader')) return {label: 'HIGH', color: '#ff8800'};
  if (name.includes('drone')) return {label: 'MODERATE', color: '#ffcc00'};
  return {label: 'LOW', color: '#00ff88'};
};

// Animated scan line component
const ScanLine: React.FC = () => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(180, {duration: 3000, easing: Easing.linear}),
      -1,
      false,
    );
    return () => cancelAnimation(translateY);
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[styles.scanLine, animatedStyle]} pointerEvents="none" />
  );
};

// Get emoji for enemy type
const getEnemyEmoji = (enemyName: string, isBoss: boolean): string => {
  if (isBoss) return '👹';
  const name = enemyName.toLowerCase();
  if (name.includes('ai unit')) return '🤖';
  if (name.includes('mech')) return '🦾';
  if (name.includes('loader')) return '🦿';
  if (name.includes('drone')) return '🛸';
  return '🤖';
};

// Animated enemy sprite with effects
const EnemySprite: React.FC<{
  healthPercent: number;
  isBoss: boolean;
  enemyName: string;
  threatColor: string;
}> = ({healthPercent, isBoss, enemyName, threatColor}) => {
  const pulse = useSharedValue(1);
  const shake = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Idle floating animation
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0.95, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );

    // Glow pulses faster at low health
    const glowDuration = Math.max(200, 800 * healthPercent);
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, {duration: glowDuration}),
        withTiming(0.2, {duration: glowDuration}),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(glowOpacity);
    };
  }, [pulse, glowOpacity, healthPercent]);

  // Shake when health is low
  useEffect(() => {
    if (healthPercent < 0.3) {
      shake.value = withRepeat(
        withSequence(
          withTiming(-3, {duration: 50}),
          withTiming(3, {duration: 50}),
          withTiming(-2, {duration: 50}),
          withTiming(2, {duration: 50}),
          withTiming(0, {duration: 50}),
        ),
        -1,
        false,
      );
    } else {
      shake.value = withTiming(0, {duration: 100});
    }
    return () => cancelAnimation(shake);
  }, [healthPercent, shake]);

  const animatedSpriteStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: pulse.value},
      {translateX: shake.value},
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Determine glow color based on health
  const getGlowColor = () => {
    if (healthPercent > 0.6) return threatColor;
    if (healthPercent > 0.3) return '#ff8800';
    return '#ff0000';
  };

  const emoji = getEnemyEmoji(enemyName, isBoss);
  const spriteSize = isBoss ? 72 : 56;
  const glowSize = isBoss ? 120 : 100;

  return (
    <View style={styles.spriteContainer}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.spriteGlowOuter,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            borderColor: getGlowColor(),
          },
          animatedGlowStyle,
        ]}
      />

      {/* Inner glow */}
      <Animated.View
        style={[
          styles.spriteGlowInner,
          {
            width: glowSize - 20,
            height: glowSize - 20,
            borderRadius: (glowSize - 20) / 2,
            backgroundColor: getGlowColor(),
          },
          animatedGlowStyle,
        ]}
      />

      {/* Targeting reticle */}
      <View style={[styles.reticle, {borderColor: threatColor}]}>
        <View style={[styles.reticleLineH, {backgroundColor: threatColor}]} />
        <View style={[styles.reticleLineV, {backgroundColor: threatColor}]} />
      </View>

      {/* Enemy sprite */}
      <Animated.Text
        style={[
          styles.spriteEmoji,
          {fontSize: spriteSize},
          animatedSpriteStyle,
        ]}>
        {emoji}
      </Animated.Text>

      {/* Damage sparks when low health */}
      {healthPercent < 0.5 && (
        <View style={styles.sparkContainer}>
          <Text style={styles.spark}>⚡</Text>
        </View>
      )}

      {/* Critical damage indicator */}
      {healthPercent < 0.25 && (
        <View style={styles.criticalContainer}>
          <Text style={styles.criticalText}>!</Text>
        </View>
      )}
    </View>
  );
};

// Grid background
const GridBackground: React.FC = () => {
  return (
    <View style={styles.gridContainer} pointerEvents="none">
      {/* Horizontal lines */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View key={`h${i}`} style={[styles.gridLineH, {top: `${i * 20}%`}]} />
      ))}
      {/* Vertical lines */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View key={`v${i}`} style={[styles.gridLineV, {left: `${i * 20}%`}]} />
      ))}
    </View>
  );
};

// Corner brackets for tactical feel
const CornerBrackets: React.FC<{color: string}> = ({color}) => {
  const bracketStyle = {borderColor: color};
  return (
    <>
      <View style={[styles.cornerTL, bracketStyle]} pointerEvents="none" />
      <View style={[styles.cornerTR, bracketStyle]} pointerEvents="none" />
      <View style={[styles.cornerBL, bracketStyle]} pointerEvents="none" />
      <View style={[styles.cornerBR, bracketStyle]} pointerEvents="none" />
    </>
  );
};

// Segmented health bar with tactical styling
const TacticalHealthBar: React.FC<{
  healthPercent: number;
  isBoss: boolean;
}> = ({healthPercent, isBoss}) => {
  const segments = 20;
  const filledSegments = Math.ceil(healthPercent * segments);

  const getSegmentColor = (index: number, total: number) => {
    const percent = index / total;
    if (percent > 0.6) return '#00ff88';
    if (percent > 0.3) return '#ffcc00';
    return '#ff4444';
  };

  return (
    <View style={styles.tacticalHealthContainer}>
      <Text style={styles.healthLabel}>HULL INTEGRITY</Text>
      <View style={[styles.segmentedBar, isBoss && styles.segmentedBarBoss]}>
        {Array.from({length: segments}).map((_, i) => (
          <View
            key={i}
            style={[
              styles.healthSegment,
              {
                backgroundColor: i < filledSegments
                  ? getSegmentColor(i, segments)
                  : '#1a1a2e',
                opacity: i < filledSegments ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.healthValue, isBoss && styles.healthValueBoss]}>
        {Math.round(healthPercent * 100)}%
      </Text>
    </View>
  );
};

// Blinking cursor for terminal effect
const BlinkingCursor: React.FC = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, {duration: 500}),
        withTiming(1, {duration: 500}),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.Text style={[styles.cursor, animatedStyle]}>_</Animated.Text>;
};

export const EnemyDisplay: React.FC<EnemyDisplayProps> = ({
  enemy,
  waveTimer,
  waveTimerMax,
  currentWave,
  onTap,
}) => {
  const wavesUntilBoss = BOSS_CONFIG.waveInterval - (currentWave % BOSS_CONFIG.waveInterval);
  const showBossWarning = wavesUntilBoss <= 3 && wavesUntilBoss < BOSS_CONFIG.waveInterval;

  // Hit flash animation
  const hitFlash = useSharedValue(0);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      hitFlash.value,
      [0, 1],
      ['#0a0a12', '#1a0a0a'],
    ),
  }));

  if (!enemy) {
    return (
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        <GridBackground />
        <CornerBrackets color="#333" />
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingLabel}>SCANNING</Text>
          <Text style={styles.waitingText}>
            WAVE {currentWave} INCOMING
            <BlinkingCursor />
          </Text>
        </View>
      </Animated.View>
    );
  }

  const healthPercent = enemy.maxHealth > 0 ? enemy.currentHealth / enemy.maxHealth : 0;
  const timerPercent = waveTimerMax > 0 ? waveTimer / waveTimerMax : 0;
  const isBoss = enemy.isBoss === true;
  const threat = getThreatClass(enemy.name);
  const isTimerCritical = timerPercent < 0.25;

  const handlePress = (event: GestureResponderEvent) => {
    const {pageX, pageY} = event.nativeEvent;
    // Trigger hit flash
    hitFlash.value = withSequence(
      withTiming(1, {duration: 50}),
      withTiming(0, {duration: 150}),
    );
    onTap(pageX, pageY);
  };

  const accentColor = isBoss ? '#FFD700' : threat.color;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.95}>
      <Animated.View style={[styles.container, isBoss && styles.bossContainer, containerAnimatedStyle]}>
        <GridBackground />
        <ScanLine />
        <CornerBrackets color={accentColor} />

        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.waveInfoContainer}>
            <Text style={styles.systemLabel}>WAVE</Text>
            <Text style={[styles.waveNumber, isBoss && styles.waveNumberBoss]}>
              {String(currentWave).padStart(3, '0')}
            </Text>
          </View>

          <View style={styles.threatContainer}>
            {isBoss ? (
              <View style={styles.bossTag}>
                <Text style={styles.bossTagText}>!! BOSS !!</Text>
              </View>
            ) : (
              <>
                <Text style={styles.threatLabel}>THREAT</Text>
                <Text style={[styles.threatLevel, {color: threat.color}]}>
                  {threat.label}
                </Text>
              </>
            )}
          </View>

          <View style={styles.timerInfoContainer}>
            <Text style={styles.systemLabel}>TIME</Text>
            <Text style={[
              styles.timerValue,
              isTimerCritical && styles.timerCritical,
              isBoss && styles.timerBoss,
            ]}>
              {formatTime(waveTimer)}
            </Text>
          </View>
        </View>

        {/* Timer bar */}
        <View style={styles.timerBarContainer}>
          <View
            style={[
              styles.timerBarFill,
              {
                width: `${timerPercent * 100}%`,
                backgroundColor: isTimerCritical ? '#ff4444' : (isBoss ? '#FFD700' : '#00ff88'),
              },
            ]}
          />
        </View>

        {/* Boss warning - fixed height container to prevent layout shift */}
        <View style={styles.bossWarningContainer}>
          {!isBoss && showBossWarning && (
            <View style={styles.bossWarning}>
              <Text style={styles.bossWarningText}>
                ⚠ BOSS CONTACT IN {wavesUntilBoss} WAVE{wavesUntilBoss !== 1 ? 'S' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Main enemy display */}
        <View style={styles.mainDisplay}>
          <EnemySprite
            healthPercent={healthPercent}
            isBoss={isBoss}
            enemyName={enemy.name}
            threatColor={threat.color}
          />
        </View>

        {/* Enemy identification */}
        <View style={styles.enemyIdContainer}>
          <Text style={styles.enemyIdLabel}>HOSTILE ID</Text>
          <Text style={[styles.enemyIdName, isBoss && styles.enemyIdNameBoss]}>
            {enemy.name.toUpperCase()}
          </Text>
        </View>

        {/* Health display */}
        <TacticalHealthBar healthPercent={healthPercent} isBoss={isBoss} />

        {/* Footer stats */}
        <View style={styles.footerRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>HP</Text>
            <Text style={styles.statValue}>{formatNumber(enemy.currentHealth)}</Text>
          </View>
          <View style={styles.actionPrompt}>
            <Text style={[styles.actionText, isBoss && styles.actionTextBoss]}>
              {isBoss ? '[ ENGAGE BOSS ]' : '[ TAP TO ENGAGE ]'}
            </Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>MAX</Text>
            <Text style={styles.statValue}>{formatNumber(enemy.maxHealth)}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a12',
    borderRadius: 4,
    padding: 12,
    margin: 12,
    borderWidth: 1,
    borderColor: '#1a3a1a',
    position: 'relative',
    overflow: 'hidden',
  },
  bossContainer: {
    borderColor: '#FFD700',
    borderWidth: 2,
    backgroundColor: '#12080a',
  },

  // Grid background
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#00ff88',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#00ff88',
  },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },

  // Corner brackets
  cornerTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },

  // Waiting state
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  waitingLabel: {
    color: '#00ff88',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4,
    marginBottom: 8,
  },
  waitingText: {
    color: '#00ff88',
    fontSize: 16,
    fontFamily: 'Courier',
    fontWeight: '700',
    letterSpacing: 2,
  },
  cursor: {
    color: '#00ff88',
    fontWeight: '700',
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  waveInfoContainer: {
    alignItems: 'flex-start',
  },
  systemLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
  },
  waveNumber: {
    color: '#00ff88',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  waveNumberBoss: {
    color: '#FFD700',
  },
  threatContainer: {
    alignItems: 'center',
  },
  threatLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
  },
  threatLevel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bossTag: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  bossTagText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  timerInfoContainer: {
    alignItems: 'flex-end',
  },
  timerValue: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  timerCritical: {
    color: '#ff4444',
  },
  timerBoss: {
    color: '#FFD700',
  },

  // Timer bar
  timerBarContainer: {
    height: 3,
    backgroundColor: '#1a1a2e',
    borderRadius: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 1,
  },

  // Boss warning
  bossWarningContainer: {
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bossWarning: {
    backgroundColor: 'rgba(139, 0, 0, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  bossWarningText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Main display
  mainDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },

  // Enemy sprite
  spriteContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spriteGlowOuter: {
    position: 'absolute',
    borderWidth: 2,
  },
  spriteGlowInner: {
    position: 'absolute',
    opacity: 0.15,
  },
  reticle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderWidth: 1,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  reticleLineH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    opacity: 0.5,
  },
  reticleLineV: {
    position: 'absolute',
    width: 1,
    height: '100%',
    opacity: 0.5,
  },
  spriteEmoji: {
    textAlign: 'center',
  },
  sparkContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  spark: {
    fontSize: 16,
  },
  criticalContainer: {
    position: 'absolute',
    top: 5,
    left: 15,
    backgroundColor: '#ff0000',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  criticalText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },

  // Enemy ID
  enemyIdContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  enemyIdLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 2,
  },
  enemyIdName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  enemyIdNameBoss: {
    color: '#FFD700',
    fontSize: 18,
  },

  // Tactical health bar
  tacticalHealthContainer: {
    marginBottom: 12,
  },
  healthLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
    textAlign: 'center',
  },
  segmentedBar: {
    flexDirection: 'row',
    height: 16,
    gap: 2,
    marginBottom: 4,
  },
  segmentedBarBoss: {
    height: 20,
  },
  healthSegment: {
    flex: 1,
    borderRadius: 1,
  },
  healthValue: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Courier',
  },
  healthValueBoss: {
    color: '#FFD700',
    fontSize: 12,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBlock: {
    alignItems: 'center',
    minWidth: 60,
  },
  statLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statValue: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  actionPrompt: {
    flex: 1,
    alignItems: 'center',
  },
  actionText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionTextBoss: {
    color: '#FFD700',
    fontSize: 13,
  },
});
