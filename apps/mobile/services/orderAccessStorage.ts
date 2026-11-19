import { getStorageItem, setStorageItem } from './safeStorage';

/**
 * Ключі доступу до історії замовлень: сервер видає їх після оформлення
 * замовлення, і лише з ключем повертає замовлення за номером телефону.
 */
const ORDER_ACCESS_KEY = 'orders_access_tokens';

type TokenMap = Record<string, string>;

function phoneKey(phone: string) {
  return phone.replace(/\D/g, '').slice(-9);
}

async function loadTokens(): Promise<TokenMap> {
  const stored = await getStorageItem(ORDER_ACCESS_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === 'object' ? (parsed as TokenMap) : {};
  } catch {
    return {};
  }
}

export async function getOrderAccessToken(phone: string): Promise<string | null> {
  const key = phoneKey(phone);
  if (!key) return null;
  const tokens = await loadTokens();
  return tokens[key] ?? null;
}

export async function saveOrderAccessToken(phone: string, token: string): Promise<void> {
  const key = phoneKey(phone);
  if (!key || !token) return;
  const tokens = await loadTokens();
  if (tokens[key] === token) return;
  await setStorageItem(ORDER_ACCESS_KEY, JSON.stringify({ ...tokens, [key]: token }));
}
