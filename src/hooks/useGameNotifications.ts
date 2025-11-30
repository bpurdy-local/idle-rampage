/**
 * Hook to manage all game notifications and popups.
 * Consolidates notification state and handlers from GameScreen.
 */
import {useState, useCallback, useRef} from 'react';
import {TapRippleData} from '../components/game/TapRipple';
import {ResourcePopupData} from '../components/game/ResourcePopup';
import {SpecialEffectNotificationData} from '../components/game/SpecialEffectNotification';
import {DropResult} from '../systems/LuckyDropSystem';

export function useGameNotifications() {
  // Lucky drop notifications
  const [activeDrop, setActiveDrop] = useState<DropResult | null>(null);

  // Tap ripple effects
  const [tapRipples, setTapRipples] = useState<TapRippleData[]>([]);
  const tapRippleIdRef = useRef(0);

  // Resource popups (scrap/blueprints earned)
  const [resourcePopups, setResourcePopups] = useState<ResourcePopupData[]>([]);
  const resourcePopupIdRef = useRef(0);

  // Special effect notifications (scrap find, wave extend, etc.)
  const [specialEffectNotifications, setSpecialEffectNotifications] = useState<
    SpecialEffectNotificationData[]
  >([]);
  const specialEffectNotificationIdRef = useRef(0);

  // Victory flash
  const [showVictoryFlash, setShowVictoryFlash] = useState(false);
  const [victoryWasBoss, setVictoryWasBoss] = useState(false);

  // Wave extend flash
  const [showWaveExtendFlash, setShowWaveExtendFlash] = useState(false);
  const [waveExtendBonusSeconds, setWaveExtendBonusSeconds] = useState(0);

  // Tap ripple handlers
  const spawnTapRipple = useCallback((x: number, y: number) => {
    const id = `ripple_${tapRippleIdRef.current++}`;
    setTapRipples(prev => [...prev.slice(-5), {id, x, y}]);
  }, []);

  const removeTapRipple = useCallback((id: string) => {
    setTapRipples(prev => prev.filter(r => r.id !== id));
  }, []);

  // Resource popup handlers
  const spawnResourcePopup = useCallback(
    (amount: number, type: 'scrap' | 'blueprints', x: number, y: number) => {
      const id = `resource_${resourcePopupIdRef.current++}`;
      setResourcePopups(prev => [...prev.slice(-3), {id, amount, type, x, y}]);
    },
    [],
  );

  const removeResourcePopup = useCallback((id: string) => {
    setResourcePopups(prev => prev.filter(r => r.id !== id));
  }, []);

  // Lucky drop handlers
  const showLuckyDrop = useCallback((drop: DropResult) => {
    setActiveDrop(drop);
  }, []);

  const hideLuckyDrop = useCallback(() => {
    setActiveDrop(null);
  }, []);

  // Victory flash handlers
  const showVictory = useCallback((isBoss: boolean) => {
    setVictoryWasBoss(isBoss);
    setShowVictoryFlash(true);
  }, []);

  const hideVictory = useCallback(() => {
    setShowVictoryFlash(false);
  }, []);

  // Special effect notification handlers
  const spawnSpecialEffectNotification = useCallback(
    (data: Omit<SpecialEffectNotificationData, 'id'>) => {
      const id = `special_${specialEffectNotificationIdRef.current++}`;
      setSpecialEffectNotifications(prev => [...prev.slice(-2), {...data, id}]);
    },
    [],
  );

  const removeSpecialEffectNotification = useCallback((id: string) => {
    setSpecialEffectNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Wave extend flash handlers
  const showWaveExtend = useCallback((bonusSeconds: number) => {
    setWaveExtendBonusSeconds(Math.round(bonusSeconds));
    setShowWaveExtendFlash(true);
  }, []);

  const hideWaveExtend = useCallback(() => {
    setShowWaveExtendFlash(false);
  }, []);

  return {
    // Lucky drops
    activeDrop,
    showLuckyDrop,
    hideLuckyDrop,

    // Tap ripples
    tapRipples,
    spawnTapRipple,
    removeTapRipple,

    // Resource popups
    resourcePopups,
    spawnResourcePopup,
    removeResourcePopup,

    // Victory flash
    showVictoryFlash,
    victoryWasBoss,
    showVictory,
    hideVictory,

    // Special effects
    specialEffectNotifications,
    spawnSpecialEffectNotification,
    removeSpecialEffectNotification,

    // Wave extend
    showWaveExtendFlash,
    waveExtendBonusSeconds,
    showWaveExtend,
    hideWaveExtend,
  };
}
