import type { SavedCheckoutProfile } from '../types/checkoutForm';
import { getStorageItem, setStorageItem } from './safeStorage';

const CHECKOUT_PROFILE_KEY = 'checkout_profile';

export async function loadCheckoutProfile(): Promise<SavedCheckoutProfile | null> {
  const stored = await getStorageItem(CHECKOUT_PROFILE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as SavedCheckoutProfile;
  } catch {
    return null;
  }
}

export async function saveCheckoutProfile(profile: SavedCheckoutProfile): Promise<void> {
  await setStorageItem(CHECKOUT_PROFILE_KEY, JSON.stringify(profile));
}
