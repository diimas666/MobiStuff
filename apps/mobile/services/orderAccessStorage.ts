import { getSecureItem as getStorageItem, setSecureItem as setStorageItem } from './secureStorage';

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

/** Усі збережені ключі: номер (без +380) → ключ */
export async function getAllOrderAccessTokens(): Promise<{ phone: string; token: string }[]> {
  const tokens = await loadTokens();
  return Object.entries(tokens).map(([phone, token]) => ({ phone, token }));
}

/* Ключі до окремих замовлень, оформлених з цього телефону (для push-статусів) */
const ORDER_TOKENS_KEY = 'order_tokens';
type OrderTokenItem = { orderId: string; phone: string; token: string };

export async function saveOrderToken(item: OrderTokenItem): Promise<void> {
  const stored = await getStorageItem(ORDER_TOKENS_KEY);
  let list: OrderTokenItem[] = [];
  try {
    list = stored ? (JSON.parse(stored) as OrderTokenItem[]) : [];
  } catch {
    list = [];
  }
  const next = [item, ...list.filter(i => i.orderId !== item.orderId)].slice(0, 50);
  await setStorageItem(ORDER_TOKENS_KEY, JSON.stringify(next));
}

export async function getAllOrderTokens(): Promise<OrderTokenItem[]> {
  const stored = await getStorageItem(ORDER_TOKENS_KEY);
  try {
    return stored ? (JSON.parse(stored) as OrderTokenItem[]) : [];
  } catch {
    return [];
  }
}
