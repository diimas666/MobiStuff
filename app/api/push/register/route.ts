import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PushDevice from '@/app/api/models/PushDevice';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { verifyOrderAccessToken, verifyOrderToken } from '@/lib/orderAccess';
import { rateLimited } from '@/lib/rateLimit';

/**
 * Реєстрація пристрою для push. Номер прив'язується лише з ключем доступу до замовлень —
 * так ніхто не підпишеться на сповіщення про чужі замовлення.
 */
export async function POST(req: Request) {
  if (rateLimited(req, 'push-register', 30, 10 * 60 * 1000)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => null);
  const token = typeof b?.token === 'string' ? b.token.trim() : '';
  if (!/^[a-f0-9]{64,200}$/i.test(token)) return NextResponse.json({ error: 'Невірний токен' }, { status: 400 });

  const phones: string[] = [];
  for (const item of Array.isArray(b?.phones) ? b.phones.slice(0, 5) : []) {
    const phone = normalizeUkrainianPhone(typeof item?.phone === 'string' ? item.phone : '');
    if (phone && verifyOrderAccessToken(phone, item?.token)) phones.push(phone);
  }

  const orderIds: string[] = [];
  for (const item of Array.isArray(b?.orders) ? b.orders.slice(0, 50) : []) {
    const orderId = typeof item?.orderId === 'string' ? item.orderId.slice(0, 40) : '';
    const phone = normalizeUkrainianPhone(typeof item?.phone === 'string' ? item.phone : '');
    if (orderId && phone && verifyOrderToken(orderId, phone, item?.token)) orderIds.push(orderId);
  }

  // Обране та кошик — для нагадувань «ціна знизилась» і «кошик чекає» (без персональних даних)
  const extra: Record<string, unknown> = {};
  if (Array.isArray(b?.favorites)) {
    extra.favorites = b.favorites.slice(0, 100).map((f: Record<string, unknown>) => ({
      handle: String(f?.handle ?? '').slice(0, 200),
      title: String(f?.title ?? '').slice(0, 200),
      price: Math.max(0, Math.round(Number(f?.price) || 0)),
    })).filter((f: { handle: string; price: number }) => f.handle && f.price > 0);
  }
  if (b?.cart && Array.isArray(b.cart.items)) {
    const items = b.cart.items.slice(0, 50).map((i: Record<string, unknown>) => ({ handle: String(i?.handle ?? '').slice(0, 200), title: String(i?.title ?? '').slice(0, 200), quantity: Math.max(1, Math.min(99, Math.round(Number(i?.quantity) || 1))), price: Math.max(0, Math.round(Number(i?.price) || 0)) }));
    extra.cart = { items, total: items.reduce((n: number, i: { price: number; quantity: number }) => n + i.price * i.quantity, 0), updatedAt: new Date() };
    if (items.length) extra.cartNotifiedAt = null;
  }
  if (typeof b?.appVersion === 'string') extra.appVersion = b.appVersion.slice(0, 20);

  const add: Record<string, unknown> = {};
  if (phones.length) add.phones = { $each: phones };
  if (orderIds.length) add.orderIds = { $each: orderIds };
  await dbConnect();
  // Кошик не змінився — не скидаємо таймер нагадування (інакше push щоразу після відкриття)
  if (extra.cart) {
    const prev = await PushDevice.findOne({ token }, 'cart').lean<{ cart?: { items?: unknown[] } }>();
    if (JSON.stringify(prev?.cart?.items ?? []) === JSON.stringify((extra.cart as { items: unknown[] }).items)) {
      delete extra.cart;
      delete extra.cartNotifiedAt;
    }
  }
  await PushDevice.updateOne(
    { token },
    { $set: { lastSeen: new Date(), platform: 'ios', ...extra }, ...(Object.keys(add).length ? { $addToSet: add } : {}) },
    { upsert: true }
  );
  return NextResponse.json({ ok: true, linked: phones.length, orders: orderIds.length });
}
