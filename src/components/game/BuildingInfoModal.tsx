import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {BuildingType} from '../../models/Building';

interface BuildingInfoModalProps {
  visible: boolean;
  building: BuildingType | null;
  onClose: () => void;
}

const getRoleColor = (role: string): string => {
  switch (role) {
    case 'production':
      return '#4CAF50';
    case 'combat':
      return '#f44336';
    case 'research':
      return '#9c27b0';
    case 'utility':
      return '#2196F3';
    default:
      return '#888';
  }
};

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'production':
      return 'Production';
    case 'combat':
      return 'Combat';
    case 'research':
      return 'Research';
    case 'utility':
      return 'Utility';
    default:
      return role;
  }
};

const getBuildingDetails = (building: BuildingType): string => {
  switch (building.id) {
    case 'scrap_collector':
      return 'The foundation of your economy. Each builder assigned generates scrap passively over time. Upgrade to increase base output.';
    case 'recycler':
      return 'A more efficient scrap producer. Higher base production than Scrap Collectors makes this ideal for mid-game growth.';
    case 'factory':
      return 'Industrial-scale production facility. The highest scrap output per builder, essential for late-game progression.';
    case 'turret_bay':
      return 'Automated defense system. Builders here deal continuous damage to enemies without needing to tap. Great for AFK progress.';
    case 'weapons_lab':
      return 'Advanced combat research. Provides higher auto-damage per builder than Turret Bay, but unlocks later.';
    case 'command_center':
      return 'Strategic headquarters. Boosts ALL other building output globally. Even a few builders here significantly multiply your total production.';
    case 'training_ground':
      return 'Combat training facility. Each builder here increases your tap damage, making manual attacks more powerful.';
    default:
      return building.description;
  }
};

const getOutputLabel = (building: BuildingType): string => {
  switch (building.role) {
    case 'production':
      return 'Scrap/sec per builder';
    case 'combat':
      return building.id === 'training_ground' ? 'Tap damage per builder' : 'Auto-damage/sec per builder';
    case 'utility':
      return 'Global boost per builder';
    default:
      return 'Output per builder';
  }
};

export const BuildingInfoModal: React.FC<BuildingInfoModalProps> = ({
  visible,
  building,
  onClose,
}) => {
  if (!building) return null;

  const roleColor = getRoleColor(building.role);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, {borderColor: roleColor}]}>
          <View style={styles.header}>
            <View style={[styles.roleTag, {backgroundColor: roleColor}]}>
              <Text style={styles.roleText}>{getRoleLabel(building.role)}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{building.name}</Text>
          <Text style={styles.description}>{building.description}</Text>

          <ScrollView style={styles.detailsScroll}>
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>How it works</Text>
              <Text style={styles.detailsText}>{getBuildingDetails(building)}</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{getOutputLabel(building)}</Text>
                <Text style={[styles.statValue, {color: roleColor}]}>
                  {building.baseProduction}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Max Builders</Text>
                <Text style={styles.statValue}>{building.maxBuilders}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Base Cost</Text>
                <Text style={styles.statValue}>{building.baseCost}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Unlocks at Wave</Text>
                <Text style={styles.statValue}>{building.unlockWave}</Text>
              </View>
            </View>

            <View style={styles.tipsSection}>
              <Text style={styles.sectionTitle}>Tips</Text>
              <Text style={styles.tipText}>
                • Each level increases output by 50%
              </Text>
              <Text style={styles.tipText}>
                • Upgrade cost multiplies by {building.costMultiplier}x per level
              </Text>
              {building.role === 'utility' && (
                <Text style={styles.tipText}>
                  • Boosts stack multiplicatively with other bonuses
                </Text>
              )}
              {building.role === 'combat' && building.id !== 'training_ground' && (
                <Text style={styles.tipText}>
                  • Auto-damage works even when not tapping
                </Text>
              )}
              {building.id === 'training_ground' && (
                <Text style={styles.tipText}>
                  • Tap damage bonus applies to every tap attack
                </Text>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity style={[styles.doneBtn, {backgroundColor: roleColor}]} onPress={onClose}>
            <Text style={styles.doneBtnText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 28,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  detailsScroll: {
    maxHeight: 300,
  },
  detailsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsText: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statBox: {
    width: '50%',
    backgroundColor: '#0f0f1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    paddingRight: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  tipsSection: {
    backgroundColor: '#0f0f1a',
    padding: 12,
    borderRadius: 8,
  },
  tipText: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 20,
  },
  doneBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
