import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { isOrderStatus, normalizeOrderStatus, ORDER_STATUS_LABELS } from '@/lib/orderStatus';

/** Вивантаження замовлень у CSV для Excel (UTF-8 з BOM, розділювач «;») */
export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const filter: Record<string, unknown> = {};
  if (status && isOrderStatus(status)) filter.status = status;
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from && !Number.isNaN(Date.parse(from))) range.$gte = new Date(from);
    if (to && !Number.isNaN(Date.parse(to))) range.$lte = new Date(`${to}T23:59:59`);
    if (Object.keys(range).length) filter.createdAt = range;
  }

  await dbConnect();
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean<Record<string, any>[]>();

  // Захист від формул у Excel (=, +, -, @ на початку)
  const cell = (v: unknown) => {
    let s = String(v ?? '').replace(/\r?\n/g, ' ');
    if (/^[=@\t]/.test(s) || /^[+-][^\d]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = ['Дата', '№', 'Статус', 'Імʼя', 'Прізвище', 'Телефон', 'Email', 'Місто', 'Відділення', 'Оплата', 'Сума', 'ТТН', 'Товари', 'Коментар клієнта', 'Примітка менеджера', 'Джерело'];
  const lines = orders.map((o) =>
    [
      new Date(o.createdAt).toLocaleString('uk-UA'),
      o.orderId,
      ORDER_STATUS_LABELS[normalizeOrderStatus(o.status)],
      o.name,
      o.lastName,
      o.phone,
      o.email,
      o.city,
      o.warehouse,
      o.paymentMethod === 'card' ? 'Картка' : 'Післяплата',
      o.total,
      o.ttn,
      (o.items ?? []).map((i: any) => `${i.title} ×${i.quantity}`).join(', '),
      o.comment,
      o.managerNote,
      o.utm ? [o.utm.utm_source, o.utm.utm_campaign].filter(Boolean).join(' / ') : '',
    ]
      .map(cell)
      .join(';')
  );
  const csv = '﻿' + [head.map(cell).join(';'), ...lines].join('\r\n');
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
