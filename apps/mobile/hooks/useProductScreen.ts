import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchProductByHandle,
  fetchRelatedProducts,
} from '../services/catalog';
import { getCached } from '../services/apiCache';
import { useNetworkReconnectEffect } from '../context/NetworkContext';
import { reportLoadError } from '../utils/reportLoadError';
import { errorMessages } from '../utils/errors';
import type { HomeProduct, ProductDetail } from '../types/catalog';

type ProductScreenData = {
  product: ProductDetail | null;
  related: HomeProduct[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

export function useProductScreen(handle: string): ProductScreenData {
  const [product, setProduct] = useState<ProductDetail | null>(
    () => getCached<ProductDetail>(`product:${handle}`),
  );
  const [related, setRelated] = useState<HomeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(
    () => !getCached<ProductDetail>(`product:${handle}`),
  );
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const snapshotRef = useRef<ProductDetail | null>(product);

  snapshotRef.current = product;

  const retry = useCallback(() => {
    if (!snapshotRef.current) {
      setIsLoading(true);
    }

    setError(null);
    setReloadToken(token => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cached = getCached<ProductDetail>(`product:${handle}`);
    const hadProduct = Boolean(snapshotRef.current ?? cached);

    if (cached) {
      setProduct(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    setError(null);
    setRelated([]);

    async function load() {
      try {
        const detail = await fetchProductByHandle(handle);

        if (cancelled) {
          return;
        }

        setProduct(detail);
        setIsLoading(false);

        if (detail.categorySlug) {
          const relatedProducts = await fetchRelatedProducts(
            detail.categorySlug,
            detail.handle,
          );

          if (!cancelled) {
            setRelated(relatedProducts);
          }
        }
      } catch (loadError) {
        if (!cancelled && !hadProduct) {
          setError(reportLoadError(loadError, errorMessages.loadProduct));
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [handle, reloadToken]);

  useNetworkReconnectEffect(() => {
    retry();
  });

  return { product, related, isLoading, error, retry };
}
