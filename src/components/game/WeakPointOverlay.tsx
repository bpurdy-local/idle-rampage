import React, {useEffect, useState, useCallback, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

export interface WeakPoint {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // radius in pixels
  expiresAt: number;
}

interface WeakPointOverlayProps {
  /** Whether the scanner building is unlocked and active */
  isActive: boolean;
  /** Scanner tier (1-5) affects base size and duration of weak points */
  scannerTier: number;
  /** Scanner level affects spawn rate and adds to weak point count/damage */
  scannerLevel: number;
  /** Number of builders assigned - affects weak point count (more builders = more targets) */
  assignedBuilders: number;
  /** Callback when weak points change, for hit detection */
  onWeakPointsChange: (points: WeakPoint[]) => void;
  /** Bounds of the tappable area (enemy display) */
  bounds: {width: number; height: number};
}

// Base config per tier (size and duration only - count/damage scale with level+builders)
const TIER_CONFIG = {
  1: {baseSize: 28, duration: 1500, baseDamageMultiplier: 1.5},
  2: {baseSize: 32, duration: 1800, baseDamageMultiplier: 1.8},
  3: {baseSize: 36, duration: 2000, baseDamageMultiplier: 2.0},
  4: {baseSize: 40, duration: 2200, baseDamageMultiplier: 2.5},
  5: {baseSize: 44, duration: 2500, baseDamageMultiplier: 3.0},
};

// Max weak points caps at 4, even with high builders/levels
const MAX_WEAK_POINTS = 4;
// Damage multiplier caps to prevent it being too overpowered
const MAX_DAMAGE_MULTIPLIER = 8.0;

/**
 * Calculate max weak points based on level and builders.
 * Starts at 1, reaches max 4 with enough investment.
 * - Each 5 levels adds +0.5 max points
 * - Each 5 builders adds +0.5 max points
 * This means you need significant investment to reach 4 points.
 */
const calculateMaxWeakPoints = (level: number, builders: number): number => {
  const levelBonus = Math.floor(level / 5) * 0.5;
  const builderBonus = Math.floor(builders / 5) * 0.5;
  const totalPoints = 1 + levelBonus + builderBonus;
  return Math.min(MAX_WEAK_POINTS, Math.floor(totalPoints));
};

/**
 * Calculate damage multiplier based on tier, level, and builders.
 * Base multiplier from tier + scaling from level and builders.
 * - Level adds +0.1x per level
 * - Builders add +0.05x per builder (diminishing value but additive with training)
 */
const calculateDamageMultiplier = (tier: number, level: number, builders: number): number => {
  const t = Math.min(5, Math.max(1, tier)) as 1 | 2 | 3 | 4 | 5;
  const config = TIER_CONFIG[t];
  const baseDamage = config.baseDamageMultiplier;
  const levelBonus = (level - 1) * 0.1; // +0.1x per level above 1
  const builderBonus = builders * 0.05; // +0.05x per builder
  return Math.min(MAX_DAMAGE_MULTIPLIER, baseDamage + levelBonus + builderBonus);
};

const WeakPointMarker: React.FC<{
  point: WeakPoint;
  onExpire: (id: string) => void;
}> = ({point, onExpire}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const pulseOpacity = useSharedValue(0.8);

  useEffect(() => {
    const timeUntilExpire = point.expiresAt - Date.now();
    if (timeUntilExpire <= 0) {
      onExpire(point.id);
      return;
    }

    // Fade in
    opacity.value = withTiming(1, {duration: 150});
    scale.value = withTiming(1, {duration: 200, easing: Easing.out(Easing.back(1.5))});

    // Pulse animation
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, {duration: 300}),
        withTiming(0.9, {duration: 300}),
      ),
      -1,
      true,
    );

    // Schedule fade out before expiration
    const fadeOutDelay = Math.max(0, timeUntilExpire - 300);
    const fadeTimeout = setTimeout(() => {
      opacity.value = withTiming(0, {duration: 250});
      scale.value = withTiming(0.5, {duration: 250});
    }, fadeOutDelay);

    // Schedule removal
    const expireTimeout = setTimeout(() => {
      onExpire(point.id);
    }, timeUntilExpire);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(expireTimeout);
      cancelAnimation(opacity);
      cancelAnimation(scale);
      cancelAnimation(pulseOpacity);
    };
  }, [point.id, point.expiresAt, opacity, scale, pulseOpacity, onExpire]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.weakPoint,
        {
          left: `${point.x}%`,
          top: `${point.y}%`,
          width: point.size * 2,
          height: point.size * 2,
          marginLeft: -point.size,
          marginTop: -point.size,
        },
        containerStyle,
      ]}
      pointerEvents="none"
    >
      {/* Outer pulse ring */}
      <Animated.View style={[styles.pulseRing, pulseStyle]} />
      {/* Inner target */}
      <View style={styles.innerTarget}>
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />
        <View style={styles.centerDot} />
      </View>
    </Animated.View>
  );
};

export const WeakPointOverlay: React.FC<WeakPointOverlayProps> = ({
  isActive,
  scannerTier,
  scannerLevel,
  assignedBuilders,
  onWeakPointsChange,
  bounds,
}) => {
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idCounterRef = useRef(0);

  const tier = Math.min(5, Math.max(1, scannerTier)) as 1 | 2 | 3 | 4 | 5;
  const config = TIER_CONFIG[tier];
  const maxPoints = calculateMaxWeakPoints(scannerLevel, assignedBuilders);

  const spawnWeakPoint = useCallback(() => {
    const now = Date.now();

    setWeakPoints(current => {
      // Remove expired points
      const active = current.filter(p => p.expiresAt > now);

      // Don't spawn if at max
      if (active.length >= maxPoints) {
        return active;
      }

      // Spawn new weak point at random position (avoiding edges)
      const padding = 15; // percentage from edges
      const newPoint: WeakPoint = {
        id: `wp_${++idCounterRef.current}`,
        x: padding + Math.random() * (100 - padding * 2),
        y: padding + Math.random() * (100 - padding * 2),
        size: config.baseSize + Math.random() * 8,
        expiresAt: now + config.duration,
      };

      return [...active, newPoint];
    });
  }, [maxPoints, config.baseSize, config.duration]);

  const handleExpire = useCallback((id: string) => {
    setWeakPoints(current => current.filter(p => p.id !== id));
  }, []);

  // Notify parent of weak point changes
  useEffect(() => {
    onWeakPointsChange(weakPoints);
  }, [weakPoints, onWeakPointsChange]);

  // Spawn interval based on level
  useEffect(() => {
    if (!isActive) {
      setWeakPoints([]);
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
      return;
    }

    // Base spawn rate: every 2s, improved by level (min 0.8s)
    const baseInterval = 2000;
    const levelReduction = scannerLevel * 50; // 50ms faster per level
    const interval = Math.max(800, baseInterval - levelReduction);

    // Initial spawn
    spawnWeakPoint();

    spawnIntervalRef.current = setInterval(spawnWeakPoint, interval);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
    };
  }, [isActive, scannerLevel, spawnWeakPoint]);

  if (!isActive || weakPoints.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, {width: bounds.width, height: bounds.height}]} pointerEvents="none">
      {weakPoints.map(point => (
        <WeakPointMarker key={point.id} point={point} onExpire={handleExpire} />
      ))}
    </View>
  );
};

// Helper to check if a tap hit a weak point
export const checkWeakPointHit = (
  tapX: number,
  tapY: number,
  weakPoints: WeakPoint[],
  bounds: {width: number; height: number},
): WeakPoint | null => {
  const now = Date.now();

  for (const point of weakPoints) {
    if (point.expiresAt <= now) continue;

    // Convert percentage to pixels
    const pointX = (point.x / 100) * bounds.width;
    const pointY = (point.y / 100) * bounds.height;

    // Check distance
    const dx = tapX - pointX;
    const dy = tapY - pointY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= point.size) {
      return point;
    }
  }

  return null;
};

/**
 * Get damage multiplier for weak point hits.
 * Scales with tier, level, and assigned builders.
 * This multiplier is ADDITIVE with training facility bonus, not multiplicative.
 */
export const getWeakPointDamageMultiplier = (
  tier: number,
  level: number = 1,
  assignedBuilders: number = 0,
): number => {
  return calculateDamageMultiplier(tier, level, assignedBuilders);
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  weakPoint: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#00ffff',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  innerTarget: {
    width: '60%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairH: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#00ffff',
  },
  crosshairV: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#00ffff',
  },
  centerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff0066',
  },
});
