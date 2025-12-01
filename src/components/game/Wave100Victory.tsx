import React from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {useEffect} from 'react';

interface Wave100VictoryProps {
  visible: boolean;
  blueprintsEarned: number;
  onPrestige: () => void;
  onContinue: () => void;
}

export const Wave100Victory: React.FC<Wave100VictoryProps> = ({
  visible,
  blueprintsEarned,
  onPrestige,
  onContinue,
}) => {
  const titleScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      // Reset and animate in
      titleScale.value = 0;
      contentOpacity.value = 0;
      buttonsTranslateY.value = 50;

      // Title bounces in
      titleScale.value = withDelay(
        200,
        withSpring(1, {damping: 8, stiffness: 100}),
      );

      // Content fades in
      contentOpacity.value = withDelay(
        600,
        withTiming(1, {duration: 500, easing: Easing.out(Easing.quad)}),
      );

      // Buttons slide up
      buttonsTranslateY.value = withDelay(
        800,
        withSpring(0, {damping: 12, stiffness: 100}),
      );
    }
  }, [visible, titleScale, contentOpacity, buttonsTranslateY]);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{scale: titleScale.value}],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    transform: [{translateY: buttonsTranslateY.value}],
    opacity: contentOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Victory Title */}
          <Animated.View style={[styles.titleContainer, titleStyle]}>
            <Text style={styles.victoryText}>VICTORY!</Text>
            <Text style={styles.waveText}>Wave 100 Complete</Text>
          </Animated.View>

          {/* Message Content */}
          <Animated.View style={[styles.content, contentStyle]}>
            <Text style={styles.congratsText}>
              Congratulations, Commander!
            </Text>
            <Text style={styles.messageText}>
              You've conquered the final wave and proven yourself as a legendary
              leader. Your builders have dismantled every robot threat in the
              wasteland!
            </Text>

            <View style={styles.rewardBox}>
              <Text style={styles.rewardLabel}>Prestige Reward</Text>
              <Text style={styles.blueprintAmount}>
                {blueprintsEarned.toLocaleString()} Blueprints
              </Text>
              <Text style={styles.rewardHint}>
                Use blueprints to unlock permanent upgrades
              </Text>
            </View>

            <Text style={styles.choiceText}>
              Will you claim your victory and start anew with powerful bonuses,
              or continue into endless mode?
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
            <TouchableOpacity
              style={styles.prestigeButton}
              onPress={onPrestige}
              activeOpacity={0.8}>
              <Text style={styles.prestigeButtonText}>PRESTIGE NOW</Text>
              <Text style={styles.prestigeSubtext}>
                Claim {blueprintsEarned.toLocaleString()} blueprints
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
              activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>Continue Playing</Text>
              <Text style={styles.continueSubtext}>
                Enter endless mode (no extra rewards)
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  victoryText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: '#FF8C00',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 10,
    letterSpacing: 4,
  },
  waveText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00ff88',
    marginTop: 4,
  },
  content: {
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  rewardBox: {
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  blueprintAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00BFFF',
    marginBottom: 4,
  },
  rewardHint: {
    fontSize: 11,
    color: '#666',
  },
  choiceText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    marginTop: 24,
    gap: 12,
  },
  prestigeButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1BEE7',
  },
  prestigeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  prestigeSubtext: {
    color: '#E1BEE7',
    fontSize: 12,
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  continueSubtext: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
});
