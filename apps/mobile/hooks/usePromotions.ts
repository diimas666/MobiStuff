import { useEffect, useState } from 'react';
import { fetchPromotions } from '../services/promotions';
import { getCached } from '../services/apiCache';
import { useNetworkReconnectEffect } from '../context/NetworkContext';
import type { PromoBanner } from '../types/promotion';

const PROMOTIONS_CACHE_KEY = 'promotions:active';

export function usePromotions(enabled: boolean) {
  const cached = enabled ? getCached<PromoBanner[]>(PROMOTIONS_CACHE_KEY) : null;
  const [promotions, setPromotions] = useState<PromoBanner[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(enabled && !cached);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setPromotions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const hadData = (getCached<PromoBanner[]>(PROMOTIONS_CACHE_KEY) ?? []).length > 0;

    if (!hadData) {
      setIsLoading(true);
    }

    fetchPromotions()
      .then(items => {
        if (!cancelled) {
          setPromotions(items);
        }
      })
      .catch(() => {
        if (!cancelled && !hadData) {
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
  }, [enabled, reloadToken]);

  useNetworkReconnectEffect(() => {
    if (enabled) {
      setReloadToken(token => token + 1);
    }
  });

  return { promotions, isLoading };
}
