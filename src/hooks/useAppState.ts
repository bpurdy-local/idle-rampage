import {useEffect, useRef, useCallback} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {eventBus, GameEvents} from '../core/EventBus';

interface AppStateCallbacks {
  onForeground?: (inactiveTime: number) => void;
  onBackground?: () => void;
}

export const useAppState = ({onForeground, onBackground}: AppStateCallbacks = {}) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundTime = useRef<number>(0);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const inactiveTime = Date.now() - backgroundTime.current;
        eventBus.emit(GameEvents.APP_FOREGROUNDED, {inactiveTime});
        onForeground?.(inactiveTime);
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        backgroundTime.current = Date.now();
        eventBus.emit(GameEvents.APP_BACKGROUNDED, {timestamp: backgroundTime.current});
        onBackground?.();
      }

      appState.current = nextAppState;
    },
    [onForeground, onBackground],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [handleAppStateChange]);

  return {
    currentState: appState.current,
    isActive: appState.current === 'active',
    isBackground: appState.current === 'background',
  };
};
