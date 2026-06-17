import { api } from '../config/api';
import { CACHE_TTL, cachedFetch } from './apiCache';
import type { PromoBanner } from '../types/promotion';

type PromotionsResponse = {
  promotions: PromoBanner[];
};

export async function fetchPromotions(): Promise<PromoBanner[]> {
  return cachedFetch('promotions:active', CACHE_TTL.medium, async () => {
    const response = await api.promotions();

    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }

    const data = (await response.json()) as PromotionsResponse;
    return data.promotions ?? [];
  });
}
