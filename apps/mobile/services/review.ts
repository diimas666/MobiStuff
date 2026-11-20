import { Linking, Platform } from 'react-native';
import { getStorageItem, setStorageItem } from './safeStorage';

const COUNT_KEY = 'successful_orders_count';
const ASKED_KEY = 'review_asked_at';

/**
 * Запит оцінки App Store: після 2-го успішного замовлення, не частіше разу на 4 місяці.
 * Саме вікно показує iOS (і сама обмежує частоту).
 */
export async function maybeAskForReview() {
  if (Platform.OS !== 'ios') return;
  const count = Number((await getStorageItem(COUNT_KEY)) || 0) + 1;
  await setStorageItem(COUNT_KEY, String(count));
  if (count < 2) return;
  const asked = Number((await getStorageItem(ASKED_KEY)) || 0);
  if (asked && Date.now() - asked < 120 * 864e5) return;
  await setStorageItem(ASKED_KEY, String(Date.now()));
  setTimeout(() => void Linking.openURL('mobistuff://request-review').catch(() => {}), 2500);
}
