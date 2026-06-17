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
  loadNotifications,
  saveNotifications,
  subscribeNotifications,
} from '../services/notificationsStorage';
import type { NotificationItem } from '../types/notification';

type NotificationsContextValue = {
  items: NotificationItem[];
  unreadCount: number;
  isHydrated: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshNotifications = useCallback(async () => {
    const stored = await loadNotifications();
    setItems(stored);
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadNotifications()
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

  useEffect(() => subscribeNotifications(() => void refreshNotifications()), [refreshNotifications]);

  const persistItems = useCallback(async (nextItems: NotificationItem[]) => {
    setItems(nextItems);

    try {
      await saveNotifications(nextItems);
    } catch {
      // Список у пам'яті залишається
    }
  }, []);

  const markAsRead = useCallback(
    async (id: string) => {
      const nextItems = items.map(item =>
        item.id === id ? { ...item, read: true } : item,
      );

      await persistItems(nextItems);
    },
    [items, persistItems],
  );

  const markAllAsRead = useCallback(async () => {
    const nextItems = items.map(item => ({ ...item, read: true }));
    await persistItems(nextItems);
  }, [items, persistItems]);

  const unreadCount = useMemo(() => items.filter(item => !item.read).length, [items]);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      isHydrated,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [items, unreadCount, isHydrated, refreshNotifications, markAsRead, markAllAsRead],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }

  return context;
}
