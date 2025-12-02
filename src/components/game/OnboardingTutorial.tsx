import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export interface OnboardingStep {
  id: string;
  title: string;
  message: string;
  /** Position for the tooltip */
  tooltipPosition: 'top' | 'middle' | 'bottom';
  /** Highlight area (pixels from top, left, width, height) */
  highlight?: {
    top: number;
    left: number;
    width: number;
    height: number;
    borderRadius?: number;
  };
}

// Approximate positions for UI elements (these may need adjustment based on actual layout)
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Idle Rampage!',
    message: 'Let\'s show you around. Tap "Next" to continue.',
    tooltipPosition: 'middle',
    // No highlight for welcome
  },
  {
    id: 'resources',
    title: 'Resources',
    message: 'Scrap is used to upgrade buildings. Blueprints are earned from prestiging. Builders can be assigned to boost production.',
    tooltipPosition: 'middle',
    highlight: {
      top: 64, // Below status bar
      left: 0,
      width: SCREEN_WIDTH,
      height: 80,
      borderRadius: 0,
    },
  },
  {
    id: 'enemy',
    title: 'Tap to Attack!',
    message: 'Tap on enemies to deal damage. The faster you tap, the faster they fall!',
    tooltipPosition: 'bottom',
    highlight: {
      top: 154,
      left: 16,
      width: SCREEN_WIDTH - 32,
      height: 340,
      borderRadius: 12,
    },
  },
  {
    id: 'tabs',
    title: 'Navigation Tabs',
    message: 'Buildings shows your facilities. Depot has special items. Prestige lets you reset for permanent bonuses!',
    tooltipPosition: 'top',
    highlight: {
      top: 525,
      left: 0,
      width: SCREEN_WIDTH,
      height: 44,
      borderRadius: 0,
    },
  },
  {
    id: 'building',
    title: 'Scrap Collector',
    message: 'Your first building! It generates scrap over time. Assign builders with + to boost production, and upgrade when you can afford it!',
    tooltipPosition: 'top',
    highlight: {
      top: 577,
      left: 8,
      width: SCREEN_WIDTH - 16,
      height: 140,
      borderRadius: 12,
    },
  },
  {
    id: 'settings',
    title: 'Settings',
    message: 'Tap the menu icon to access settings, save your game, or get help.',
    tooltipPosition: 'middle',
    highlight: {
      top: 62,
      left: SCREEN_WIDTH - 46,
      width: 44,
      height: 44,
      borderRadius: 22,
    },
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    message: 'New buildings unlock as you progress through waves. Good luck, Commander!',
    tooltipPosition: 'middle',
    // No highlight for completion
  },
];

interface OnboardingTutorialProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  visible,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {duration: 300});
      scale.value = withSpring(1, {damping: 15});
    }
  }, [visible, opacity, scale]);

  const animateTransition = useCallback(() => {
    opacity.value = withTiming(0.5, {duration: 100});
    scale.value = withTiming(0.95, {duration: 100});
    setTimeout(() => {
      opacity.value = withTiming(1, {duration: 200});
      scale.value = withSpring(1, {damping: 15});
    }, 100);
  }, [opacity, scale]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      opacity.value = withTiming(0, {duration: 200});
      setTimeout(onComplete, 200);
    } else {
      animateTransition();
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 100);
    }
  }, [isLastStep, onComplete, opacity, animateTransition]);

  const handleSkip = useCallback(() => {
    opacity.value = withTiming(0, {duration: 200});
    setTimeout(onComplete, 200);
  }, [onComplete, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const highlight = currentStep.highlight;

  // Calculate tooltip position based on highlight area
  const getTooltipPosition = () => {
    if (currentStep.tooltipPosition === 'top') {
      return {top: 100};
    } else if (currentStep.tooltipPosition === 'bottom') {
      return {bottom: 180};
    } else {
      return {top: '35%' as unknown as number};
    }
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Backdrop with cutout for highlighted area */}
      <Animated.View style={[styles.backdropContainer, backdropAnimatedStyle]} pointerEvents="none">
        {highlight ? (
          <>
            {/* Top section */}
            <View style={[styles.backdropSection, {
              top: 0,
              left: 0,
              right: 0,
              height: highlight.top,
            }]} />
            {/* Left section */}
            <View style={[styles.backdropSection, {
              top: highlight.top,
              left: 0,
              width: highlight.left,
              height: highlight.height,
            }]} />
            {/* Right section */}
            <View style={[styles.backdropSection, {
              top: highlight.top,
              right: 0,
              width: SCREEN_WIDTH - highlight.left - highlight.width,
              height: highlight.height,
            }]} />
            {/* Bottom section */}
            <View style={[styles.backdropSection, {
              top: highlight.top + highlight.height,
              left: 0,
              right: 0,
              bottom: 0,
            }]} />
            {/* Highlight border */}
            <View style={[styles.highlightBorder, {
              top: highlight.top - 2,
              left: highlight.left - 2,
              width: highlight.width + 4,
              height: highlight.height + 4,
              borderRadius: (highlight.borderRadius ?? 0) + 2,
            }]} />
          </>
        ) : (
          <View style={styles.fullBackdrop} />
        )}
      </Animated.View>

      {/* Tooltip */}
      <Animated.View
        style={[styles.tooltipContainer, getTooltipPosition(), animatedStyle]}
        pointerEvents="box-none"
      >
        <View style={styles.tooltip}>
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  index === currentStepIndex && styles.stepDotActive,
                  index < currentStepIndex && styles.stepDotCompleted,
                ]}
              />
            ))}
          </View>

          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.message}>{currentStep.message}</Text>

          <View style={styles.buttonRow}>
            {!isLastStep && (
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>{isLastStep ? 'Start Playing!' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  backdropContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropSection: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  fullBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  highlightBorder: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00CED1',
    shadowColor: '#00CED1',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  tooltipContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#1a2a3a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#00CED1',
    shadowColor: '#00CED1',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
    width: '100%',
    maxWidth: SCREEN_WIDTH - 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  stepDotActive: {
    backgroundColor: '#00CED1',
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: '#00CED1',
  },
  title: {
    color: '#00CED1',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#00CED1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  nextText: {
    color: '#0a0a12',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
