import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Авторизація адмінки: пароль = ADMIN_SECRET (лише на сервері).
 * Після входу видаємо httpOnly-cookie з підписаною сесією (HMAC),
 * тож сам пароль ніколи не зберігається в браузері.
 */

export const ADMIN_COOKIE = 'ms_admin';
export const ADMIN_SESSION_TTL = 60 * 60 * 24 * 7; // 7 днів

function secret() {
  return process.env.ADMIN_SECRET || '';
}

function sign(payload: string) {
  return createHmac('sha256', `mobistuff-admin:${secret()}`).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyPassword(password: unknown): boolean {
  const s = secret();
  if (!s || typeof password !== 'string') return false;
  // HMAC обох значень вирівнює довжину — порівняння без витоку через час
  return safeEqual(sign(`pw:${password}`), sign(`pw:${s}`));
}

export function createSessionToken(ttl = ADMIN_SESSION_TTL): string {
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token || !secret()) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  if (!safeEqual(sig, sign(payload))) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now() / 1000;
}

function readCookie(req: Request, name: string) {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function checkAdminAuth(req: Request): boolean {
  return isValidSessionToken(readCookie(req, ADMIN_COOKIE));
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export function sessionCookie(value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${ADMIN_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

/* ---------- Вхід за одноразовим посиланням (без пароля) ----------
 * Посилання створює скрипт `npm run admin` на компʼютері, де лежить .env.local
 * з ADMIN_SECRET. Діє 10 хвилин і лише один раз. Підпис — той самий HMAC,
 * тож без секрету підробити посилання неможливо.
 */
export const LINK_SESSION_TTL = 60 * 60 * 24 * 90; // довірений компʼютер: 90 днів
const usedLinks = new Map<string, number>();

export function verifyLoginLink(token: string | null): boolean {
  if (!token || !secret()) return false;
  const [payload, sig] = token.split('.');
  if (!payload?.startsWith('link-') || !sig) return false;
  if (!safeEqual(sig, sign(payload))) return false;
  const exp = Number(payload.slice(5));
  const now = Date.now() / 1000;
  if (!Number.isFinite(exp) || exp < now || exp > now + 15 * 60) return false;
  for (const [k, e] of usedLinks) if (e < now) usedLinks.delete(k);
  if (usedLinks.has(token)) return false;
  usedLinks.set(token, exp);
  return true;
}

/* Простий ліміт спроб входу (на інстанс): 8 спроб / 15 хв з одного IP */
const attempts = new Map<string, { count: number; until: number }>();

export function loginRateLimited(req: Request): boolean {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.until < now) {
    attempts.set(ip, { count: 1, until: now + 15 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 8;
}
