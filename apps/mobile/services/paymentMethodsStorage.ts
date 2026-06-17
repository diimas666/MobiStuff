import type { PaymentMethodSettings } from '../types/paymentMethods';
import { getStorageItem, removeStorageItem, setStorageItem } from './safeStorage';

const PAYMENT_METHODS_STORAGE_KEY = 'payment_methods';

const DEFAULT_SETTINGS: PaymentMethodSettings = {
  defaultMethod: 'card_transfer',
};

export async function loadPaymentMethodsSettings(): Promise<PaymentMethodSettings> {
  const stored = await getStorageItem(PAYMENT_METHODS_STORAGE_KEY);

  if (!stored) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(stored) as PaymentMethodSettings & { savedCards?: unknown };
    return {
      defaultMethod: parsed.defaultMethod ?? DEFAULT_SETTINGS.defaultMethod,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function savePaymentMethodsSettings(
  settings: PaymentMethodSettings,
): Promise<void> {
  await setStorageItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(settings));
}

export async function clearStoredPaymentMethodsSettings(): Promise<void> {
  await removeStorageItem(PAYMENT_METHODS_STORAGE_KEY);
}
