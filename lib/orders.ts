import mongoose from 'mongoose';
import Product from '@/app/api/models/Product';
import { DEFAULT_ORDER_STATUS, generateOrderId } from '@/lib/orderStatus';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { getStoreSettings } from '@/lib/storeSettings';

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export class OrderValidationError extends Error {}

type RawItem = Record<string, unknown>;

/**
 * Будує замовлення з даних клієнта, НЕ довіряючи цінам і сумі з браузера:
 * ціни беруться з бази, сума рахується на сервері, статус завжди початковий.
 */
export async function buildOrderFromPayload(data: Record<string, unknown>) {
  const name = str(data.name, 80);
  const lastName = str(data.lastName, 80);
  const phone = normalizeUkrainianPhone(str(data.phone, 30));
  const city = str(data.city, 160);
  const warehouse = str(data.warehouse, 300);

  if (!name || !phone || !city || !warehouse) {
    throw new OrderValidationError('Заповніть імʼя, телефон, місто та відділення');
  }

  const rawItems = Array.isArray(data.items) ? (data.items as RawItem[]).slice(0, 50) : [];
  if (!rawItems.length) throw new OrderValidationError('Кошик порожній');

  const ids = new Set<string>();
  const handles = new Set<string>();
  for (const it of rawItems) {
    const id = str(it._id) || str(it.productId) || str(it.id);
    if (id && mongoose.Types.ObjectId.isValid(id)) ids.add(id);
    else if (str(it.handle)) handles.add(str(it.handle));
  }

  const products = await Product.find({
    $or: [{ _id: { $in: [...ids] } }, { handle: { $in: [...handles] } }],
  })
    .select('title handle image price inStock brand')
    .lean<{ _id: unknown; title: string; handle: string; image: string; price: number; inStock?: boolean; brand?: string }[]>();

  const byId = new Map(products.map((p) => [String(p._id), p]));
  const byHandle = new Map(products.map((p) => [p.handle, p]));

  const items = rawItems.map((it) => {
    const id = str(it._id) || str(it.productId) || str(it.id);
    const product = byId.get(id) || byHandle.get(str(it.handle));
    if (!product) throw new OrderValidationError('Деякі товари більше недоступні. Оновіть кошик.');
    if (product.inStock === false) {
      throw new OrderValidationError(`«${product.title}» закінчився. Приберіть його з кошика.`);
    }
    const quantity = Math.min(99, Math.max(1, Math.floor(Number(it.quantity) || 1)));
    return {
      _id: String(product._id),
      handle: product.handle,
      title: product.title,
      image: product.image,
      brand: product.brand,
      price: product.price,
      quantity,
      ...(str(it.variant) ? { variant: str(it.variant, 80) } : {}),
    };
  });

  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  // Застосунок раніше надсилав card_online / card_transfer — це теж оплата карткою
  let paymentMethod = ['card', 'card_online', 'card_transfer'].includes(str(data.paymentMethod)) ? 'card' : 'cod';
  const { cardOnlyFrom } = await getStoreSettings();
  if (total >= cardOnlyFrom) paymentMethod = 'card';

  const email = str(data.email, 120);

  // Джерело трафіку (з реклами) — для аналізу, яка реклама приносить замовлення
  const rawUtm = data.utm && typeof data.utm === 'object' ? (data.utm as Record<string, unknown>) : null;
  const utm = rawUtm
    ? Object.fromEntries(
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ttclid', 'landing', 'at']
          .map((k) => [k, str(rawUtm[k], 200)])
          .filter(([, v]) => v)
      )
    : undefined;

  return {
    orderId: str(data.orderId, 40) || str(data.id, 40) || generateOrderId(),
    status: DEFAULT_ORDER_STATUS,
    name,
    lastName,
    phone,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
    comment: str(data.comment, 1000) || undefined,
    city,
    cityRef: str(data.cityRef, 80) || undefined,
    warehouse,
    paymentMethod,
    total,
    items,
    createdAt: new Date().toISOString(),
    ...(utm && Object.keys(utm).length ? { utm } : {}),
  };
}

export type BuiltOrder = Awaited<ReturnType<typeof buildOrderFromPayload>>;

/** Сповіщення в Telegram (без HTTP-ендпоінта, щоб його не можна було спамити ззовні) */
export async function notifyTelegram(order: BuiltOrder) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const itemsText = order.items
    .map((it, i) => `${i + 1}. ${it.title}${it.variant ? ` (${it.variant})` : ''} — ${it.quantity} × ${it.price}₴ = ${it.quantity * it.price}₴`)
    .join('\n');

  const text = [
    `🛒 НОВЕ ЗАМОВЛЕННЯ ${order.orderId}`,
    `👤 ${order.name} ${order.lastName}`,
    `📞 ${order.phone}`,
    order.comment ? `💬 ${order.comment}` : '',
    `📍 ${order.city}`,
    `🏤 ${order.warehouse}`,
    `💳 Оплата: ${order.paymentMethod === 'card' ? 'Карткою' : 'Післяплата'}`,
    `💰 Всього: ${order.total} ₴`,
    order.utm ? `📣 Джерело: ${[order.utm.utm_source, order.utm.utm_campaign, order.utm.utm_content].filter(Boolean).join(' / ') || (order.utm.fbclid ? 'Facebook/Instagram' : order.utm.gclid ? 'Google Ads' : order.utm.ttclid ? 'TikTok' : '—')}` : '',
    '',
    '🧾 Товари:',
    itemsText,
  ]
    .filter((l) => l !== '')
    .join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error('Telegram notify failed', e);
  }
}
