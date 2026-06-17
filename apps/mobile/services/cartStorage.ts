import type { CartItem } from '../types/cart';
import { getStorageItem, removeStorageItem, setStorageItem } from './safeStorage';

const CART_STORAGE_KEY = 'cart';

export async function loadCart(): Promise<CartItem[]> {
  const stored = await getStorageItem(CART_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCart(items: CartItem[]): Promise<void> {
  await setStorageItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export async function clearStoredCart(): Promise<void> {
  await removeStorageItem(CART_STORAGE_KEY);
}
