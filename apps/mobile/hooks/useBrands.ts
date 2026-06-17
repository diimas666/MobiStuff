import { useCallback, useEffect, useState } from 'react';
import { api, baseUrl } from '../config/api';
import { resolveBrandItems } from '../constants/brands';
import { CACHE_TTL, cachedFetch } from '../services/apiCache';
import type { BrandItem } from '../types/brand';
import { useNetworkReconnectEffect } from '../context/NetworkContext';

async function loadBrandsFromApi(): Promise<BrandItem[]> {
  const response = await api.brands();

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  const data = (await response.json()) as BrandItem[];

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Empty brands response');
  }

  return data;
}

export function useBrands() {
  const [items, setItems] = useState<BrandItem[]>(() => resolveBrandItems(baseUrl));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadToken(token => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchBrands() {
      try {
        const brands = await cachedFetch('brands:list', CACHE_TTL.long, loadBrandsFromApi);

        if (!cancelled) {
          setItems(brands);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setItems(resolveBrandItems(baseUrl));
          setError(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchBrands();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useNetworkReconnectEffect(() => {
    retry();
  });

  return { items, isLoading, error, retry };
}
