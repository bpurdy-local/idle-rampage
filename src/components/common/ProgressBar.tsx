import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
  useHealthGradient?: boolean;
}

const interpolateColor = (progress: number): string => {
  if (progress > 0.6) {
    return '#4CAF50';
  } else if (progress > 0.3) {
    const t = (progress - 0.3) / 0.3;
    const r = Math.round(255 - (255 - 76) * t);
    const g = Math.round(152 + (175 - 152) * t);
    const b = Math.round(0 + 80 * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = progress / 0.3;
    const r = Math.round(244 - (244 - 255) * t);
    const g = Math.round(67 + (152 - 67) * t);
    const b = Math.round(54 - 54 * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#4CAF50',
  backgroundColor = '#333',
  height = 8,
  style,
  useHealthGradient = false,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const fillColor = useHealthGradient
    ? interpolateColor(clampedProgress)
    : color;

  return (
    <View style={[styles.container, {backgroundColor, height}, style]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: `${clampedProgress * 100}%`,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
