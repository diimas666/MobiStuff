import { useCallback, useEffect, useState } from 'react';
import { fetchCategories } from '../services/catalog';
import { getCached } from '../services/apiCache';
import { useNetworkReconnectEffect } from '../context/NetworkContext';
import { reportLoadError } from '../utils/reportLoadError';
import { errorMessages } from '../utils/errors';
import type { HomeCategory } from '../types/catalog';

type CategoriesData = {
  categories: HomeCategory[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

export function useCategories(): CategoriesData {
  const cached = getCached<HomeCategory[]>('categories:all');
  const [categories, setCategories] = useState<HomeCategory[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadToken(token => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchCategories();

        if (cancelled) {
          return;
        }

        setCategories(data);
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          setError(reportLoadError(loadError, errorMessages.loadCategories));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useNetworkReconnectEffect(() => {
    retry();
  });

  return { categories, isLoading, error, retry };
}
