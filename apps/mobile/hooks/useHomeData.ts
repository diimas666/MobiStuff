import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHomeCatalog } from '../services/catalog';
import { getCached } from '../services/apiCache';
import { useNetworkReconnectEffect } from '../context/NetworkContext';
import { reportLoadError } from '../utils/reportLoadError';
import { errorMessages } from '../utils/errors';
import {
  mapProduct,
  type ApiProduct,
  type HomeCategory,
  type HomeProduct,
} from '../types/catalog';

type HomeCatalogCache = {
  categories: HomeCategory[];
  trending: ApiProduct[];
  popular: ApiProduct[];
};

type HomeData = {
  categories: HomeCategory[];
  trending: HomeProduct[];
  popular: HomeProduct[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

function mapHomeCatalog(data: HomeCatalogCache) {
  return {
    categories: data.categories,
    trending: data.trending.map(mapProduct),
    popular: data.popular.map(mapProduct),
  };
}

function hasHomeData(
  categories: HomeCategory[],
  trending: HomeProduct[],
  popular: HomeProduct[],
) {
  return categories.length > 0 || trending.length > 0 || popular.length > 0;
}

export function useHomeData(): HomeData {
  const cachedCatalog = getCached<HomeCatalogCache>('home:catalog');
  const initial = cachedCatalog ? mapHomeCatalog(cachedCatalog) : null;

  const [categories, setCategories] = useState<HomeCategory[]>(
    initial?.categories ?? [],
  );
  const [trending, setTrending] = useState<HomeProduct[]>(initial?.trending ?? []);
  const [popular, setPopular] = useState<HomeProduct[]>(initial?.popular ?? []);
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const snapshotRef = useRef({
    categories: initial?.categories ?? [],
    trending: initial?.trending ?? [],
    popular: initial?.popular ?? [],
  });

  snapshotRef.current = { categories, trending, popular };

  const retry = useCallback(() => {
    const hasData = hasHomeData(
      snapshotRef.current.categories,
      snapshotRef.current.trending,
      snapshotRef.current.popular,
    );

    if (!hasData) {
      setIsLoading(true);
    }

    setError(null);
    setReloadToken(token => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const hadData = hasHomeData(
        snapshotRef.current.categories,
        snapshotRef.current.trending,
        snapshotRef.current.popular,
      );

      try {
        const data = await fetchHomeCatalog();

        if (cancelled) {
          return;
        }

        setCategories(data.categories);
        setTrending(data.trending.map(mapProduct));
        setPopular(data.popular.map(mapProduct));
        setError(null);
      } catch (loadError) {
        if (!cancelled && !hadData) {
          setError(reportLoadError(loadError, errorMessages.loadData));
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

  return {
    categories,
    trending,
    popular,
    isLoading,
    error,
    retry,
  };
}
