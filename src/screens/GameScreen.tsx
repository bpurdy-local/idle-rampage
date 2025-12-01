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
  WaveVictoryFlash,
  ResourcePopup,
  DamagePopupManager,
  MilestonePopup,
  BuildingEvolutionTooltip,
  SettingsModal,
  ScavengersDepot,
  WeakPointOverlay,
  checkWeakPointHit,
  getWeakPointDamageMultiplier,
  WeakPoint,
  OnboardingTutorial,
  SpecialEffectNotification,
  WaveExtendFlash,
} from '../components/game';
import {dailyRewardSystem, DailyRewardCheckResult} from '../systems/DailyRewardSystem';
import {getScaledRewardAmount} from '../data/dailyRewards';
import {DropResult} from '../systems/LuckyDropSystem';
import {BoostState} from '../core/GameState';
import {eventBus, GameEvents} from '../core/EventBus';
import {useDamagePopups} from '../hooks/useDamagePopups';
import {useGameNotifications} from '../hooks/useGameNotifications';
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
import {SpecialEffectsSystem} from '../systems/SpecialEffectsSystem';
import {DEBUG_CONFIG} from '../data/debugConfig';
import {saveService} from '../services/SaveService';
import {TAP_COOLDOWN_MS} from '../data/formulas';

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
  const [selectedBuildingInfo, setSelectedBuildingInfo] = useState<BuildingType | null>(null);
  const [milestoneUnlocked, setMilestoneUnlocked] = useState<PrestigeTier | null>(null);
  const [buildingEvolution, setBuildingEvolution] = useState<{
    buildingId: string;
    newTier: BuildingEvolutionTier;
    isNewUnlock: boolean;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [enemyDisplayBounds, setEnemyDisplayBounds] = useState<{width: number; height: number; x: number; y: number}>({
    width: 350,
    height: 300,
    x: 0,
    y: 0,
  });
  const lastTapTimeRef = useRef<number>(0);
  const enemyAreaRef = useRef<{x: number; y: number}>({x: 200, y: 250});
  const hasCheckedOfflineEarnings = useRef(false);

  const {popups, spawnPopup, removePopup} = useDamagePopups();

  // Use consolidated notification hook
  const {
    activeDrop,
    showLuckyDrop,
    hideLuckyDrop,
    tapRipples,
    spawnTapRipple,
    removeTapRipple,
    resourcePopups,
    spawnResourcePopup,
    removeResourcePopup,
    showVictoryFlash,
    victoryWasBoss,
    showVictory,
    hideVictory,
    specialEffectNotifications,
    spawnSpecialEffectNotification,
    removeSpecialEffectNotification,
    showWaveExtendFlash,
    waveExtendBonusSeconds,
    showWaveExtend,
    hideWaveExtend,
  } = useGameNotifications();

  // Weak point change handler
  const handleWeakPointsChange = useCallback((points: WeakPoint[]) => {
    setWeakPoints(points);
  }, []);

  // Handle enemy display layout to track bounds for weak point hit detection
  const handleEnemyDisplayLayout = useCallback((event: {nativeEvent: {layout: {width: number; height: number; x: number; y: number}}}) => {
    const {width, height, x, y} = event.nativeEvent.layout;
    setEnemyDisplayBounds({width, height, x, y});
  }, []);

  // Game systems
  const [productionSystem] = useState(() => new ProductionSystem());
  const [combatSystem] = useState(() => new CombatSystem());
  const [waveManager] = useState(() => new WaveManager());
  const [prestigeSystem] = useState(() => new PrestigeSystem());
  const [specialEffectsSystem] = useState(() => new SpecialEffectsSystem());

  // Store state
  const {
    player,
    buildings,
    combat,
    currentWave,
    setScrap,
    assignBuilder,
    unassignBuilder,
    assignBuildersToBuilding,
    unassignBuildersFromBuilding,
    recallAllBuilders,
    focusBuilding,
    upgradeBuilding,
    evolveBuilding,
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
    hasCompletedOnboarding,
    completeOnboarding,
  } = useGameStore();

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

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
    showLuckyDrop(drop);
  }, [addScrap, addBlueprints, addBoost, showLuckyDrop]);

  // Game tick callbacks
  const handleWaveComplete = useCallback(
    (reward: number, isBoss: boolean) => {
      showVictory(isBoss);
      spawnResourcePopup(reward, 'scrap', SCREEN_WIDTH / 2 - 50, 180);
    },
    [spawnResourcePopup, showVictory],
  );

  const handleWaveFailed = useCallback(() => {
    // Wave failed - timer ran out
  }, []);

  // Special effect callbacks
  const handleScrapFind = useCallback(
    (event: {amount: number; buildingName: string}) => {
      spawnSpecialEffectNotification({
        effectType: 'scrap_find',
        amount: event.amount,
        buildingName: event.buildingName,
      });
    },
    [spawnSpecialEffectNotification],
  );

  const handleWaveExtend = useCallback(
    (event: {bonusSeconds: number}) => {
      showWaveExtend(event.bonusSeconds);
    },
    [showWaveExtend],
  );

  // Start game loop with extracted tick logic
  useGameTick({
    productionSystem,
    combatSystem,
    waveManager,
    prestigeSystem,
    specialEffectsSystem,
    onWaveComplete: handleWaveComplete,
    onWaveFailed: handleWaveFailed,
    onLuckyDrop: applyDropReward,
    onScrapFind: handleScrapFind,
    onWaveExtend: handleWaveExtend,
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
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      specialEffects: state.specialEffects,
    }));

    return () => saveService.stopAutoSave();
  }, []);

  // Check for daily reward on mount (skip on first run before onboarding)
  useEffect(() => {
    if (!hasCompletedOnboarding) return;

    const result = dailyRewardSystem.checkForReward(dailyRewards);
    if (result.hasReward && result.reward) {
      setPendingReward(result);
      setShowDailyReward(true);
    }
  }, [hasCompletedOnboarding]);

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
          totalWorkersOwned: player.builders.total,
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

  // Listen for building evolution events (includes new unlocks at tier 1)
  useEffect(() => {
    const subscription = eventBus.on<{buildingId: string; newTier: BuildingEvolutionTier; isNewUnlock?: boolean}>(
      GameEvents.BUILDING_EVOLVED,
      (data) => {
        setBuildingEvolution({
          buildingId: data.buildingId,
          newTier: data.newTier,
          isNewUnlock: data.isNewUnlock ?? false,
        });
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
    hideLuckyDrop();
  }, [hideLuckyDrop]);

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

      // Check for weak point hit
      let weakPointMultiplier = 1;
      let hitWeakPoint = false;
      if (tapX !== undefined && tapY !== undefined && weakPoints.length > 0) {
        // Convert page coordinates to enemy display relative coordinates
        const relativeX = tapX - enemyDisplayBounds.x;
        const relativeY = tapY - enemyDisplayBounds.y;

        const hitPoint = checkWeakPointHit(
          relativeX,
          relativeY,
          weakPoints,
          {width: enemyDisplayBounds.width, height: enemyDisplayBounds.height},
        );

        if (hitPoint) {
          // Get the scanner building stats for damage multiplier
          const scannerBuilding = currentBuildings.find(b => b.typeId === 'weak_point_scanner');
          const scannerTier = scannerBuilding?.evolutionTier ?? 1;
          const scannerLevel = scannerBuilding?.level ?? 1;
          const scannerBuilders = scannerBuilding?.assignedBuilders ?? 0;
          weakPointMultiplier = getWeakPointDamageMultiplier(scannerTier, scannerLevel, scannerBuilders);
          hitWeakPoint = true;
        }
      }

      // Calculate prestige bonuses with fresh state
      const currentPrestigeBonuses = prestigeSystem.calculateBonuses(currentPlayer.prestigeUpgrades);
      const totalWorkersOwned = currentPlayer.builders.total;

      // Calculate base tap damage with Training Ground bonus
      const trainingBonus = combatSystem.calculateTapDamageBonus(currentBuildings, totalWorkersOwned);
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
        totalWorkersOwned,
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
          totalWorkersOwned,
        },
      );

      // Apply weak point bonus as ADDITIVE damage (you deal normal damage + bonus)
      // weakPointMultiplier is the bonus multiplier (e.g., 1.5x means +50% bonus damage)
      const baseDamageWithBurst = tapDamage * burst.multiplier;
      const weakPointBonusDamage = hitWeakPoint ? baseDamageWithBurst * (weakPointMultiplier - 1) : 0;
      const finalDamage = baseDamageWithBurst + weakPointBonusDamage;
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
      // Show as "burst" style if weak point hit for visual feedback
      spawnPopup(finalDamage, burst.triggered || hitWeakPoint, x, y);

      // Spawn tap ripple effect
      if (tapX && tapY) {
        spawnTapRipple(tapX, tapY);
      }
    },
    [combatSystem, prestigeSystem, spawnPopup, spawnTapRipple, weakPoints, enemyDisplayBounds],
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

  const handleAssignMultiple = useCallback(
    (buildingId: string, count: number) => {
      assignBuildersToBuilding(buildingId, count);
    },
    [assignBuildersToBuilding],
  );

  const handleUnassignMultiple = useCallback(
    (buildingId: string, count: number) => {
      unassignBuildersFromBuilding(buildingId, count);
    },
    [unassignBuildersFromBuilding],
  );

  const handleFocusBuilding = useCallback(
    (buildingId: string) => {
      focusBuilding(buildingId);
    },
    [focusBuilding],
  );

  const handleRecallAllBuilders = useCallback(() => {
    recallAllBuilders();
  }, [recallAllBuilders]);

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

  // Handle building evolution
  const handleEvolve = useCallback(
    (buildingId: string) => {
      evolveBuilding(buildingId);
    },
    [evolveBuilding],
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

      <View onLayout={handleEnemyDisplayLayout}>
        <EnemyDisplay
          enemy={combat.currentEnemy}
          waveTimer={combat.waveTimer}
          waveTimerMax={combat.waveTimerMax}
          currentWave={currentWave}
          onTap={handleTap}
        />
        {/* Weak Point Overlay - renders on top of enemy display */}
        {(() => {
          const scannerBuilding = buildings.find(b => b.typeId === 'weak_point_scanner');
          const isUnlocked = scannerBuilding?.isUnlocked ?? false;
          const scannerTier = scannerBuilding?.evolutionTier ?? 1;
          const scannerLevel = scannerBuilding?.level ?? 1;
          const scannerBuilders = scannerBuilding?.assignedBuilders ?? 0;

          return (
            <WeakPointOverlay
              isActive={isUnlocked && combat.isActive && combat.currentEnemy !== null}
              scannerTier={scannerTier}
              scannerLevel={scannerLevel}
              assignedBuilders={scannerBuilders}
              onWeakPointsChange={handleWeakPointsChange}
              bounds={{width: enemyDisplayBounds.width, height: enemyDisplayBounds.height}}
            />
          );
        })()}
      </View>

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
        onComplete={hideVictory}
      />

      {activeDrop && (
        <LuckyDropNotification
          drop={activeDrop.drop}
          amount={activeDrop.scaledAmount}
          onComplete={handleDropNotificationComplete}
        />
      )}

      {/* Special Effect Notifications */}
      {specialEffectNotifications.map(notification => (
        <SpecialEffectNotification
          key={notification.id}
          data={notification}
          onComplete={removeSpecialEffectNotification}
        />
      ))}

      <WaveExtendFlash
        visible={showWaveExtendFlash}
        bonusSeconds={waveExtendBonusSeconds}
        onComplete={hideWaveExtend}
      />

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabTextActive}>Buildings</Text>
        </TouchableOpacity>
        <View style={styles.builderInfo}>
          <Text style={styles.builderInfoText}>👷 {player.builders.available}/{player.builders.total}</Text>
          {player.builders.available < player.builders.total && (
            <TouchableOpacity style={styles.recallBtn} onPress={handleRecallAllBuilders}>
              <Text style={styles.recallBtnText}>Recall</Text>
            </TouchableOpacity>
          )}
        </View>
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
            const nextTier = getNextEvolutionTier(evolvableBuilding, building.level);

            // Check if evolution is available (building level meets next tier requirement)
            const canEvolve = nextTier !== null &&
              nextTier.unlockLevel !== undefined &&
              building.level >= nextTier.unlockLevel;

            const waveBonus = productionSystem.calculateWaveBonus(currentWave);
            // Use the appropriate prestige multiplier based on building role
            const prestigeMultiplier = (() => {
              switch (building.typeId) {
                case 'weak_point_scanner':
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
                onAssignMultiple={(count) => handleAssignMultiple(building.id, count)}
                onUnassignMultiple={(count) => handleUnassignMultiple(building.id, count)}
                onFocus={() => handleFocusBuilding(building.id)}
                onUpgrade={() => handleUpgrade(building.id)}
                onEvolve={() => handleEvolve(building.id)}
                onShowInfo={() => setSelectedBuildingInfo(buildingType)}
                prestigeCount={player.prestigeCount}
                currentWave={currentWave}
                evolutionTier={building.evolutionTier}
                nextEvolutionLevel={nextTier?.unlockLevel}
                currentBuildingLevel={building.level}
                canEvolve={canEvolve}
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

      <BuildingEvolutionTooltip
        visible={buildingEvolution !== null}
        newTier={buildingEvolution?.newTier ?? null}
        isNewUnlock={buildingEvolution?.isNewUnlock ?? false}
        onDismiss={() => setBuildingEvolution(null)}
      />

      {/* Onboarding tutorial for new players */}
      <OnboardingTutorial
        visible={!hasCompletedOnboarding}
        onComplete={handleOnboardingComplete}
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
  builderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  builderInfoText: {
    color: '#aaa',
    fontSize: 12,
  },
  recallBtn: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recallBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  buildingList: {
    flex: 1,
    paddingTop: 8,
  },
});
