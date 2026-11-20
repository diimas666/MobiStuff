import 'server-only';
import { randomBytes } from 'crypto';
import dbConnect from '@/lib/dbConnect';
import CartDraft from '@/app/api/models/CartDraft';
import StockAlert from '@/app/api/models/StockAlert';
import Order from '@/app/api/models/Order';
import Product from '@/app/api/models/Product';
import PromoCode from '@/app/api/models/PromoCode';
import { emailLayout, sendEmail, sendSms } from '@/lib/customerNotify';
import { pushToPhone } from '@/lib/apns';
import { getStoreSettings } from '@/lib/storeSettings';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import PushDevice from '@/app/api/models/PushDevice';
import { sendPush } from '@/lib/apns';
import { getAppConfig } from '@/lib/appConfig';
import { createOrderToken } from '@/lib/orderAccess';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';

const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = (n: number) => `${Math.round(n).toLocaleString('uk-UA')} грн`;

type Draft = { _id: unknown; phone?: string; email?: string; name?: string; items: { title: string; quantity: number; price: number }[]; total: number; restoreToken: string; updatedAt: Date };

/** Нагадування про кошики (1–48 год без оформлення) і «товар знову в наявності» */
export async function runReminders() {
  await dbConnect();
  const s = await getStoreSettings();
  const stats = { carts: 0, cartsSkipped: 0, stock: 0, reviewRequests: 0, appCart: 0, priceDrop: 0, winback: 0 };
  if (s.remindersEnabled === false) return { ...stats, disabled: true };
  const promoPercent = s.reminderPromoPercent ?? 5;

  const now = Date.now();
  const drafts = await CartDraft.find({
    notifiedAt: { $exists: false },
    convertedAt: { $exists: false },
    updatedAt: { $lte: new Date(now - 60 * 60 * 1000), $gte: new Date(now - 48 * 60 * 60 * 1000) },
  })
    .limit(200)
    .lean<Draft[]>();

  for (const d of drafts) {
    // Уже оформив замовлення після цього кошика — не турбуємо
    if (d.phone && (await Order.exists({ phone: d.phone, createdAt: { $gte: new Date(d.updatedAt).toISOString() } }))) {
      await CartDraft.updateOne({ _id: d._id }, { $set: { convertedAt: new Date() } });
      stats.cartsSkipped++;
      continue;
    }

    let promo = '';
    if (promoPercent > 0) {
      promo = `CART-${randomBytes(3).toString('hex').toUpperCase()}`;
      await PromoCode.create({ code: promo, type: 'percent', value: promoPercent, maxUses: 1, expiresAt: new Date(now + 3 * 24 * 60 * 60 * 1000), note: 'Нагадування про кошик' });
    }
    const link = absoluteUrl(`/cart?restore=${d.restoreToken}`);
    const promoLine = promo ? `Знижка ${promoPercent}% з кодом ${promo} (3 дні).` : '';
    let sent = false;

    if (d.phone && s.notifyCustomers.sms) {
      sent = (await sendSms(d.phone, `${SITE_NAME}: ваш кошик на ${fmt(d.total)} чекає. ${promoLine} ${link}`.replace(/\s+/g, ' ').trim())) || sent;
    }
    if (d.email && s.notifyCustomers.email) {
      const list = d.items.map((i) => `<li>${esc(i.title)} × ${esc(i.quantity)}</li>`).join('');
      const body = `<p style="font-size:15px;line-height:1.55">${d.name ? `${esc(d.name)}, ` : ''}ви не завершили замовлення. Товари чекають у кошику:</p><ul style="font-size:15px;line-height:1.6">${list}</ul>${promo ? `<p style="font-size:15px">Знижка <b>${promoPercent}%</b> з кодом <b>${promo}</b> — діє 3 дні.</p>` : ''}<a href="${link}" style="display:inline-block;margin-top:8px;background:#138a47;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">Повернутися до кошика</a>`;
      sent = (await sendEmail(d.email, 'Ваш кошик чекає', emailLayout('Ваш кошик чекає', body))) || sent;
    }
    if (d.phone) {
      sent = (await pushToPhone(d.phone, { title: 'Ваш кошик чекає', body: `${fmt(d.total)}. ${promoLine}`.trim(), url: 'mobistuff://cart' })) > 0 || sent;
    }
    await CartDraft.updateOne({ _id: d._id }, { $set: { notifiedAt: new Date(), ...(promo ? { promoCode: promo } : {}) } });
    if (sent) stats.carts++;
  }

  // Товар знову в наявності
  const alerts = await StockAlert.find({ notifiedAt: { $exists: false } }).limit(500).lean<{ _id: unknown; productId: string; handle: string; title: string; phone?: string; email?: string }[]>();
  if (alerts.length) {
    const inStock = new Set(
      (await Product.find({ _id: { $in: [...new Set(alerts.map((a) => a.productId))] }, inStock: { $ne: false } }).select('_id').lean<{ _id: unknown }[]>()).map((p) => String(p._id))
    );
    for (const a of alerts.filter((x) => inStock.has(x.productId))) {
      const link = absoluteUrl(`/product/${a.handle}`);
      if (a.phone) {
        await sendSms(a.phone, `${SITE_NAME}: «${a.title.slice(0, 60)}» знову в наявності. ${link}`);
        await pushToPhone(a.phone, { title: 'Знову в наявності', body: a.title, url: `mobistuff://product/${a.handle}` });
      }
      if (a.email) await sendEmail(a.email, 'Товар знову в наявності', emailLayout('Знову в наявності', `<p style="font-size:15px">${esc(a.title)}</p><a href="${link}" style="color:#138a47;font-weight:600">Перейти до товару</a>`));
      await StockAlert.updateOne({ _id: a._id }, { $set: { notifiedAt: new Date() } });
      stats.stock++;
    }
  }
  await requestReviews(stats, s.notifyCustomers);
  await appPushes(stats);
  return stats;
}

/** Через 4–10 днів після «Виконано» — попросити відгук (посилання з ключем замовлення) */
async function requestReviews(stats: { reviewRequests: number }, channels: { sms: boolean; email: boolean }) {
  const now = Date.now();
  const orders = await Order.find({
    status: 'completed',
    reviewRequestedAt: { $exists: false },
    updatedAt: { $lte: new Date(now - 4 * 864e5), $gte: new Date(now - 10 * 864e5) },
  })
    .limit(100)
    .lean<{ _id: unknown; orderId: string; phone: string; email?: string; name?: string }[]>();
  for (const o of orders) {
    const phone = normalizeUkrainianPhone(o.phone || '');
    const token = phone ? createOrderToken(o.orderId, phone) : null;
    if (!phone || !token) continue;
    const link = absoluteUrl(`/review/${encodeURIComponent(o.orderId)}?t=${encodeURIComponent(token)}`);
    let sent = (await pushToPhone(phone, { title: 'Як вам покупка?', body: 'Оцініть товари — це займе хвилину і допоможе іншим покупцям', url: link })) > 0;
    if (!sent && o.email && channels.email) {
      sent = await sendEmail(o.email, 'Як вам покупка?', emailLayout('Як вам покупка?', `<p style="font-size:15px;line-height:1.55">${o.name ? `${esc(o.name)}, д` : 'Д'}якуємо за замовлення ${esc(o.orderId)}! Оцініть, будь ласка, товари — це допоможе іншим покупцям.</p><a href="${link}" style="display:inline-block;margin-top:8px;background:#138a47;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">Залишити відгук</a>`));
    }
    if (!sent && channels.sms) sent = await sendSms(phone, `${SITE_NAME}: дякуємо за покупку! Оцініть товари: ${link}`);
    await Order.updateOne({ _id: o._id }, { $set: { reviewRequestedAt: new Date() } }, { strict: false });
    if (sent) stats.reviewRequests++;
  }
}

/** Автоматичні push застосунку: кошик чекає, ціна на обране знизилась, давно не заходили */
async function appPushes(stats: { appCart: number; priceDrop: number; winback: number }) {
  const cfg = (await getAppConfig()).autoPush;
  const now = Date.now();

  if (cfg.cart) {
    const devices = await PushDevice.find({
      'cart.items.0': { $exists: true },
      'cart.updatedAt': { $lte: new Date(now - 3 * 3600e3), $gte: new Date(now - 48 * 3600e3) },
      $or: [{ cartNotifiedAt: null }, { cartNotifiedAt: { $exists: false } }],
    })
      .limit(500)
      .lean<{ _id: unknown; token: string; cart: { items: { title: string }[]; total: number } }[]>();
    for (const d of devices) {
      const n = d.cart.items.length;
      const sent = await sendPush([d.token], { title: 'Ваш кошик чекає', body: n === 1 ? d.cart.items[0].title : `${n} товари на ${fmt(d.cart.total)}`, url: 'mobistuff://cart' });
      await PushDevice.updateOne({ _id: d._id }, { $set: { cartNotifiedAt: new Date() } });
      stats.appCart += sent;
    }
  }

  if (cfg.priceDrop) {
    const devices = await PushDevice.find({ 'favorites.0': { $exists: true } }).limit(2000).lean<{ _id: unknown; token: string; favorites: { handle: string; title: string; price: number }[] }[]>();
    const handles = [...new Set(devices.flatMap((d) => d.favorites.map((f) => f.handle)))];
    const prices = new Map((await Product.find({ handle: { $in: handles }, inStock: { $ne: false } }, 'handle price').lean<{ handle: string; price: number }[]>()).map((p) => [p.handle, p.price]));
    for (const d of devices) {
      const dropped = d.favorites.find((f) => (prices.get(f.handle) ?? Infinity) <= f.price * 0.95);
      if (!dropped) continue;
      const now = prices.get(dropped.handle)!;
      const sent = await sendPush([d.token], { title: 'Ціна знизилась', body: `${dropped.title}: ${fmt(now)} замість ${fmt(dropped.price)}`, url: `mobistuff://product/${dropped.handle}` });
      // Запамʼятовуємо нову ціну — повторно сповістимо лише при наступному зниженні
      await PushDevice.updateOne({ _id: d._id, 'favorites.handle': dropped.handle }, { $set: { 'favorites.$.price': now } });
      stats.priceDrop += sent;
    }
  }

  if (cfg.winback) {
    const devices = await PushDevice.find({
      lastSeen: { $lte: new Date(now - 30 * 864e5), $gte: new Date(now - 120 * 864e5) },
      $or: [{ winbackAt: { $exists: false } }, { winbackAt: { $lte: new Date(now - 60 * 864e5) } }],
    })
      .limit(300)
      .lean<{ _id: unknown; token: string }[]>();
    for (const d of devices) {
      let body = 'Ми додали нові чохли, зарядки й навушники — загляньте';
      if (cfg.winbackPromoPercent > 0) {
        const code = `BACK-${randomBytes(3).toString('hex').toUpperCase()}`;
        await PromoCode.create({ code, type: 'percent', value: cfg.winbackPromoPercent, maxUses: 1, expiresAt: new Date(now + 7 * 864e5), note: 'Повернення в застосунок' });
        body = `Знижка ${cfg.winbackPromoPercent}% на наступне замовлення з кодом ${code} (7 днів)`;
      }
      const sent = await sendPush([d.token], { title: 'Давно не бачились 👋', body, url: 'mobistuff://home' });
      await PushDevice.updateOne({ _id: d._id }, { $set: { winbackAt: new Date() } });
      stats.winback += sent;
    }
  }
}
