import type { FavoriteItem } from '../types/favorites';
import { getStorageItem, removeStorageItem, setStorageItem } from './safeStorage';

const FAVORITES_STORAGE_KEY = 'favorites';

export async function loadFavorites(): Promise<FavoriteItem[]> {
  const stored = await getStorageItem(FAVORITES_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as FavoriteItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveFavorites(items: FavoriteItem[]): Promise<void> {
  await setStorageItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
}

export async function clearStoredFavorites(): Promise<void> {
  await removeStorageItem(FAVORITES_STORAGE_KEY);
}
