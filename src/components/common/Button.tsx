import React from 'react';
import {StyleSheet, Text, ViewStyle, TextStyle, Pressable} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);

  const getBackgroundColor = () => {
    if (disabled) return '#666';
    switch (variant) {
      case 'primary':
        return '#4CAF50';
      case 'secondary':
        return '#2196F3';
      case 'danger':
        return '#f44336';
      default:
        return '#4CAF50';
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {paddingVertical: 6, paddingHorizontal: 12};
      case 'large':
        return {paddingVertical: 16, paddingHorizontal: 32};
      default:
        return {paddingVertical: 12, paddingHorizontal: 24};
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return {fontSize: 12};
      case 'large':
        return {fontSize: 18};
      default:
        return {fontSize: 14};
    }
  };

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, {damping: 15, stiffness: 400});
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 400});
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.button,
        {backgroundColor: getBackgroundColor()},
        getSizeStyles(),
        style,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}>
      <Text style={[styles.text, getTextSize(), textStyle]}>{title}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});
