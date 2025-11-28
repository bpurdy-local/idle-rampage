import {useEffect, useRef, useCallback} from 'react';
import {eventBus, GameEvents} from '../core/EventBus';

interface GameLoopOptions {
  tickRate?: number;
  onTick?: (deltaTime: number) => void;
  isPaused?: boolean;
}

export const useGameLoop = ({
  tickRate = 100,
  onTick,
  isPaused = false,
}: GameLoopOptions = {}) => {
  const lastTickRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(isPaused);

  isPausedRef.current = isPaused;

  const tick = useCallback(() => {
    if (isPausedRef.current) return;

    const now = Date.now();
    const deltaTime = now - lastTickRef.current;
    lastTickRef.current = now;

    eventBus.emit(GameEvents.TICK, {deltaTime, timestamp: now});
    onTick?.(deltaTime);
  }, [onTick]);

  const start = useCallback(() => {
    if (intervalRef.current) return;

    lastTickRef.current = Date.now();
    intervalRef.current = setInterval(tick, tickRate);
  }, [tick, tickRate]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    lastTickRef.current = Date.now();
  }, []);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  useEffect(() => {
    if (isPaused) {
      pause();
    } else {
      resume();
    }
  }, [isPaused, pause, resume]);

  return {
    start,
    stop,
    pause,
    resume,
    isRunning: intervalRef.current !== null,
  };
};
