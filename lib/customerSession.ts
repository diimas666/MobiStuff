import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

/** Сесія покупця на сайті (після входу кодом з SMS): httpOnly cookie з підписом */
export const CUSTOMER_COOKIE = 'ms_customer';
const TTL = 60 * 60 * 24 * 30;

const secret = () => `customer:${process.env.ORDER_ACCESS_SECRET || process.env.ADMIN_SECRET || ''}`;
const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export function createCustomerSession(phone: string) {
  const payload = `${Buffer.from(phone).toString('base64url')}.${Math.floor(Date.now() / 1000) + TTL}`;
  return `${payload}.${sign(payload)}`;
}

export function readCustomerSession(token: string | undefined | null): string | null {
  if (!token || !process.env.ORDER_ACCESS_SECRET && !process.env.ADMIN_SECRET) return null;
  const [p, exp, sig] = token.split('.');
  if (!p || !exp || !sig) return null;
  const expected = sign(`${p}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  return Buffer.from(p, 'base64url').toString();
}

export function customerCookie(value: string, maxAge = TTL) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${CUSTOMER_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** Номер покупця з cookie (для серверних сторінок і API) */
export async function currentCustomerPhone(): Promise<string | null> {
  const jar = await cookies();
  return readCustomerSession(jar.get(CUSTOMER_COOKIE)?.value);
}
