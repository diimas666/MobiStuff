import type { DeliveryAddress } from '../types/deliveryAddress';
import { getStorageItem, removeStorageItem, setStorageItem } from './safeStorage';

const DELIVERY_ADDRESSES_STORAGE_KEY = 'delivery_addresses';

export async function loadDeliveryAddresses(): Promise<DeliveryAddress[]> {
  const stored = await getStorageItem(DELIVERY_ADDRESSES_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as DeliveryAddress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveDeliveryAddresses(addresses: DeliveryAddress[]): Promise<void> {
  await setStorageItem(DELIVERY_ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
}

export async function clearStoredDeliveryAddresses(): Promise<void> {
  await removeStorageItem(DELIVERY_ADDRESSES_STORAGE_KEY);
}
