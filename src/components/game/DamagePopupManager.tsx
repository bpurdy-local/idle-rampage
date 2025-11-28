import React from 'react';
import {StyleSheet, View} from 'react-native';
import {DamagePopup, DamagePopupData} from './DamagePopup';

interface DamagePopupManagerProps {
  popups: DamagePopupData[];
  onPopupComplete: (id: string) => void;
}

export const DamagePopupManager: React.FC<DamagePopupManagerProps> = ({
  popups,
  onPopupComplete,
}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {popups.map(popup => (
        <DamagePopup key={popup.id} data={popup} onComplete={onPopupComplete} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
