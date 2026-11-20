import { Linking, Platform, Settings } from 'react-native';
import { api } from '../config/api';
import { getAllOrderAccessTokens } from './orderAccessStorage';
import { getStorageItem, setStorageItem } from './safeStorage';

/**
 * Push-сповіщення (iOS). Нативна частина (AppDelegate) зберігає токен APNs
 * у UserDefaults → читаємо через Settings і реєструємо на сервері разом із
 * ключами доступу до замовлень (щоб приходили статуси саме своїх замовлень).
 */
const ASKED_KEY = 'push_permission_asked';

/** Запитати дозвіл (один раз — після першого замовлення) */
export async function askPushPermissionOnce() {
  if (Platform.OS !== 'ios') return;
  if (await getStorageItem(ASKED_KEY)) return;
  await setStorageItem(ASKED_KEY, '1');
  await Linking.openURL('mobistuff://push-enable').catch(() => {});
  // токен зʼявляється за мить після дозволу
  setTimeout(() => void syncPushToken(), 4000);
}

/** Зареєструвати токен на сервері (при запуску й після замовлення) */
export async function syncPushToken() {
  if (Platform.OS !== 'ios') return;
  let token: unknown;
  try {
    token = Settings.get('pushToken');
  } catch {
    return; // нативний модуль недоступний (тести) — просто пропускаємо
  }
  if (typeof token !== 'string' || !token) return;
  const phones = (await getAllOrderAccessTokens()).map(p => ({ phone: p.phone, token: p.token }));
  await api.registerPush({ token, phones }).catch(() => {});
}
