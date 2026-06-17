import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadOrders, saveOrders } from '../services/orderStorage';
import {
  applySyncedStatuses,
  fetchOrderStatuses,
  ordersStatusChanged,
} from '../services/orderSync';
import type { StoredOrder } from '../types/order';

type OrdersContextValue = {
  orders: StoredOrder[];
  isHydrated: boolean;
  isSyncing: boolean;
  addOrder: (order: StoredOrder) => Promise<void>;
  refreshOrders: () => Promise<void>;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

function sortOrders(orders: StoredOrder[]) {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncOrders = useCallback(async (stored: StoredOrder[]) => {
    if (!stored.length) return stored;

    setIsSyncing(true);

    try {
      const statuses = await fetchOrderStatuses(stored);
      const synced = applySyncedStatuses(stored, statuses);

      if (ordersStatusChanged(stored, synced)) {
        await saveOrders(synced);
      }

      return synced;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    const stored = await loadOrders();
    const synced = await syncOrders(stored);
    setOrders(sortOrders(synced));
  }, [syncOrders]);

  useEffect(() => {
    let isMounted = true;

    loadOrders()
      .then(async stored => {
        const synced = await syncOrders(stored);
        if (isMounted) {
          setOrders(sortOrders(synced));
        }
      })
      .catch(() => {
        if (isMounted) {
          setOrders([]);
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
  }, [syncOrders]);

  const addOrder = useCallback(async (order: StoredOrder) => {
    const stored = await loadOrders();
    const nextOrders = [order, ...stored];
    setOrders(sortOrders(nextOrders));
    await saveOrders(nextOrders);
  }, []);

  const value = useMemo(
    () => ({
      orders,
      isHydrated,
      isSyncing,
      addOrder,
      refreshOrders,
    }),
    [orders, isHydrated, isSyncing, addOrder, refreshOrders],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }

  return context;
}
