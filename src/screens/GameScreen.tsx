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
import {useGameTick} from '../hooks/useGameTick';
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
  MilestonePopup,
  BuildingEvolutionPopup,
  SettingsModal,
  ScavengersDepot,
} from '../components/game';
import {dailyRewardSystem, DailyRewardCheckResult} from '../systems/DailyRewardSystem';
import {getScaledRewardAmount} from '../data/dailyRewards';
import {DropResult} from '../systems/LuckyDropSystem';
import {BoostState} from '../core/GameState';
import {eventBus, GameEvents} from '../core/EventBus';
import {useDamagePopups} from '../hooks/useDamagePopups';
import {
  getEvolvableBuildingById,
  toBuildingType,
  getNextEvolutionTier,
  calculateEngineeringDiscount,
  getMaxTotalBuilders,
} from '../data/buildings';
import {BuildingEvolutionTier} from '../models/Building';
import {PRESTIGE_TIERS, PrestigeTier} from '../data/prestigeMilestones';
import {BuildingType, calculateUpgradeCost, calculateProduction} from '../models/Building';
import {ProductionSystem} from '../systems/ProductionSystem';
import {CombatSystem} from '../systems/CombatSystem';
import {WaveManager} from '../systems/WaveManager';
import {PrestigeSystem} from '../systems/PrestigeSystem';
import {DEBUG_CONFIG} from '../data/debugConfig';
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
  const [victoryWasBoss, setVictoryWasBoss] = useState(false);
  const [resourcePopups, setResourcePopups] = useState<ResourcePopupData[]>([]);
  const [selectedBuildingInfo, setSelectedBuildingInfo] = useState<BuildingType | null>(null);
  const [milestoneUnlocked, setMilestoneUnlocked] = useState<PrestigeTier | null>(null);
  const [buildingEvolution, setBuildingEvolution] = useState<{
    buildingId: string;
    newTier: BuildingEvolutionTier;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);
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
    resetForPrestige,
    setBlueprints,
    setPrestigeUpgrade,
    dailyRewards,
    updateDailyRewards,
    addScrap,
    addBlueprints,
    addBuilders,
    addBoost,
    purchaseBuilderWithBlueprints,
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
  }, [addScrap, addBlueprints, addBoost]);

  // Game tick callbacks
  const handleWaveComplete = useCallback(
    (reward: number, isBoss: boolean) => {
      setVictoryWasBoss(isBoss);
      setShowVictoryFlash(true);
      spawnResourcePopup(reward, 'scrap', SCREEN_WIDTH / 2 - 50, 180);
    },
    [spawnResourcePopup],
  );

  const handleWaveFailed = useCallback(() => {
    // Wave failed - timer ran out
  }, []);

  // Start game loop with extracted tick logic
  useGameTick({
    productionSystem,
    combatSystem,
    waveManager,
    prestigeSystem,
    onWaveComplete: handleWaveComplete,
    onWaveFailed: handleWaveFailed,
    onLuckyDrop: applyDropReward,
    tickRate: 100,
  });

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

        const offlineTierMultiplier = PRESTIGE_TIERS[player.buildingTier]?.multiplier ?? 1;
        const productionBonuses = {
          waveBonus: productionSystem.calculateWaveBonus(currentWave),
          prestigeBonus: prestigeBonuses.productionMultiplier,
          boostMultiplier: 1,
          commandCenterBonus: productionSystem.calculateCommandCenterBonus(buildings),
          tierMultiplier: offlineTierMultiplier,
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
  }, [buildings, currentWave, prestigeBonuses, productionSystem, addScrap, player.buildingTier]);

  // Listen for milestone events
  useEffect(() => {
    const subscription = eventBus.on<{tier: PrestigeTier; prestigeCount: number}>(
      GameEvents.MILESTONE_REACHED,
      (data) => {
        setMilestoneUnlocked(data.tier);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // Listen for building evolution events
  useEffect(() => {
    const subscription = eventBus.on<{buildingId: string; newTier: BuildingEvolutionTier}>(
      GameEvents.BUILDING_EVOLVED,
      (data) => {
        setBuildingEvolution(data);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

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
    const scaledAmount = getScaledRewardAmount(reward, currentWave);

    switch (reward.type) {
      case 'scrap':
        addScrap(scaledAmount);
        break;
      case 'blueprints':
        addBlueprints(scaledAmount);
        break;
      case 'builders':
        addBuilders(scaledAmount);
        break;
    }

    const newDailyRewardState = dailyRewardSystem.claimReward(dailyRewards, newStreak);
    updateDailyRewards(newDailyRewardState);

    setShowDailyReward(false);
    setPendingReward(null);
  }, [pendingReward, dailyRewards, currentWave, addScrap, addBlueprints, addBuilders, updateDailyRewards]);

  // Handle tap attack
  const handleTap = useCallback(
    (tapX?: number, tapY?: number) => {
      // Get fresh state to avoid stale closure issues
      const state = useGameStore.getState();
      const currentCombat = state.combat;
      const currentBuildings = state.buildings;
      const currentPlayer = state.player;

      if (!currentCombat.currentEnemy || !currentCombat.isActive) return;

      // Check tap cooldown to prevent auto-clicker abuse
      const now = Date.now();
      if (now - lastTapTimeRef.current < TAP_COOLDOWN_MS) {
        return;
      }
      lastTapTimeRef.current = now;

      // Calculate prestige bonuses with fresh state
      const currentPrestigeBonuses = prestigeSystem.calculateBonuses(currentPlayer.prestigeUpgrades);

      // Calculate base tap damage with Training Ground bonus
      const trainingBonus = combatSystem.calculateTapDamageBonus(currentBuildings);
      const baseTapDamage = 10 + trainingBonus;
      const tapTierMultiplier = PRESTIGE_TIERS[currentPlayer.buildingTier]?.multiplier ?? 1;

      const debugTapDamageMultiplier = DEBUG_CONFIG.ENABLED ? DEBUG_CONFIG.DAMAGE_MULTIPLIER : 1;
      const tapDamage = combatSystem.calculateTapDamage(baseTapDamage, {
        prestigeAutoDamage: currentPrestigeBonuses.autoDamageMultiplier,
        prestigeTapPower: currentPrestigeBonuses.tapPowerMultiplier * debugTapDamageMultiplier,
        prestigeBurstChance: currentPrestigeBonuses.burstChanceBonus,
        prestigeBurstDamage: currentPrestigeBonuses.burstDamageMultiplier,
        boostMultiplier: 1,
        tierMultiplier: tapTierMultiplier,
      });

      const burst = combatSystem.checkBurstAttack(
        currentCombat.burstChance + currentPrestigeBonuses.burstChanceBonus,
        currentCombat.burstMultiplier * currentPrestigeBonuses.burstDamageMultiplier,
        {
          prestigeAutoDamage: 1,
          prestigeTapPower: 1,
          prestigeBurstChance: currentPrestigeBonuses.burstChanceBonus,
          prestigeBurstDamage: currentPrestigeBonuses.burstDamageMultiplier,
          boostMultiplier: 1,
          tierMultiplier: tapTierMultiplier,
        },
      );

      const finalDamage = tapDamage * burst.multiplier;
      state.damageEnemy(finalDamage);

      // Calculate scrap from tap damage
      const debugScrapMultiplier = DEBUG_CONFIG.ENABLED ? DEBUG_CONFIG.SCRAP_MULTIPLIER : 1;
      const tapScrap = combatSystem.calculateScrapFromDamage(
        finalDamage,
        currentCombat.currentEnemy,
        currentPrestigeBonuses.waveRewardsMultiplier * debugScrapMultiplier,
      );
      if (tapScrap > 0) {
        state.addScrap(tapScrap);
      }

      // Spawn damage popup at tap location or default enemy area
      const x = tapX ?? enemyAreaRef.current.x + (Math.random() - 0.5) * 60;
      const y = tapY ?? enemyAreaRef.current.y + (Math.random() - 0.5) * 40;
      spawnPopup(finalDamage, burst.triggered, x, y);

      // Spawn tap ripple effect
      if (tapX && tapY) {
        spawnTapRipple(tapX, tapY);
      }
    },
    [combatSystem, prestigeSystem, spawnPopup, spawnTapRipple],
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

  // Calculate discounted upgrade cost (with Engineering Bay bonus)
  const getDiscountedUpgradeCost = useCallback(
    (buildingType: BuildingType, level: number) => {
      const baseCost = calculateUpgradeCost(buildingType, level);
      const discount = calculateEngineeringDiscount(buildings);
      return Math.floor(baseCost * discount);
    },
    [buildings],
  );

  // Handle building upgrade
  const handleUpgrade = useCallback(
    (buildingId: string) => {
      const building = buildings.find(b => b.id === buildingId);
      if (!building) return;

      const evolvableBuilding = getEvolvableBuildingById(building.typeId);
      if (!evolvableBuilding) return;

      const tier = evolvableBuilding.tiers[building.evolutionTier - 1];
      if (!tier) return;

      const buildingType = toBuildingType(evolvableBuilding, tier);
      const cost = getDiscountedUpgradeCost(buildingType, building.level);

      if (player.scrap >= cost) {
        setScrap(player.scrap - cost);
        upgradeBuilding(buildingId);
      }
    },
    [buildings, player.scrap, setScrap, upgradeBuilding, getDiscountedUpgradeCost],
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

  // Handle builder purchase with blueprints
  const handlePurchaseBuilder = useCallback(() => {
    purchaseBuilderWithBlueprints();
  }, [purchaseBuilderWithBlueprints]);

  // Get prestige upgrade status for UI
  const upgradeStatus = prestigeSystem.getUpgradeStatus(player.blueprints, player.prestigeUpgrades);
  const prestigePreview = prestigeSystem.previewPrestige(currentWave);

  return (
    <SafeAreaView style={styles.container}>
      <ResourceDisplay
        scrap={player.scrap}
        blueprints={player.blueprints}
        builders={player.builders}
        onSettingsPress={() => setShowSettings(true)}
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
        isBoss={victoryWasBoss}
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
        <TouchableOpacity style={styles.tab} onPress={() => setShowShop(true)}>
          <Text style={styles.shopTabText}>Depot</Text>
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
            const evolvableBuilding = getEvolvableBuildingById(building.typeId);
            if (!evolvableBuilding) return null;

            const tier = evolvableBuilding.tiers[building.evolutionTier - 1];
            if (!tier) return null;

            const buildingType = toBuildingType(evolvableBuilding, tier);
            const nextTier = getNextEvolutionTier(evolvableBuilding, currentWave);

            const waveBonus = productionSystem.calculateWaveBonus(currentWave);
            // Use the appropriate prestige multiplier based on building role
            const prestigeMultiplier = (() => {
              switch (building.typeId) {
                case 'turret_station':
                  return prestigeBonuses.autoDamageMultiplier;
                case 'training_facility':
                  return prestigeBonuses.tapPowerMultiplier;
                default:
                  return prestigeBonuses.productionMultiplier;
              }
            })();
            const production = calculateProduction(
              buildingType,
              building.level,
              building.assignedBuilders,
              waveBonus,
              prestigeMultiplier,
            );

            const upgradeCost = getDiscountedUpgradeCost(buildingType, building.level);

            return (
              <BuildingCard
                key={building.id}
                building={building}
                buildingType={buildingType}
                buildingTypeId={building.typeId}
                production={production}
                upgradeCost={upgradeCost}
                canAffordUpgrade={player.scrap >= upgradeCost}
                availableBuilders={player.builders.available}
                onAssignBuilder={() => handleAssignBuilder(building.id)}
                onUnassignBuilder={() => handleUnassignBuilder(building.id)}
                onUpgrade={() => handleUpgrade(building.id)}
                onShowInfo={() => setSelectedBuildingInfo(buildingType)}
                prestigeCount={player.prestigeCount}
                currentWave={currentWave}
                evolutionTier={building.evolutionTier}
                nextEvolutionWave={nextTier?.unlockWave}
                noWorkers={evolvableBuilding.noWorkers}
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
          totalBuilders={player.builders.total}
          maxBuilders={getMaxTotalBuilders()}
          builderCost={prestigeSystem.getBuilderPurchaseCost(player.buildersPurchased)}
          canAffordBuilder={prestigeSystem.canAffordBuilder(player.blueprints, player.buildersPurchased)}
          onPrestige={handlePrestige}
          onPurchaseUpgrade={handlePurchaseUpgrade}
          onPurchaseBuilder={handlePurchaseBuilder}
          onClose={() => setShowPrestige(false)}
        />
      </Modal>

      <Modal visible={showDailyReward} animationType="fade" transparent>
        {pendingReward?.reward && (
          <DailyRewardModal
            reward={pendingReward.reward}
            streak={pendingReward.newStreak}
            isStreakBroken={pendingReward.isStreakBroken}
            currentWave={currentWave}
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
        prestigeCount={player.prestigeCount}
      />

      <MilestonePopup
        visible={milestoneUnlocked !== null}
        tier={milestoneUnlocked}
        onDismiss={() => setMilestoneUnlocked(null)}
      />

      <BuildingEvolutionPopup
        visible={buildingEvolution !== null}
        buildingId={buildingEvolution?.buildingId ?? ''}
        newTier={buildingEvolution?.newTier ?? null}
        onDismiss={() => setBuildingEvolution(null)}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        buildings={buildings}
      />

      <Modal visible={showShop} animationType="slide">
        <ScavengersDepot
          onClose={() => setShowShop(false)}
          onPurchase={(productId) => {
            // TODO: Integrate with IAPService for real purchases
            console.log('Purchase requested:', productId);
            setShowShop(false);
          }}
          currentBuilders={player.builders.total}
          maxBuilders={player.builders.maxBuilders}
        />
      </Modal>
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
  shopTabText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  buildingList: {
    flex: 1,
    paddingTop: 8,
  },
});
