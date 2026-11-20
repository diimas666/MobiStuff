import { Linking, Platform, Settings } from 'react-native';
import { api } from '../config/api';
import { getAllOrderAccessTokens, getAllOrderTokens } from './orderAccessStorage';
import { getStorageItem, setStorageItem } from './safeStorage';
import { APP_VERSION } from '../constants/appVersion';

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

type Extra = {
  /** Обране з ціною — для «ціна знизилась» */
  favorites?: { handle: string; title: string; price: number }[];
  /** Кошик — для «кошик чекає» */
  cart?: { items: { handle: string; title: string; quantity: number; price: number }[] };
};

/** Зареєструвати токен на сервері (при запуску, після замовлення, при зміні кошика/обраного) */
export async function syncPushToken(extra: Extra = {}) {
  if (Platform.OS !== 'ios') return;
  let token: unknown;
  try {
    token = Settings.get('pushToken');
  } catch {
    return; // нативний модуль недоступний (тести) — просто пропускаємо
  }
  if (typeof token !== 'string' || !token) return;
  // Номери — лише підтверджені кодом з SMS; замовлення — оформлені з цього телефону
  const phones = (await getAllOrderAccessTokens()).map(p => ({ phone: p.phone, token: p.token }));
  const orders = await getAllOrderTokens();
  await api.registerPush({ token, phones, orders, appVersion: APP_VERSION, ...extra }).catch(() => {});
}
