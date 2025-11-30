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
  /** Position hint for where the tooltip should appear */
  position: 'top' | 'middle' | 'bottom';
  /** Highlight area (percentage of screen or fixed pixels) */
  highlight?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Idle Rampage!',
    message: 'Let\'s show you around. Tap "Next" to continue.',
    position: 'middle',
  },
  {
    id: 'enemy',
    title: 'Tap to Attack!',
    message: 'Tap on enemies to deal damage. The faster you tap, the faster they fall!',
    position: 'middle',
  },
  {
    id: 'resources',
    title: 'Resources',
    message: 'Scrap is used to upgrade buildings. Blueprints are earned from prestiging. Builders can be assigned to buildings.',
    position: 'top',
  },
  {
    id: 'building',
    title: 'Scrap Collector',
    message: 'Your first building! It generates scrap over time. Assign builders with + to boost production, and upgrade it for even more!',
    position: 'bottom',
  },
  {
    id: 'tabs',
    title: 'Navigation Tabs',
    message: 'Buildings shows your facilities. Depot has special items. Prestige lets you reset for permanent bonuses!',
    position: 'bottom',
  },
  {
    id: 'settings',
    title: 'Settings',
    message: 'Tap the menu icon to access settings, save your game, or get help.',
    position: 'top',
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    message: 'New buildings unlock as you progress through waves. Good luck, Commander!',
    position: 'middle',
  },
];

interface OnboardingTutorialProps {
  /** Whether to show the onboarding (should be false if already completed) */
  visible: boolean;
  /** Called when onboarding is complete */
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
    // Quick fade out/in for step transition
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

  if (!visible) return null;

  const positionStyle = {
    top: currentStep.position === 'top' ? 120 : currentStep.position === 'middle' ? '35%' as const : undefined,
    bottom: currentStep.position === 'bottom' ? 200 : undefined,
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Semi-transparent backdrop */}
      <View style={styles.backdrop} pointerEvents="none" />

      {/* Tooltip */}
      <Animated.View
        style={[styles.container, positionStyle, animatedStyle]}
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
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
