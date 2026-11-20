import 'server-only';
import Order from '@/app/api/models/Order';
import { isOrderStatus, ORDER_STATUS_LABELS } from '@/lib/orderStatus';
import { notifyOrderShipped } from '@/lib/customerNotify';
import { pushForOrder } from '@/lib/apns';
import { awardCashback, refundPoints } from '@/lib/loyalty';

export class OrderUpdateError extends Error {}

/**
 * Зміна замовлення (статус, ТТН, примітка) з усіма наслідками:
 * push клієнту, ТТН у SMS/email, кешбек, повернення балів, історія.
 * Використовується в адмінці та кнопками в Telegram.
 */
export async function applyOrderUpdate(order: Record<string, any>, body: Record<string, any>) {
  const id = order._id;
  const history: string[] = [];
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ''> = {};

  if (body.status !== undefined) {
    if (!isOrderStatus(body.status)) throw new OrderUpdateError('Невірний статус');
    if (body.status !== order.status) {
      history.push(`Статус: ${ORDER_STATUS_LABELS[body.status as keyof typeof ORDER_STATUS_LABELS]}`);
      $set.status = order.status = body.status;
    }
  }

  if (body.ttn !== undefined) {
    const ttn = String(body.ttn ?? '').replace(/\s/g, '');
    if (ttn && !/^\d{10,20}$/.test(ttn)) {
      throw new OrderUpdateError('ТТН — це 14 цифр (напр. 20450012345678)');
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
  return { saved, notified };
}
