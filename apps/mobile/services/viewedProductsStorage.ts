import type { ViewedProductItem } from '../types/viewedProducts';
import { getStorageItem, removeStorageItem, setStorageItem } from './safeStorage';

const VIEWED_PRODUCTS_STORAGE_KEY = 'viewed_products';

export async function loadViewedProducts(): Promise<ViewedProductItem[]> {
  const stored = await getStorageItem(VIEWED_PRODUCTS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as ViewedProductItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveViewedProducts(items: ViewedProductItem[]): Promise<void> {
  await setStorageItem(VIEWED_PRODUCTS_STORAGE_KEY, JSON.stringify(items));
}

export async function clearStoredViewedProducts(): Promise<void> {
  await removeStorageItem(VIEWED_PRODUCTS_STORAGE_KEY);
}
