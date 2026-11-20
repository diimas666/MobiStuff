import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Доступ до історії замовлень за номером телефону.
 *
 * Після успішного оформлення сервер видає клієнту підписаний ключ до номера
 * (HMAC від номера). Без цього ключа список замовлень не віддається — знаючи
 * чужий номер, переглянути чужі замовлення неможливо.
 *
 * Секрет: ORDER_ACCESS_SECRET (окремий), інакше похідний від ADMIN_SECRET.
 * Зміна секрету анулює всі видані ключі (клієнти отримають нові з наступним замовленням).
 */
function secret(): string {
  const own = process.env.ORDER_ACCESS_SECRET;
  if (own) return own;
  const admin = process.env.ADMIN_SECRET;
  if (!admin) return '';
  return createHmac('sha256', 'mobistuff-order-access').update(admin).digest('hex');
}

const VERSION = 'v1';

export function createOrderAccessToken(normalizedPhone: string): string | null {
  const key = secret();
  if (!key || !normalizedPhone) return null;
  const sig = createHmac('sha256', key).update(`orders:${normalizedPhone}`).digest('base64url');
  return `${VERSION}.${sig}`;
}

export function verifyOrderAccessToken(normalizedPhone: string, token: unknown): boolean {
  if (typeof token !== 'string' || token.length > 200) return false;
  const expected = createOrderAccessToken(normalizedPhone);
  if (!expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Хеш одноразового коду (сам код ніде не зберігається) */
export function hashOtp(normalizedPhone: string, code: string): string {
  return createHmac('sha256', `otp:${secret()}`).update(`${normalizedPhone}:${code}`).digest('base64url');
}

export function otpMatches(normalizedPhone: string, code: string, hash: string): boolean {
  const a = Buffer.from(hashOtp(normalizedPhone, code));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Ключ до ОДНОГО замовлення (видається тому, хто його оформив).
 * Не відкриває історію номера — для цього потрібен код з SMS.
 */
export function createOrderToken(orderId: string, normalizedPhone: string): string | null {
  const key = secret();
  if (!key || !orderId) return null;
  return `o1.${createHmac('sha256', key).update(`order:${orderId}:${normalizedPhone}`).digest('base64url')}`;
}

export function verifyOrderToken(orderId: string, normalizedPhone: string, token: unknown): boolean {
  if (typeof token !== 'string' || token.length > 200) return false;
  const expected = createOrderToken(orderId, normalizedPhone);
  if (!expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
