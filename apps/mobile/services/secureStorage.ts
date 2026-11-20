import * as Keychain from 'react-native-keychain';
import { getStorageItem, removeStorageItem } from './safeStorage';

/**
 * Секрети (ключі доступу до замовлень) — у Keychain iOS: шифруються системою,
 * не потрапляють у незашифровані резервні копії і не переносяться на інший пристрій.
 * Старі значення з AsyncStorage переносяться автоматично при першому читанні.
 */
const SERVICE = 'shop.mobistuff.app.secure';
const memory = new Map<string, string | null>();

export async function getSecureItem(key: string): Promise<string | null> {
  if (memory.has(key)) return memory.get(key) ?? null;
  let value: string | null = null;
  try {
    const res = await Keychain.getGenericPassword({ service: `${SERVICE}.${key}` });
    value = res ? res.password : null;
  } catch {
    value = null;
  }
  if (value === null) {
    const legacy = await getStorageItem(key);
    if (legacy) {
      const moved = await setSecureItem(key, legacy);
      if (moved) await removeStorageItem(key);
      value = legacy;
    }
  }
  memory.set(key, value);
  return value;
}

export async function setSecureItem(key: string, value: string): Promise<boolean> {
  memory.set(key, value);
  try {
    await Keychain.setGenericPassword(key, value, {
      service: `${SERVICE}.${key}`,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    return true;
  } catch {
    return false;
  }
}
