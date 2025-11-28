import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
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

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {backgroundColor: getBackgroundColor()},
        getSizeStyles(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <Text style={[styles.text, getTextSize(), textStyle]}>{title}</Text>
    </TouchableOpacity>
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
