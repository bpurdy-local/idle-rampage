import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {BuildingState} from '../../core/GameState';
import {BuildingType} from '../../models/Building';
import {ProgressBar} from '../common/ProgressBar';
import {formatNumber} from '../../utils/formatters';

interface BuildingCardProps {
  building: BuildingState;
  buildingType: BuildingType;
  production: number;
  upgradeCost: number;
  canAffordUpgrade: boolean;
  onAssignBuilder: () => void;
  onUnassignBuilder: () => void;
  onUpgrade: () => void;
  availableBuilders: number;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  buildingType,
  production,
  upgradeCost,
  canAffordUpgrade,
  onAssignBuilder,
  onUnassignBuilder,
  onUpgrade,
  availableBuilders,
}) => {
  const canAssign = availableBuilders > 0 && building.assignedBuilders < buildingType.maxBuilders;
  const canUnassign = building.assignedBuilders > 0;

  const getRoleColor = () => {
    switch (buildingType.role) {
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

  return (
    <View style={[styles.container, {borderLeftColor: getRoleColor()}]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{buildingType.name}</Text>
          <Text style={styles.level}>Lv.{building.level}</Text>
        </View>
        <Text style={styles.description}>{buildingType.description}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Builders</Text>
          <Text style={styles.statValue}>
            {building.assignedBuilders}/{buildingType.maxBuilders}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Output</Text>
          <Text style={styles.statValue}>{formatNumber(production)}/s</Text>
        </View>
      </View>

      {building.upgradeProgress > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Upgrading...</Text>
          <ProgressBar
            progress={building.upgradeProgress / 100}
            color="#ff9800"
            height={6}
          />
        </View>
      )}

      <View style={styles.actions}>
        <View style={styles.builderActions}>
          <TouchableOpacity
            style={[styles.builderBtn, !canUnassign && styles.btnDisabled]}
            onPress={onUnassignBuilder}
            disabled={!canUnassign}>
            <Text style={styles.builderBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.builderCount}>👷 {building.assignedBuilders}</Text>
          <TouchableOpacity
            style={[styles.builderBtn, !canAssign && styles.btnDisabled]}
            onPress={onAssignBuilder}
            disabled={!canAssign}>
            <Text style={styles.builderBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.upgradeBtn, !canAffordUpgrade && styles.btnDisabled]}
          onPress={onUpgrade}
          disabled={!canAffordUpgrade}>
          <Text style={styles.upgradeBtnText}>
            Upgrade ({formatNumber(upgradeCost)})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  level: {
    color: '#ff9800',
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
    backgroundColor: '#0f0f1a',
    borderRadius: 6,
    padding: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 10,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressLabel: {
    color: '#ff9800',
    fontSize: 10,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  builderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  builderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: '#333',
  },
  builderBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  builderCount: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 12,
  },
  upgradeBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
