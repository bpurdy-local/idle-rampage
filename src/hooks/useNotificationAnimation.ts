/**
 * Reusable animation hook for notification-style popups.
 * Provides entrance, hold, and exit animations with configurable timing.
 */
import {useEffect, useRef} from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

export interface NotificationAnimationConfig {
  /** Duration of entrance/exit animations in ms (default: 300) */
  duration?: number;
  /** How long to hold the notification visible in ms (default: 2000) */
  holdDuration?: number;
  /** Starting Y offset for slide-in (default: 20) */
  startY?: number;
  /** Exit Y offset for slide-out (default: -10) */
  exitY?: number;
  /** Starting scale (default: 0.8) */
  startScale?: number;
  /** Peak scale during entrance bounce (default: 1.1) */
  peakScale?: number;
  /** Exit scale (default: 0.9) */
  exitScale?: number;
}

const defaultConfig: Required<NotificationAnimationConfig> = {
  duration: 300,
  holdDuration: 2000,
  startY: 20,
  exitY: -10,
  startScale: 0.8,
  peakScale: 1.1,
  exitScale: 0.9,
};

export function useNotificationAnimation(
  onComplete: () => void,
  config: NotificationAnimationConfig = {},
) {
  const {duration, holdDuration, startY, exitY, startScale, peakScale, exitScale} = {
    ...defaultConfig,
    ...config,
  };

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(startY);
  const scale = useSharedValue(startScale);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Opacity: fade in, hold, fade out
    opacity.value = withSequence(
      withTiming(1, {duration, easing: Easing.out(Easing.cubic)}),
      withDelay(
        holdDuration,
        withTiming(0, {duration, easing: Easing.in(Easing.cubic)}, finished => {
          if (finished) {
            runOnJS(onCompleteRef.current)();
          }
        }),
      ),
    );

    // TranslateY: slide up, hold, slide up more
    translateY.value = withSequence(
      withTiming(0, {duration, easing: Easing.out(Easing.cubic)}),
      withDelay(
        holdDuration,
        withTiming(exitY, {duration, easing: Easing.in(Easing.cubic)}),
      ),
    );

    // Scale: bounce in, hold, shrink out
    scale.value = withSequence(
      withTiming(peakScale, {duration: duration / 2, easing: Easing.out(Easing.cubic)}),
      withTiming(1, {duration: duration / 2, easing: Easing.in(Easing.cubic)}),
      withDelay(
        holdDuration - duration / 2,
        withTiming(exitScale, {duration, easing: Easing.in(Easing.cubic)}),
      ),
    );
  }, [opacity, translateY, scale, duration, holdDuration, exitY, peakScale, exitScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}, {scale: scale.value}],
  }));

  return {animatedStyle, opacity, translateY, scale};
}
