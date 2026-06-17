import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loadViewedProducts,
  saveViewedProducts,
} from '../services/viewedProductsStorage';
import { getSettingsSnapshot } from '../services/settingsStorage';
import {
  toViewedProductItem,
  type ViewedProductInput,
  type ViewedProductItem,
} from '../types/viewedProducts';

const MAX_VIEWED_PRODUCTS = 50;

type ViewedProductsContextValue = {
  items: ViewedProductItem[];
  isHydrated: boolean;
  addViewedProduct: (product: ViewedProductInput) => Promise<void>;
  clearViewedProducts: () => Promise<void>;
};

const ViewedProductsContext = createContext<ViewedProductsContextValue | null>(null);

export function ViewedProductsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ViewedProductItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadViewedProducts()
      .then(stored => {
        if (isMounted) {
          setItems(stored);
        }
      })
      .catch(() => {
        if (isMounted) {
          setItems([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const persistItems = useCallback(async (nextItems: ViewedProductItem[]) => {
    try {
      await saveViewedProducts(nextItems);
    } catch {
      // Список у пам'яті залишається, навіть якщо збереження недоступне
    }
  }, []);

  const addViewedProduct = useCallback(
    async (product: ViewedProductInput) => {
      const settings = await getSettingsSnapshot();

      if (!settings.saveViewedHistory) {
        return;
      }

      const nextItem = toViewedProductItem(product);

      setItems(current => {
        const withoutDuplicate = current.filter(item => item.productId !== product.id);
        const nextItems = [nextItem, ...withoutDuplicate].slice(0, MAX_VIEWED_PRODUCTS);
        void persistItems(nextItems);
        return nextItems;
      });
    },
    [persistItems],
  );

  const clearViewedProducts = useCallback(async () => {
    setItems([]);
    await persistItems([]);
  }, [persistItems]);

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      addViewedProduct,
      clearViewedProducts,
    }),
    [addViewedProduct, clearViewedProducts, isHydrated, items],
  );

  return (
    <ViewedProductsContext.Provider value={value}>
      {children}
    </ViewedProductsContext.Provider>
  );
}

export function useViewedProducts() {
  const context = useContext(ViewedProductsContext);

  if (!context) {
    throw new Error('useViewedProducts must be used within ViewedProductsProvider');
  }

  return context;
}
