import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native';
import {Card} from '../common/Card';
import {Button} from '../common/Button';
import {ProgressBar} from '../common/ProgressBar';
import {formatNumber} from '../../utils/formatters';

interface PrestigeUpgradeItem {
  id: string;
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  nextCost: number | null;
  canAfford: boolean;
  currentEffect: number;
}

interface PrestigePanelProps {
  blueprints: number;
  prestigeCount: number;
  currentWave: number;
  canPrestige: boolean;
  blueprintsToEarn: number;
  prestigeRequirement: number;
  upgrades: PrestigeUpgradeItem[];
  // Builder purchase props
  totalBuilders: number;
  maxBuilders: number;
  builderCost: number;
  canAffordBuilder: boolean;
  onPrestige: () => void;
  onPurchaseUpgrade: (upgradeId: string) => void;
  onPurchaseBuilder: () => void;
  onClose: () => void;
}

export const PrestigePanel: React.FC<PrestigePanelProps> = ({
  blueprints,
  prestigeCount,
  currentWave,
  canPrestige,
  blueprintsToEarn,
  prestigeRequirement,
  upgrades,
  totalBuilders,
  maxBuilders,
  builderCost,
  canAffordBuilder,
  onPrestige,
  onPurchaseUpgrade,
  onPurchaseBuilder,
  onClose,
}) => {
  const isAtMaxBuilders = totalBuilders >= maxBuilders;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prestige</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtnTouchable} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatNumber(blueprints)}</Text>
          <Text style={styles.statLabel}>Blueprints</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{prestigeCount}</Text>
          <Text style={styles.statLabel}>Prestiges</Text>
        </View>
      </View>

      <Card style={styles.prestigeCard}>
        <Text style={styles.sectionTitle}>Reset Progress</Text>
        <Text style={styles.prestigeInfo}>
          Wave {currentWave} / {prestigeRequirement} required
        </Text>
        <ProgressBar
          progress={Math.min(currentWave / prestigeRequirement, 1)}
          color={canPrestige ? '#4CAF50' : '#666'}
          height={8}
          style={styles.progressBar}
        />
        {canPrestige ? (
          <>
            <Text style={styles.earnText}>
              Earn {formatNumber(blueprintsToEarn)} Blueprints
            </Text>
            <Button
              title="Prestige Now"
              onPress={onPrestige}
              variant="primary"
              style={styles.prestigeBtn}
            />
          </>
        ) : (
          <Text style={styles.notReadyText}>
            Reach wave {prestigeRequirement} to prestige
          </Text>
        )}
      </Card>

      <Card style={styles.builderCard}>
        <View style={styles.builderHeader}>
          <Text style={styles.sectionTitle}>Buy Builders</Text>
          <Text style={styles.builderCount}>
            {totalBuilders}/{maxBuilders}
          </Text>
        </View>
        <Text style={styles.builderDesc}>
          Permanently increase your builder pool
        </Text>
        {isAtMaxBuilders ? (
          <Text style={styles.maxedText}>MAX BUILDERS</Text>
        ) : (
          <TouchableOpacity
            style={[
              styles.buyBtn,
              !canAffordBuilder && styles.buyBtnDisabled,
            ]}
            onPress={onPurchaseBuilder}
            disabled={!canAffordBuilder}>
            <Text style={styles.buyBtnText}>
              +1 Builder for {formatNumber(builderCost)} BP
            </Text>
          </TouchableOpacity>
        )}
      </Card>

      <Text style={styles.sectionTitle}>Upgrades</Text>
      <ScrollView style={styles.upgradeList}>
        {upgrades.map(upgrade => (
          <View key={upgrade.id} style={styles.upgradeItem}>
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeName}>{upgrade.name}</Text>
              <Text style={styles.upgradeLevel}>
                Lv.{upgrade.currentLevel}/{upgrade.maxLevel}
              </Text>
            </View>
            <Text style={styles.upgradeDesc}>{upgrade.description}</Text>
            {upgrade.nextCost !== null && (
              <TouchableOpacity
                style={[
                  styles.buyBtn,
                  !upgrade.canAfford && styles.buyBtnDisabled,
                ]}
                onPress={() => onPurchaseUpgrade(upgrade.id)}
                disabled={!upgrade.canAfford}>
                <Text style={styles.buyBtnText}>
                  {formatNumber(upgrade.nextCost)} BP
                </Text>
              </TouchableOpacity>
            )}
            {upgrade.nextCost === null && (
              <Text style={styles.maxedText}>MAXED</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  closeBtnTouchable: {
    padding: 8,
  },
  closeBtn: {
    color: '#888',
    fontSize: 24,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#9c27b0',
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  prestigeCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  prestigeInfo: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    marginBottom: 12,
  },
  earnText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  prestigeBtn: {
    marginTop: 8,
  },
  notReadyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  builderCard: {
    marginBottom: 16,
  },
  builderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  builderCount: {
    color: '#9c27b0',
    fontSize: 14,
    fontWeight: '600',
  },
  builderDesc: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  upgradeList: {
    flex: 1,
  },
  upgradeItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  upgradeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upgradeName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  upgradeLevel: {
    color: '#9c27b0',
    fontSize: 12,
    fontWeight: '600',
  },
  upgradeDesc: {
    color: '#888',
    fontSize: 12,
    marginVertical: 4,
  },
  buyBtn: {
    backgroundColor: '#9c27b0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  buyBtnDisabled: {
    backgroundColor: '#333',
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  maxedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
