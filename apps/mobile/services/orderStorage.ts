import type { StoredOrder } from '../types/order';
import { getStorageItem, setStorageItem } from './safeStorage';

const ORDERS_STORAGE_KEY = 'orders';

export async function loadOrders(): Promise<StoredOrder[]> {
  const stored = await getStorageItem(ORDERS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as StoredOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveOrders(orders: StoredOrder[]): Promise<void> {
  await setStorageItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}
