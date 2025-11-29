import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {formatNumber} from '../../utils/formatters';

interface ResourceDisplayProps {
  scrap: number;
  blueprints: number;
  builders: {total: number; available: number};
  onSettingsPress?: () => void;
}

interface AnimatedValueProps {
  value: number;
  color?: string;
}

const AnimatedValue: React.FC<AnimatedValueProps> = ({
  value,
  color = '#fff',
}) => {
  const scale = useSharedValue(1);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      const increased = value > prevValue.current;
      prevValue.current = value;

      scale.value = withSequence(
        withTiming(increased ? 1.2 : 0.9, {
          duration: 100,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(1, {duration: 150, easing: Easing.in(Easing.quad)}),
      );
    }
  }, [value, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.Text style={[styles.value, {color}, animatedStyle]}>
      {formatNumber(value)}
    </Animated.Text>
  );
};

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  scrap,
  blueprints,
  builders,
  onSettingsPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.resource}>
        <Text style={styles.icon}>⚙️</Text>
        <AnimatedValue value={scrap} />
        <Text style={styles.label}>Scrap</Text>
      </View>
      <View style={styles.resource}>
        <Text style={styles.icon}>📘</Text>
        <AnimatedValue value={blueprints} color="#9c27b0" />
        <Text style={styles.label}>Blueprints</Text>
      </View>
      <View style={styles.resource}>
        <Text style={styles.icon}>👷</Text>
        <Text style={styles.value}>
          {builders.available}/{builders.total}
        </Text>
        <Text style={styles.label}>Builders</Text>
      </View>
      {onSettingsPress && (
        <TouchableOpacity style={styles.settingsBtn} onPress={onSettingsPress}>
          <Text style={styles.settingsIcon}>☰</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a2e',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  resource: {
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  settingsBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    color: '#fff',
    fontSize: 18,
  },
});
