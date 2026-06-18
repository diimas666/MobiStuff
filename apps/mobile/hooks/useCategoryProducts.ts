import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { fetchProductsByCategory } from '../services/catalog';
import { getCached } from '../services/apiCache';
import { useNetworkReconnectEffect } from '../context/NetworkContext';
import { reportLoadError } from '../utils/reportLoadError';
import { errorMessages } from '../utils/errors';
import {
  defaultCategoryFilters,
  type CategoryProductFilters,
} from '../types/filters';
import {
  applyCategoryFilters,
  extractBrands,
  extractSubcategoryOptions,
  extractVariantOptions,
  getPriceBounds,
  type FilterOption,
} from '../utils/categoryFilters';
import type { ApiProduct } from '../types/catalog';
import type { PriceBounds } from '../types/filters';

const PAGE_SIZE = 20;

type CategoryProductsData = {
  products: ApiProduct[];
  filteredProducts: ApiProduct[];
  displayedProducts: ApiProduct[];
  totalCount: number;
  brands: string[];
  subcategoryOptions: FilterOption[];
  variantOptions: string[];
  priceBounds: PriceBounds;
  filters: CategoryProductFilters;
  setFilters: Dispatch<SetStateAction<CategoryProductFilters>>;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
  retry: () => void;
};

function buildInitialFilters(
  initialSubcategorySlug?: string,
  initialOnSaleOnly?: boolean,
): CategoryProductFilters {
  return {
    ...defaultCategoryFilters,
    subcategories: initialSubcategorySlug ? [initialSubcategorySlug] : [],
    onSaleOnly: initialOnSaleOnly ?? false,
  };
}

export function useCategoryProducts(
  categoryId: string,
  categoryTitle?: string,
  initialSubcategorySlug?: string,
  initialOnSaleOnly?: boolean,
): CategoryProductsData {
  const cacheKey = `category:v2:${categoryId}`;
  const cachedProducts = getCached<ApiProduct[]>(cacheKey);

  const [products, setProducts] = useState<ApiProduct[]>(cachedProducts ?? []);
  const [filters, setFilters] = useState<CategoryProductFilters>(() =>
    buildInitialFilters(initialSubcategorySlug, initialOnSaleOnly),
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(!cachedProducts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const snapshotRef = useRef(cachedProducts ?? []);

  snapshotRef.current = products;

  const retry = useCallback(() => {
    if (snapshotRef.current.length === 0) {
      setIsLoading(true);
    }

    setError(null);
    setReloadToken(token => token + 1);
  }, []);

  useEffect(() => {
    setFilters(buildInitialFilters(initialSubcategorySlug, initialOnSaleOnly));
    setVisibleCount(PAGE_SIZE);

    const cached = getCached<ApiProduct[]>(cacheKey);
    if (cached) {
      setProducts(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [cacheKey, categoryId, initialOnSaleOnly, initialSubcategorySlug]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const hadData = snapshotRef.current.length > 0;

      try {
        const data = await fetchProductsByCategory(categoryId, categoryTitle);

        if (cancelled) {
          return;
        }

        setProducts(data);
        setError(null);
      } catch (loadError) {
        if (!cancelled && !hadData) {
          setError(reportLoadError(loadError, errorMessages.loadCategoryProducts));
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
  }, [cacheKey, categoryId, categoryTitle, reloadToken]);

  useNetworkReconnectEffect(() => {
    retry();
  });

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const brands = useMemo(() => extractBrands(products), [products]);
  const subcategoryOptions = useMemo(
    () => extractSubcategoryOptions(products, categoryId),
    [products, categoryId],
  );
  const variantOptions = useMemo(
    () => extractVariantOptions(products),
    [products],
  );
  const priceBounds = useMemo(() => getPriceBounds(products), [products]);
  const filteredProducts = useMemo(
    () => applyCategoryFilters(products, filters),
    [products, filters],
  );
  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );
  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    requestAnimationFrame(() => {
      setVisibleCount(current =>
        Math.min(current + PAGE_SIZE, filteredProducts.length),
      );
      setIsLoadingMore(false);
    });
  }, [filteredProducts.length, hasMore, isLoading, isLoadingMore]);

  return {
    products,
    filteredProducts,
    displayedProducts,
    totalCount: filteredProducts.length,
    brands,
    subcategoryOptions,
    variantOptions,
    priceBounds,
    filters,
    setFilters,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    retry,
  };
}
