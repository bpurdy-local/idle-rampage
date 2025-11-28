import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Modal,
  Dimensions,
} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
import {useGameStore} from '../stores/gameStore';
import {useGameLoop} from '../hooks/useGameLoop';
import {
  ResourceDisplay,
  EnemyDisplay,
  BuildingCard,
  BuildingInfoModal,
  PrestigePanel,
  PrestigeTabGlow,
  DailyRewardModal,
  OfflineEarningsModal,
  LuckyDropNotification,
  TapRipple,
  TapRippleData,
  WaveVictoryFlash,
  ResourcePopup,
  ResourcePopupData,
  DamagePopupManager,
} from '../components/game';
import {dailyRewardSystem, DailyRewardCheckResult} from '../systems/DailyRewardSystem';
import {luckyDropSystem, DropResult} from '../systems/LuckyDropSystem';
import {BoostState} from '../core/GameState';
import {useDamagePopups} from '../hooks/useDamagePopups';
import {BUILDINGS} from '../data/buildings';
import {BuildingType, calculateUpgradeCost, calculateProduction} from '../models/Building';
import {ProductionSystem} from '../systems/ProductionSystem';
import {CombatSystem} from '../systems/CombatSystem';
import {WaveManager} from '../systems/WaveManager';
import {PrestigeSystem} from '../systems/PrestigeSystem';
import {saveService} from '../services/SaveService';

// Minimum time between taps in milliseconds (prevents auto-clicker abuse)
const TAP_COOLDOWN_MS = 150;

export const GameScreen: React.FC = () => {
  const [showPrestige, setShowPrestige] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showOfflineEarnings, setShowOfflineEarnings] = useState(false);
  const [pendingReward, setPendingReward] = useState<DailyRewardCheckResult | null>(null);
  const [offlineData, setOfflineData] = useState<{
    offlineTime: number;
    earnings: number;
    productionRate: number;
  } | null>(null);
  const [activeDrop, setActiveDrop] = useState<DropResult | null>(null);
  const [tapRipples, setTapRipples] = useState<TapRippleData[]>([]);
  const [showVictoryFlash, setShowVictoryFlash] = useState(false);
  const [resourcePopups, setResourcePopups] = useState<ResourcePopupData[]>([]);
  const [selectedBuildingInfo, setSelectedBuildingInfo] = useState<BuildingType | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const enemyAreaRef = useRef<{x: number; y: number}>({x: 200, y: 250});
  const hasCheckedOfflineEarnings = useRef(false);
  const tapRippleIdRef = useRef(0);
  const resourcePopupIdRef = useRef(0);

  const {popups, spawnPopup, removePopup} = useDamagePopups();

  const spawnTapRipple = useCallback((x: number, y: number) => {
    const id = `ripple_${tapRippleIdRef.current++}`;
    setTapRipples(prev => [...prev.slice(-5), {id, x, y}]);
  }, []);

  const removeTapRipple = useCallback((id: string) => {
    setTapRipples(prev => prev.filter(r => r.id !== id));
  }, []);

  const spawnResourcePopup = useCallback((amount: number, type: 'scrap' | 'blueprints', x: number, y: number) => {
    const id = `resource_${resourcePopupIdRef.current++}`;
    setResourcePopups(prev => [...prev.slice(-3), {id, amount, type, x, y}]);
  }, []);

  const removeResourcePopup = useCallback((id: string) => {
    setResourcePopups(prev => prev.filter(r => r.id !== id));
  }, []);

  // Game systems
  const [productionSystem] = useState(() => new ProductionSystem());
  const [combatSystem] = useState(() => new CombatSystem());
  const [waveManager] = useState(() => new WaveManager());
  const [prestigeSystem] = useState(() => new PrestigeSystem());

  // Store state
  const {
    player,
    buildings,
    combat,
    currentWave,
    setScrap,
    assignBuilder,
    unassignBuilder,
    upgradeBuilding,
    damageEnemy,
    advanceWave,
    resetForPrestige,
    setBlueprints,
    setPrestigeUpgrade,
    setCombatActive,
    setCurrentEnemy,
    setWaveTimer,
    updateCombatStats,
    dailyRewards,
    updateDailyRewards,
    addScrap,
    addBlueprints,
    addBuilders,
    addBoost,
  } = useGameStore();

  // Calculate prestige bonuses
  const prestigeBonuses = prestigeSystem.calculateBonuses(player.prestigeUpgrades);

  // Handle lucky drop rewards
  const applyDropReward = useCallback((drop: DropResult) => {
    switch (drop.drop.type) {
      case 'scrap':
        addScrap(drop.scaledAmount);
        break;
      case 'blueprints':
        addBlueprints(drop.scaledAmount);
        break;
      case 'builder':
        addBuilders(drop.scaledAmount);
        break;
      case 'boost':
        if (drop.drop.boostDuration) {
          const boost: BoostState = {
            id: `lucky_boost_${Date.now()}`,
            multiplier: 2,
            remainingDuration: drop.drop.boostDuration * 1000,
          };
          addBoost(boost);
        }
        break;
    }
    setActiveDrop(drop);
  }, [addScrap, addBlueprints, addBuilders, addBoost]);

  // Game tick
  const handleTick = useCallback(
    (deltaMs: number) => {
      // Calculate production bonuses
      const productionBonuses = {
        waveBonus: productionSystem.calculateWaveBonus(currentWave),
        prestigeBonus: prestigeBonuses.productionMultiplier,
        boostMultiplier: 1,
        commandCenterBonus: productionSystem.calculateCommandCenterBonus(buildings),
      };

      // Production tick
      const productionResult = productionSystem.tick(
        buildings,
        productionBonuses,
        deltaMs,
      );

      if (productionResult.totalProduction > 0) {
        setScrap(player.scrap + productionResult.totalProduction * prestigeBonuses.waveRewardsMultiplier);
      }

      // Combat tick
      if (combat.isActive && combat.currentEnemy) {
        // Update wave timer
        const newTimer = combat.waveTimer - deltaMs / 1000;
        setWaveTimer(newTimer);

        const combatBuildings = buildings.filter(b => {
          const type = BUILDINGS.find((t: {id: string; role: string}) => t.id === b.typeId);
          return type?.role === 'combat';
        });

        const combatResult = combatSystem.tick(
          combat.currentEnemy,
          combatBuildings,
          {...combat, waveTimer: newTimer},
          {
            prestigeAutoDamage: prestigeBonuses.autoDamageMultiplier,
            prestigeTapPower: prestigeBonuses.tapPowerMultiplier,
            prestigeBurstChance: prestigeBonuses.burstChanceBonus,
            prestigeBurstDamage: prestigeBonuses.burstDamageMultiplier,
            boostMultiplier: 1,
          },
          deltaMs,
        );

        if (combatResult.enemyDefeated) {
          // Wave complete
          const reward = waveManager.calculateWaveReward(
            currentWave,
            combat.currentEnemy.reward,
            prestigeBonuses.waveRewardsMultiplier,
            1,
          );
          setScrap(player.scrap + reward.totalScrap);

          // Show victory flash and resource popup
          setShowVictoryFlash(true);
          spawnResourcePopup(reward.totalScrap, 'scrap', SCREEN_WIDTH / 2 - 50, 180);

          // Roll for lucky drop
          const dropResult = luckyDropSystem.rollForDrop(currentWave, combat.currentEnemy.reward);
          if (dropResult) {
            applyDropReward(dropResult);
          }

          // Reset combat state before advancing wave
          setCombatActive(false);
          setCurrentEnemy(null);
          advanceWave();
        } else if (combatResult.timerExpired) {
          // Wave failed - restart same wave
          setCombatActive(false);
          setCurrentEnemy(null);
        }
      } else if (!combat.isActive) {
        // Start next wave
        const enemy = waveManager.spawnEnemyForWave(currentWave);
        const timer = waveManager.calculateWaveTimer(currentWave);
        setCurrentEnemy(enemy);
        updateCombatStats({waveTimer: timer, waveTimerMax: timer});
        setCombatActive(true);
      }
    },
    [
      buildings,
      combat,
      currentWave,
      player,
      prestigeBonuses,
      productionSystem,
      combatSystem,
      waveManager,
      setScrap,
      advanceWave,
      setCombatActive,
      setCurrentEnemy,
      setWaveTimer,
      updateCombatStats,
      applyDropReward,
      spawnResourcePopup,
    ],
  );

  // Start game loop
  useGameLoop({onTick: handleTick, tickRate: 100});

  // Auto-save
  useEffect(() => {
    const state = useGameStore.getState();
    saveService.startAutoSave(() => ({
      player: state.player,
      buildings: state.buildings,
      combat: state.combat,
      currentWave: state.currentWave,
      dailyRewards: state.dailyRewards,
    }));

    return () => saveService.stopAutoSave();
  }, []);

  // Check for daily reward on mount
  useEffect(() => {
    const result = dailyRewardSystem.checkForReward(dailyRewards);
    if (result.hasReward && result.reward) {
      setPendingReward(result);
      setShowDailyReward(true);
    }
  }, []);

  // Check for offline earnings on mount
  useEffect(() => {
    if (hasCheckedOfflineEarnings.current) return;
    hasCheckedOfflineEarnings.current = true;

    const checkOfflineEarnings = async () => {
      const loadResult = await saveService.load();

      if (loadResult.success && loadResult.wasOffline && loadResult.offlineTime) {
        const offlineSeconds = loadResult.offlineTime / 1000;

        const productionBonuses = {
          waveBonus: productionSystem.calculateWaveBonus(currentWave),
          prestigeBonus: prestigeBonuses.productionMultiplier,
          boostMultiplier: 1,
          commandCenterBonus: productionSystem.calculateCommandCenterBonus(buildings),
        };

        const productionRate = productionSystem.getTotalProductionPerSecond(
          buildings,
          productionBonuses,
        );

        const earnings = productionSystem.calculateOfflineProduction(
          buildings,
          productionBonuses,
          offlineSeconds,
        );

        if (earnings > 0) {
          addScrap(earnings);

          setOfflineData({
            offlineTime: loadResult.offlineTime,
            earnings,
            productionRate,
          });
          setShowOfflineEarnings(true);
        }
      }
    };

    checkOfflineEarnings();
  }, [buildings, currentWave, prestigeBonuses, productionSystem, addScrap]);

  // Handle collecting offline earnings
  const handleCollectOfflineEarnings = useCallback(() => {
    setShowOfflineEarnings(false);
    setOfflineData(null);
  }, []);

  // Handle drop notification complete
  const handleDropNotificationComplete = useCallback(() => {
    setActiveDrop(null);
  }, []);

  // Handle claiming daily reward
  const handleClaimDailyReward = useCallback(() => {
    if (!pendingReward || !pendingReward.reward) return;

    const {reward, newStreak} = pendingReward;

    switch (reward.type) {
      case 'scrap':
        addScrap(reward.amount);
        break;
      case 'blueprints':
        addBlueprints(reward.amount);
        break;
      case 'builders':
        addBuilders(reward.amount);
        break;
    }

    const newDailyRewardState = dailyRewardSystem.claimReward(dailyRewards, newStreak);
    updateDailyRewards(newDailyRewardState);

    setShowDailyReward(false);
    setPendingReward(null);
  }, [pendingReward, dailyRewards, addScrap, addBlueprints, addBuilders, updateDailyRewards]);

  // Handle tap attack
  const handleTap = useCallback(
    (tapX?: number, tapY?: number) => {
      if (!combat.currentEnemy || !combat.isActive) return;

      // Check tap cooldown to prevent auto-clicker abuse
      const now = Date.now();
      if (now - lastTapTimeRef.current < TAP_COOLDOWN_MS) {
        return;
      }
      lastTapTimeRef.current = now;

      // Calculate base tap damage with Training Ground bonus
      const trainingBonus = combatSystem.calculateTapDamageBonus(buildings);
      const baseTapDamage = 10 + trainingBonus;

      const tapDamage = combatSystem.calculateTapDamage(baseTapDamage, {
        prestigeAutoDamage: prestigeBonuses.autoDamageMultiplier,
        prestigeTapPower: prestigeBonuses.tapPowerMultiplier,
        prestigeBurstChance: prestigeBonuses.burstChanceBonus,
        prestigeBurstDamage: prestigeBonuses.burstDamageMultiplier,
        boostMultiplier: 1,
      });

      const burst = combatSystem.checkBurstAttack(
        combat.burstChance + prestigeBonuses.burstChanceBonus,
        combat.burstMultiplier * prestigeBonuses.burstDamageMultiplier,
        {
          prestigeAutoDamage: 1,
          prestigeTapPower: 1,
          prestigeBurstChance: prestigeBonuses.burstChanceBonus,
          prestigeBurstDamage: prestigeBonuses.burstDamageMultiplier,
          boostMultiplier: 1,
        },
      );

      const finalDamage = tapDamage * burst.multiplier;
      damageEnemy(finalDamage);

      // Spawn damage popup at tap location or default enemy area
      const x = tapX ?? enemyAreaRef.current.x + (Math.random() - 0.5) * 60;
      const y = tapY ?? enemyAreaRef.current.y + (Math.random() - 0.5) * 40;
      spawnPopup(finalDamage, burst.triggered, x, y);

      // Spawn tap ripple effect
      if (tapX && tapY) {
        spawnTapRipple(tapX, tapY);
      }
    },
    [combat, combatSystem, buildings, prestigeBonuses, damageEnemy, spawnPopup, spawnTapRipple],
  );

  // Handle builder assignment (directly through store since it has validation)
  const handleAssignBuilder = useCallback(
    (buildingId: string) => {
      assignBuilder(buildingId);
    },
    [assignBuilder],
  );

  const handleUnassignBuilder = useCallback(
    (buildingId: string) => {
      unassignBuilder(buildingId);
    },
    [unassignBuilder],
  );

  // Handle building upgrade
  const handleUpgrade = useCallback(
    (buildingId: string) => {
      const building = buildings.find(b => b.id === buildingId);
      const buildingType = building ? BUILDINGS.find((t: BuildingType) => t.id === building.typeId) : null;

      if (building && buildingType) {
        const cost = calculateUpgradeCost(buildingType, building.level);
        if (player.scrap >= cost) {
          setScrap(player.scrap - cost);
          upgradeBuilding(buildingId);
        }
      }
    },
    [buildings, player.scrap, setScrap, upgradeBuilding],
  );

  // Handle prestige
  const handlePrestige = useCallback(() => {
    if (!prestigeSystem.canPrestige(currentWave)) return;

    const result = prestigeSystem.executePrestige(player, currentWave);
    resetForPrestige();
    setBlueprints(result.totalBlueprints);
    setShowPrestige(false);
  }, [currentWave, player, prestigeSystem, resetForPrestige, setBlueprints]);

  // Handle prestige upgrade purchase
  const handlePurchaseUpgrade = useCallback(
    (upgradeId: string) => {
      const currentLevel = player.prestigeUpgrades[upgradeId] ?? 0;
      const result = prestigeSystem.purchaseUpgrade(upgradeId, currentLevel, player.blueprints);

      if (result.success) {
        setBlueprints(result.remainingBlueprints);
        setPrestigeUpgrade(upgradeId, result.newLevel);
      }
    },
    [player.blueprints, player.prestigeUpgrades, prestigeSystem, setBlueprints, setPrestigeUpgrade],
  );

  // Get prestige upgrade status for UI
  const upgradeStatus = prestigeSystem.getUpgradeStatus(player.blueprints, player.prestigeUpgrades);
  const prestigePreview = prestigeSystem.previewPrestige(currentWave);

  return (
    <SafeAreaView style={styles.container}>
      <ResourceDisplay
        scrap={player.scrap}
        blueprints={player.blueprints}
        builders={player.builders}
      />

      <EnemyDisplay
        enemy={combat.currentEnemy}
        waveTimer={combat.waveTimer}
        waveTimerMax={combat.waveTimerMax}
        currentWave={currentWave}
        onTap={handleTap}
      />

      <DamagePopupManager popups={popups} onPopupComplete={removePopup} />

      {tapRipples.map(ripple => (
        <TapRipple key={ripple.id} data={ripple} onComplete={removeTapRipple} />
      ))}

      {resourcePopups.map(popup => (
        <ResourcePopup key={popup.id} data={popup} onComplete={removeResourcePopup} />
      ))}

      <WaveVictoryFlash
        visible={showVictoryFlash}
        onComplete={() => setShowVictoryFlash(false)}
      />

      {activeDrop && (
        <LuckyDropNotification
          drop={activeDrop.drop}
          amount={activeDrop.scaledAmount}
          onComplete={handleDropNotificationComplete}
        />
      )}

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabTextActive}>Buildings</Text>
        </TouchableOpacity>
        <PrestigeTabGlow
          canPrestige={prestigePreview.canPrestige}
          onPress={() => setShowPrestige(true)}
        />
      </View>

      <ScrollView style={styles.buildingList}>
        {buildings
          .filter(b => b.isUnlocked)
          .map(building => {
            const buildingType = BUILDINGS.find((t: BuildingType) => t.id === building.typeId);
            if (!buildingType) return null;

            const production = calculateProduction(
              buildingType,
              building.level,
              building.assignedBuilders,
              1,
              prestigeBonuses.productionMultiplier,
            );

            const upgradeCost = calculateUpgradeCost(buildingType, building.level);

            return (
              <BuildingCard
                key={building.id}
                building={building}
                buildingType={buildingType}
                production={production}
                upgradeCost={upgradeCost}
                canAffordUpgrade={player.scrap >= upgradeCost}
                availableBuilders={player.builders.available}
                onAssignBuilder={() => handleAssignBuilder(building.id)}
                onUnassignBuilder={() => handleUnassignBuilder(building.id)}
                onUpgrade={() => handleUpgrade(building.id)}
                onShowInfo={() => setSelectedBuildingInfo(buildingType)}
              />
            );
          })}
      </ScrollView>

      <Modal visible={showPrestige} animationType="slide">
        <PrestigePanel
          blueprints={player.blueprints}
          prestigeCount={player.prestigeCount}
          currentWave={currentWave}
          canPrestige={prestigePreview.canPrestige}
          blueprintsToEarn={prestigePreview.blueprintsEarned}
          prestigeRequirement={prestigeSystem.getPrestigeRequirement()}
          upgrades={upgradeStatus.map(s => ({
            id: s.upgrade.id,
            name: s.upgrade.name,
            description: s.upgrade.description,
            currentLevel: s.currentLevel,
            maxLevel: s.upgrade.maxLevel,
            nextCost: s.nextCost,
            canAfford: s.canAfford,
            currentEffect: s.currentEffect,
          }))}
          onPrestige={handlePrestige}
          onPurchaseUpgrade={handlePurchaseUpgrade}
          onClose={() => setShowPrestige(false)}
        />
      </Modal>

      <Modal visible={showDailyReward} animationType="fade" transparent>
        {pendingReward?.reward && (
          <DailyRewardModal
            reward={pendingReward.reward}
            streak={pendingReward.newStreak}
            isStreakBroken={pendingReward.isStreakBroken}
            onClaim={handleClaimDailyReward}
          />
        )}
      </Modal>

      <Modal visible={showOfflineEarnings} animationType="fade" transparent>
        {offlineData && (
          <OfflineEarningsModal
            offlineTime={offlineData.offlineTime}
            earnings={offlineData.earnings}
            productionRate={offlineData.productionRate}
            onCollect={handleCollectOfflineEarnings}
          />
        )}
      </Modal>

      <BuildingInfoModal
        visible={selectedBuildingInfo !== null}
        building={selectedBuildingInfo}
        onClose={() => setSelectedBuildingInfo(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buildingList: {
    flex: 1,
    paddingTop: 8,
  },
});
