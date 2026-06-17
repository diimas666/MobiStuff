import type { NotificationItem } from '../types/notification';
import { getStorageItem, removeStorageItem, setStorageItem } from './safeStorage';

const NOTIFICATIONS_STORAGE_KEY = 'notifications';
const MAX_NOTIFICATIONS = 100;

type NotificationListener = () => void;

const listeners = new Set<NotificationListener>();

export function subscribeNotifications(listener: NotificationListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function sortNotifications(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function trimNotifications(items: NotificationItem[]): NotificationItem[] {
  return sortNotifications(items).slice(0, MAX_NOTIFICATIONS);
}

export async function loadNotifications(): Promise<NotificationItem[]> {
  const stored = await getStorageItem(NOTIFICATIONS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as NotificationItem[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return trimNotifications(parsed);
  } catch {
    return [];
  }
}

export async function saveNotifications(items: NotificationItem[]): Promise<void> {
  await setStorageItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimNotifications(items)));
  notifyListeners();
}

export async function appendNotification(
  notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>,
): Promise<NotificationItem> {
  const items = await loadNotifications();
  const nextItem: NotificationItem = {
    ...notification,
    id: `NOTIF-${Date.now().toString(36).toUpperCase()}-${items.length}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  await saveNotifications([nextItem, ...items]);
  return nextItem;
}

export async function clearStoredNotifications(): Promise<void> {
  await removeStorageItem(NOTIFICATIONS_STORAGE_KEY);
  notifyListeners();
}
