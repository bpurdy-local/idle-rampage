import {useState, useCallback, useRef} from 'react';
import {DamagePopupData} from '../components/game/DamagePopup';

const MAX_POPUPS = 20;

export interface UseDamagePopupsReturn {
  popups: DamagePopupData[];
  spawnPopup: (damage: number, isBurst: boolean, x: number, y: number) => void;
  removePopup: (id: string) => void;
}

export const useDamagePopups = (): UseDamagePopupsReturn => {
  const [popups, setPopups] = useState<DamagePopupData[]>([]);
  const idCounter = useRef(0);

  const spawnPopup = useCallback(
    (damage: number, isBurst: boolean, x: number, y: number) => {
      const id = `popup_${idCounter.current++}`;

      const newPopup: DamagePopupData = {
        id,
        damage,
        isBurst,
        x: x - (isBurst ? 30 : 20),
        y: y - (isBurst ? 40 : 25),
      };

      setPopups(current => {
        const updated = [...current, newPopup];
        if (updated.length > MAX_POPUPS) {
          return updated.slice(-MAX_POPUPS);
        }
        return updated;
      });
    },
    [],
  );

  const removePopup = useCallback((id: string) => {
    setPopups(current => current.filter(p => p.id !== id));
  }, []);

  return {
    popups,
    spawnPopup,
    removePopup,
  };
};
