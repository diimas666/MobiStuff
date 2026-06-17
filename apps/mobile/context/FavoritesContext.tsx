import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadFavorites, saveFavorites } from '../services/favoritesStorage';
import {
  toFavoriteItem,
  type FavoriteItem,
  type FavoriteProductInput,
} from '../types/favorites';
import { showToast } from './ToastContext';

type FavoritesContextValue = {
  items: FavoriteItem[];
  favorites: string[];
  isHydrated: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: FavoriteProductInput) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadFavorites()
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

  const persistItems = useCallback(async (nextItems: FavoriteItem[]) => {
    try {
      await saveFavorites(nextItems);
    } catch {
      // Список у пам'яті залишається, навіть якщо збереження недоступне
    }
  }, []);

  const isFavorite = useCallback(
    (productId: string) => items.some(item => item.productId === productId),
    [items],
  );

  const toggleFavorite = useCallback(
    async (product: FavoriteProductInput) => {
      const exists = items.some(item => item.productId === product.id);
      const nextItems = exists
        ? items.filter(item => item.productId !== product.id)
        : [...items, toFavoriteItem(product)];

      setItems(nextItems);
      await persistItems(nextItems);
      showToast(
        exists ? 'Видалено з обраного' : 'Додано в обране',
        exists ? 'info' : 'success',
      );
    },
    [items, persistItems],
  );

  const removeFavorite = useCallback(
    async (productId: string) => {
      const nextItems = items.filter(item => item.productId !== productId);
      setItems(nextItems);
      await persistItems(nextItems);
    },
    [items, persistItems],
  );

  const favorites = useMemo(() => items.map(item => item.productId), [items]);

  const value = useMemo(
    () => ({
      items,
      favorites,
      isHydrated,
      isFavorite,
      toggleFavorite,
      removeFavorite,
    }),
    [favorites, isFavorite, isHydrated, items, removeFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }

  return context;
}
