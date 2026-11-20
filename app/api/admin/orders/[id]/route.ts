import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { isOrderStatus, ORDER_STATUS_LABELS } from '@/lib/orderStatus';
import { notifyOrderShipped } from '@/lib/customerNotify';
import { pushForOrder } from '@/lib/apns';
import { awardCashback, refundPoints } from '@/lib/loyalty';

type Ctx = { params: Promise<{ id: string }> };

/**
 * Оновлення замовлення з адмінки: статус, ТТН, примітка менеджера.
 * notify: true — надіслати клієнту ТТН (якщо статус «Відправлено» і ТТН вказано).
 */
export async function PATCH(req: Request, { params }: Ctx) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Замовлення не знайдено' }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Некоректні дані' }, { status: 400 });

  await dbConnect();
  const order = await Order.findById(id).lean<Record<string, any>>();
  if (!order) return NextResponse.json({ error: 'Замовлення не знайдено' }, { status: 404 });

  const history: string[] = [];
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ''> = {};

  if (body.status !== undefined) {
    if (!isOrderStatus(body.status)) return NextResponse.json({ error: 'Невірний статус' }, { status: 400 });
    if (body.status !== order.status) {
      history.push(`Статус: ${ORDER_STATUS_LABELS[body.status as keyof typeof ORDER_STATUS_LABELS]}`);
      $set.status = order.status = body.status;
    }
  }

  if (body.ttn !== undefined) {
    const ttn = String(body.ttn ?? '').replace(/\s/g, '');
    if (ttn && !/^\d{10,20}$/.test(ttn)) {
      return NextResponse.json({ error: 'ТТН — це 14 цифр (напр. 20450012345678)' }, { status: 400 });
    }
    if (ttn !== (order.ttn ?? '')) {
      history.push(ttn ? `ТТН: ${ttn}` : 'ТТН прибрано');
      if (ttn) $set.ttn = order.ttn = ttn;
      else {
        $unset.ttn = '';
        delete order.ttn;
      }
    }
  }

  if (body.managerNote !== undefined) {
    const note = String(body.managerNote ?? '').trim().slice(0, 2000);
    if (note) $set.managerNote = note;
    else $unset.managerNote = '';
  }

  let notified: string[] = [];
  if (body.notify === true && order.status === 'shipped' && order.ttn) {
    notified = await notifyOrderShipped(order).catch(() => []);
    history.push(notified.length ? `Клієнту надіслано ТТН: ${notified.join(', ')}` : 'ТТН клієнту не надіслано (немає email/SMS-каналу)');
  }

  // Push у застосунок при зміні статусу (якщо клієнт увімкнув сповіщення)
  if ($set.status) {
    const texts: Record<string, string> = {
      in_progress: 'Збираємо ваше замовлення',
      shipped: order.ttn ? `Посилку відправлено. ТТН ${order.ttn}` : 'Посилку відправлено Новою Поштою',
      completed: 'Замовлення виконано. Дякуємо за покупку!',
      cancelled: 'Замовлення скасовано. Якщо це помилка — напишіть нам',
      returned: 'Повернення оформлено. Кошти повернемо протягом кількох днів',
    };
    const text = texts[String($set.status)];
    if (text) {
      const sent = await pushForOrder(String(order.orderId), String(order.phone), { title: `Замовлення ${order.orderId}`, body: text, url: 'mobistuff://orders' }).catch(() => 0);
      if (sent) history.push(`Push у застосунок: ${text}`);
    }
  }

  // Кешбек: «Виконано» — нараховуємо, «Скасовано» — повертаємо списані бали
  if ($set.status === 'completed') {
    const pts = await awardCashback(String(order.orderId)).catch(() => 0);
    if (pts) history.push(`Кешбек: +${pts} балів`);
  }
  if ($set.status === 'cancelled' || $set.status === 'returned') {
    const back = await refundPoints(String(order.orderId)).catch(() => 0);
    if (back) history.push(`Повернуто ${back} балів`);
  }

  const update: Record<string, unknown> = {};
  if (Object.keys($set).length) update.$set = $set;
  if (Object.keys($unset).length) update.$unset = $unset;
  if (history.length) update.$push = { history: { $each: history.map((text) => ({ text, at: new Date() })) } };
  const saved = Object.keys(update).length
    ? await Order.findByIdAndUpdate(id, update, { new: true, strict: false }).lean()
    : order;
  return NextResponse.json({ order: saved, notified });
}
