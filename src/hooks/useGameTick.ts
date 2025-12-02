/**
 * Custom hook that handles the main game tick logic.
 * Separates game loop concerns from the GameScreen component.
 */
import {useCallback} from 'react';
import {useGameStore} from '../stores/gameStore';
import {EVOLVABLE_BUILDINGS, calculateShieldGeneratorBonus, getEvolvableBuildingById} from '../data/buildings';
import {PRESTIGE_TIERS} from '../data/prestigeMilestones';
import {ProductionSystem} from '../systems/ProductionSystem';
import {CombatSystem, DAMAGE_SCRAP_PERCENT} from '../systems/CombatSystem';
import {WaveManager} from '../systems/WaveManager';
import {PrestigeSystem} from '../systems/PrestigeSystem';
import {SpecialEffectsSystem} from '../systems/SpecialEffectsSystem';
import {luckyDropSystem, DropResult} from '../systems/LuckyDropSystem';
import {DEBUG_CONFIG} from '../data/debugConfig';
import {useGameLoop} from './useGameLoop';

export interface ScrapFindEvent {
  amount: number;
  buildingName: string;
}

export interface WaveExtendEvent {
  bonusSeconds: number;
}

export interface UseGameTickOptions {
  productionSystem: ProductionSystem;
  combatSystem: CombatSystem;
  waveManager: WaveManager;
  prestigeSystem: PrestigeSystem;
  specialEffectsSystem: SpecialEffectsSystem;
  onWaveComplete: (reward: number, isBoss: boolean, waveCompleted: number) => void;
  onWaveFailed: () => void;
  onLuckyDrop: (drop: DropResult) => void;
  onScrapFind?: (event: ScrapFindEvent) => void;
  onWaveExtend?: (event: WaveExtendEvent) => void;
  tickRate?: number;
}

export function useGameTick({
  productionSystem,
  combatSystem,
  waveManager,
  prestigeSystem,
  specialEffectsSystem,
  onWaveComplete,
  onWaveFailed,
  onLuckyDrop,
  onScrapFind,
  onWaveExtend,
  tickRate = 100,
}: UseGameTickOptions) {
  const handleTick = useCallback(
    (deltaMs: number) => {
      // Get fresh state from store to avoid stale closure issues
      const state = useGameStore.getState();
      const {combat, player, buildings, currentWave, specialEffects} = state;

      // Calculate prestige bonuses with fresh state
      const prestigeBonuses = prestigeSystem.calculateBonuses(player.prestigeUpgrades);
      const tierMultiplier = PRESTIGE_TIERS[player.buildingTier]?.multiplier ?? 1;

      // Calculate combined boost multiplier from active boosts (multiplicative, capped at 10x)
      const rawBoostMultiplier = player.activeBoosts.reduce(
        (total, boost) => total * boost.multiplier,
        1,
      );
      const boostMultiplier = Math.min(10, rawBoostMultiplier);

      // === Production Tick ===
      const productionBonuses = {
        waveBonus: productionSystem.calculateWaveBonus(currentWave),
        prestigeBonus: prestigeBonuses.productionMultiplier,
        boostMultiplier,
        commandCenterBonus: productionSystem.calculateCommandCenterBonus(buildings),
        tierMultiplier,
        totalWorkersOwned: player.builders.total,
      };

      const productionResult = productionSystem.tick(buildings, productionBonuses, deltaMs);

      if (productionResult.totalProduction > 0) {
        const debugMultiplier = DEBUG_CONFIG.ENABLED ? DEBUG_CONFIG.SCRAP_MULTIPLIER : 1;
        const scrapGain = productionResult.totalProduction * prestigeBonuses.waveRewardsMultiplier * debugMultiplier;
        state.setScrap(player.scrap + scrapGain);
      }

      // === Tick Active Boosts (decrement duration) ===
      if (player.activeBoosts.length > 0) {
        state.tickBoosts(deltaMs);
      }

      // === Scrap Find Special Effect (Scrap Works) ===
      const scrapWorksBuilding = buildings.find(b => b.typeId === 'scrap_works' && b.isUnlocked);
      if (scrapWorksBuilding && combat.currentEnemy) {
        const scrapFindResult = specialEffectsSystem.processScrapFind(
          scrapWorksBuilding,
          combat.currentEnemy.reward,
          specialEffects.lastScrapFindTime,
          Date.now(),
          prestigeBonuses.productionMultiplier,
          prestigeBonuses.waveRewardsMultiplier,
        );

        if (scrapFindResult.triggered && scrapFindResult.amount > 0) {
          const debugMultiplier = DEBUG_CONFIG.ENABLED ? DEBUG_CONFIG.SCRAP_MULTIPLIER : 1;
          state.addScrap(scrapFindResult.amount * debugMultiplier);
          state.recordScrapFindTrigger(Date.now());

          // Get building name for notification
          const evolvable = getEvolvableBuildingById(scrapWorksBuilding.typeId);
          const tierData = evolvable?.tiers[scrapWorksBuilding.evolutionTier - 1];
          const buildingName = tierData?.name ?? 'Scrap Works';

          if (onScrapFind) {
            onScrapFind({
              amount: scrapFindResult.amount * debugMultiplier,
              buildingName,
            });
          }
        }
      }

      // === Combat Tick ===
      if (combat.isActive && combat.currentEnemy) {
        handleCombatTick(
          state,
          deltaMs,
          combat,
          buildings,
          currentWave,
          tierMultiplier,
          boostMultiplier,
          player.builders.total,
          prestigeBonuses,
          combatSystem,
          waveManager,
          specialEffectsSystem,
          onWaveComplete,
          onWaveFailed,
          onLuckyDrop,
          onWaveExtend,
        );
      } else if (!combat.isActive) {
        // Start first wave (only runs once at game start)
        const enemy = waveManager.spawnEnemyForWave(currentWave);
        const baseTimer = waveManager.calculateWaveTimer(currentWave);
        const shieldBonus = calculateShieldGeneratorBonus(buildings);
        const timer = baseTimer + shieldBonus;
        state.setCurrentEnemy(enemy);
        state.updateCombatStats({waveTimer: timer, waveTimerMax: timer});
        state.setCombatActive(true);
      }
    },
    [
      productionSystem,
      combatSystem,
      waveManager,
      prestigeSystem,
      specialEffectsSystem,
      onWaveComplete,
      onWaveFailed,
      onLuckyDrop,
      onScrapFind,
      onWaveExtend,
    ],
  );

  useGameLoop({onTick: handleTick, tickRate});
}

/**
 * Handles combat-related tick logic
 */
function handleCombatTick(
  state: ReturnType<typeof useGameStore.getState>,
  deltaMs: number,
  combat: ReturnType<typeof useGameStore.getState>['combat'],
  buildings: ReturnType<typeof useGameStore.getState>['buildings'],
  currentWave: number,
  tierMultiplier: number,
  boostMultiplier: number,
  totalWorkersOwned: number,
  prestigeBonuses: ReturnType<PrestigeSystem['calculateBonuses']>,
  combatSystem: CombatSystem,
  waveManager: WaveManager,
  specialEffectsSystem: SpecialEffectsSystem,
  onWaveComplete: (reward: number, isBoss: boolean, waveCompleted: number) => void,
  onWaveFailed: () => void,
  onLuckyDrop: (drop: DropResult) => void,
  onWaveExtend?: (event: WaveExtendEvent) => void,
) {
  if (!combat.currentEnemy) return;

  // Update wave timer
  const timerMultiplier = DEBUG_CONFIG.ENABLED ? DEBUG_CONFIG.WAVE_TIMER_MULTIPLIER : 1;
  const newTimer = combat.waveTimer - (deltaMs / 1000) / timerMultiplier;
  state.setWaveTimer(newTimer);

  // Get combat buildings
  const combatBuildings = buildings.filter(b => {
    const evolvable = EVOLVABLE_BUILDINGS.find(e => e.id === b.typeId);
    return evolvable?.role === 'combat';
  });

  // Calculate bonuses
  const debugDamageMultiplier = DEBUG_CONFIG.ENABLED ? DEBUG_CONFIG.DAMAGE_MULTIPLIER : 1;
  const debugScrapMultiplier = DEBUG_CONFIG.ENABLED ? DEBUG_CONFIG.SCRAP_MULTIPLIER : 1;

  // Run combat tick
  const combatResult = combatSystem.tick(
    combat.currentEnemy,
    combatBuildings,
    {...combat, waveTimer: newTimer},
    {
      prestigeAutoDamage: prestigeBonuses.autoDamageMultiplier * debugDamageMultiplier,
      prestigeTapPower: prestigeBonuses.tapPowerMultiplier,
      prestigeBurstChance: prestigeBonuses.burstChanceBonus,
      prestigeBurstDamage: prestigeBonuses.burstDamageMultiplier,
      boostMultiplier,
      tierMultiplier,
      totalWorkersOwned,
    },
    deltaMs,
    prestigeBonuses.waveRewardsMultiplier * debugScrapMultiplier * boostMultiplier,
  );

  // Add scrap earned from auto-damage
  if (combatResult.scrapFromDamage > 0) {
    state.addScrap(combatResult.scrapFromDamage);
  }

  // Handle wave outcomes
  if (combatResult.enemyDefeated) {
    handleWaveComplete(
      state,
      combat,
      buildings,
      currentWave,
      prestigeBonuses,
      waveManager,
      specialEffectsSystem,
      onWaveComplete,
      onLuckyDrop,
      onWaveExtend,
    );
  } else if (combatResult.timerExpired) {
    handleWaveFailed(state, buildings, currentWave, waveManager, onWaveFailed);
  }
}

/**
 * Handles wave completion logic
 */
function handleWaveComplete(
  state: ReturnType<typeof useGameStore.getState>,
  combat: ReturnType<typeof useGameStore.getState>['combat'],
  buildings: ReturnType<typeof useGameStore.getState>['buildings'],
  currentWave: number,
  prestigeBonuses: ReturnType<PrestigeSystem['calculateBonuses']>,
  waveManager: WaveManager,
  specialEffectsSystem: SpecialEffectsSystem,
  onWaveComplete: (reward: number, isBoss: boolean, waveCompleted: number) => void,
  onLuckyDrop: (drop: DropResult) => void,
  onWaveExtend?: (event: WaveExtendEvent) => void,
) {
  if (!combat.currentEnemy) return;

  // Calculate completion reward (50% since other 50% came from damage)
  const completionRewardPercent = 1 - DAMAGE_SCRAP_PERCENT;
  const debugRewardMultiplier = DEBUG_CONFIG.ENABLED ? DEBUG_CONFIG.SCRAP_MULTIPLIER : 1;
  const reward = waveManager.calculateWaveReward(
    currentWave,
    Math.floor(combat.currentEnemy.reward * completionRewardPercent),
    prestigeBonuses.waveRewardsMultiplier * debugRewardMultiplier,
    1,
  );
  state.addScrap(reward.totalScrap);

  const isBoss = combat.currentEnemy.isBoss === true;
  onWaveComplete(reward.totalScrap, isBoss, currentWave);

  // Roll for lucky drop (guaranteed for bosses)
  const dropResult = luckyDropSystem.rollForDrop(currentWave, combat.currentEnemy.reward, isBoss);
  if (dropResult) {
    onLuckyDrop(dropResult);
  }

  // Advance wave and spawn next enemy
  state.advanceWave();
  const nextWave = currentWave + 1;
  const nextEnemy = waveManager.spawnEnemyForWave(nextWave);
  const baseTimer = waveManager.calculateWaveTimer(nextWave);
  const shieldBonus = calculateShieldGeneratorBonus(buildings);

  // Check for wave extension from Shield Generator special effect
  const waveExtendResult = specialEffectsSystem.checkWaveExtensionFromBuildings(buildings, baseTimer);
  let nextTimer = baseTimer + shieldBonus;

  if (waveExtendResult.triggered) {
    nextTimer += waveExtendResult.bonusSeconds;
    if (onWaveExtend) {
      onWaveExtend({bonusSeconds: waveExtendResult.bonusSeconds});
    }
  }

  state.setCurrentEnemy(nextEnemy);
  state.updateCombatStats({waveTimer: nextTimer, waveTimerMax: nextTimer});
}

/**
 * Handles wave failure logic
 */
function handleWaveFailed(
  state: ReturnType<typeof useGameStore.getState>,
  buildings: ReturnType<typeof useGameStore.getState>['buildings'],
  currentWave: number,
  waveManager: WaveManager,
  onWaveFailed: () => void,
) {
  onWaveFailed();

  // Restart same wave
  const retryEnemy = waveManager.spawnEnemyForWave(currentWave);
  const baseTimer = waveManager.calculateWaveTimer(currentWave);
  const shieldBonus = calculateShieldGeneratorBonus(buildings);
  const retryTimer = baseTimer + shieldBonus;
  state.setCurrentEnemy(retryEnemy);
  state.updateCombatStats({waveTimer: retryTimer, waveTimerMax: retryTimer});
}
