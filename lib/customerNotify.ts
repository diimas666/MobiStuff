import 'server-only';
import nodemailer from 'nodemailer';
import { getStoreSettings } from '@/lib/storeSettings';
import { SITE_NAME, absoluteUrl } from '@/lib/site';

/**
 * Повідомлення клієнтам: email (SMTP) і SMS (TurboSMS).
 * Канал працює, лише якщо його налаштовано на сервері й увімкнено в адмінці.
 */

type NotifyOrder = {
  orderId?: string;
  name?: string;
  phone?: string;
  email?: string;
  total?: number;
  paymentMethod?: string;
  city?: string;
  warehouse?: string;
  ttn?: string;
  items?: { title?: string; quantity?: number; price?: number }[];
};

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const trackingUrl = (ttn: string) => `https://novaposhta.ua/tracking/?cargo_number=${encodeURIComponent(ttn)}`;

export async function sendSms(phone: string, text: string): Promise<boolean> {
  const token = process.env.TURBOSMS_TOKEN;
  const digits = phone.replace(/\D/g, '');
  if (!token || !/^380\d{9}$/.test(digits)) return false;
  try {
    const res = await fetch('https://api.turbosms.ua/message/send.json', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients: [digits], sms: { sender: process.env.TURBOSMS_SENDER || SITE_NAME, text } }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => ({}));
    // 0, 1 — успіх, 800–803 — прийнято до відправки
    return res.ok && [0, 1, 800, 801, 802, 803].includes(Number(data?.response_code));
  } catch (e) {
    console.error('SMS failed', e);
    return false;
  }
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;
  try {
    const port = Number(SMTP_PORT) || 587;
    await nodemailer
      .createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } })
      .sendMail({ from: `"${SITE_NAME}" <${SMTP_USER}>`, to, subject, html });
    return true;
  } catch (e) {
    console.error('Email failed', e);
    return false;
  }
}

function emailLayout(title: string, body: string) {
  return `<div style="background:#f5f5f7;padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1d1d1f">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:28px">
    <p style="margin:0 0 18px;font-size:20px;font-weight:600">${esc(SITE_NAME)}</p>
    <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25">${title}</h1>
    ${body}
  </div></div>`;
}

function itemsTable(order: NotifyOrder) {
  const rows = (order.items ?? [])
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(i.title)} × ${esc(i.quantity)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${esc((i.price ?? 0) * (i.quantity ?? 1))} ₴</td></tr>`
    )
    .join('');
  return `<table style="width:100%;border-collapse:collapse;font-size:15px">${rows}<tr><td style="padding:12px 0 0;font-weight:600">Разом</td><td style="padding:12px 0 0;text-align:right;font-weight:600">${esc(order.total)} ₴</td></tr></table>`;
}

/** Підтвердження нового замовлення. Повертає канали, якими надіслано. */
export async function notifyOrderCreated(order: NotifyOrder): Promise<string[]> {
  const s = await getStoreSettings();
  const sent: string[] = [];
  const card = order.paymentMethod === 'card';
  const payLine = card
    ? s.cardPaymentDetails
      ? `Оплата карткою: ${s.cardPaymentDetails}`
      : 'Реквізити для оплати карткою надішлемо після підтвердження.'
    : 'Оплата при отриманні у відділенні.';

  if (s.notifyCustomers.sms && order.phone) {
    const text = `${SITE_NAME}: замовлення ${order.orderId} на ${order.total} грн прийнято. ${card && s.cardPaymentDetails ? `Оплата: ${s.cardPaymentDetails}` : 'Скоро зателефонуємо.'}`.slice(0, 600);
    if (await sendSms(order.phone, text)) sent.push('sms');
  }

  if (s.notifyCustomers.email && order.email) {
    const body = `<p style="font-size:15px;line-height:1.55;margin:0 0 18px">${esc(order.name)}, дякуємо! Ми отримали замовлення <b>${esc(order.orderId)}</b> і скоро звʼяжемося для підтвердження.</p>
      ${itemsTable(order)}
      <p style="font-size:15px;line-height:1.55;margin:18px 0 0"><b>Доставка:</b> ${esc(order.city)}, ${esc(order.warehouse)}<br><b>Оплата:</b> ${esc(payLine)}</p>
      ${s.phone ? `<p style="font-size:14px;color:#6e6e73;margin:18px 0 0">Питання? Телефонуйте: ${esc(s.phone)}</p>` : ''}`;
    if (await sendEmail(order.email, `Замовлення ${order.orderId} прийнято`, emailLayout('Замовлення прийнято', body))) sent.push('email');
  }
  return sent;
}

/** Замовлення відправлено: номер ТТН і посилання на відстеження */
export async function notifyOrderShipped(order: NotifyOrder): Promise<string[]> {
  if (!order.ttn) return [];
  const s = await getStoreSettings();
  const sent: string[] = [];

  if (s.notifyCustomers.sms && order.phone) {
    const text = `${SITE_NAME}: замовлення ${order.orderId} відправлено Новою Поштою. ТТН ${order.ttn}`;
    if (await sendSms(order.phone, text)) sent.push('sms');
  }

  if (s.notifyCustomers.email && order.email) {
    const body = `<p style="font-size:15px;line-height:1.55;margin:0 0 18px">${esc(order.name)}, ваше замовлення <b>${esc(order.orderId)}</b> вже в дорозі.</p>
      <p style="font-size:15px;margin:0 0 6px">Номер ТТН Нової Пошти:</p>
      <p style="font-size:24px;font-weight:600;letter-spacing:.02em;margin:0 0 18px">${esc(order.ttn)}</p>
      <a href="${trackingUrl(order.ttn)}" style="display:inline-block;background:#138a47;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">Відстежити посилку</a>
      <p style="font-size:14px;color:#6e6e73;margin:22px 0 0">${esc(order.city)}, ${esc(order.warehouse)}</p>
      <p style="font-size:14px;color:#6e6e73;margin:6px 0 0"><a href="${absoluteUrl('/')}" style="color:#138a47">${esc(SITE_NAME)}</a></p>`;
    if (await sendEmail(order.email, `Замовлення ${order.orderId} відправлено — ТТН ${order.ttn}`, emailLayout('Посилку відправлено', body))) sent.push('email');
  }
  return sent;
}
