import { useEffect, useState } from 'react';
import { fetchPromotions } from '../services/promotions';
import type { PromoBanner } from '../types/promotion';

export function usePromotions(enabled: boolean) {
  const [promotions, setPromotions] = useState<PromoBanner[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setPromotions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchPromotions()
      .then(items => {
        if (!cancelled) {
          setPromotions(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPromotions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { promotions, isLoading };
}
