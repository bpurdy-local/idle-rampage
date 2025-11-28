import {useState, useEffect, useRef, useCallback} from 'react';

export interface UseAnimatedCounterOptions {
  duration?: number;
  onComplete?: () => void;
}

export interface UseAnimatedCounterReturn {
  value: number;
  isAnimating: boolean;
  animate: (targetValue: number) => void;
}

export const useAnimatedCounter = (
  options: UseAnimatedCounterOptions = {},
): UseAnimatedCounterReturn => {
  const {duration = 1500, onComplete} = options;

  const [value, setValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);
  const targetValueRef = useRef<number>(0);

  const animate = useCallback(
    (targetValue: number) => {
      if (targetValue === 0) {
        setValue(0);
        onComplete?.();
        return;
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      startTimeRef.current = Date.now();
      startValueRef.current = 0;
      targetValueRef.current = targetValue;
      setIsAnimating(true);

      const tick = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(
          startValueRef.current +
            (targetValueRef.current - startValueRef.current) * eased,
        );

        setValue(currentValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick);
        } else {
          setValue(targetValueRef.current);
          setIsAnimating(false);
          onComplete?.();
        }
      };

      animationRef.current = requestAnimationFrame(tick);
    },
    [duration, onComplete],
  );

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    value,
    isAnimating,
    animate,
  };
};
