import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';
import { applyOrderUpdate } from '@/lib/orderUpdate';
import { answerCallback, editMessageButtons, isManagerChat, orderButtons, webhookSecret } from '@/lib/telegram';
import { isOrderStatus, ORDER_STATUS_LABELS } from '@/lib/orderStatus';

/** Натискання кнопок під замовленням у Telegram (лише з чату менеджера) */
export async function POST(req: Request) {
  const got = Buffer.from(req.headers.get('x-telegram-bot-api-secret-token') || '');
  const want = Buffer.from(webhookSecret());
  if (!process.env.TELEGRAM_BOT_TOKEN || got.length !== want.length || !timingSafeEqual(got, want)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const u = await req.json().catch(() => null);
  const cb = u?.callback_query;
  if (!cb) return NextResponse.json({ ok: true });
  const chat = cb.message?.chat?.id;
  if (!isManagerChat(chat)) {
    await answerCallback(cb.id, 'Немає доступу');
    return NextResponse.json({ ok: true });
  }

  const [kind, orderId, status] = String(cb.data || '').split(':');
  if (kind !== 'st' || !orderId || !isOrderStatus(status)) {
    await answerCallback(cb.id, 'Невідома дія');
    return NextResponse.json({ ok: true });
  }
  await dbConnect();
  const order = await Order.findOne({ orderId }).lean<Record<string, any>>();
  if (!order) {
    await answerCallback(cb.id, 'Замовлення не знайдено');
    return NextResponse.json({ ok: true });
  }
  if (status === 'shipped' && !order.ttn) {
    // Без ТТН відправку краще оформити в адмінці (щоб клієнт отримав номер)
    await answerCallback(cb.id, 'Додайте ТТН в адмінці — клієнт отримає номер посилки');
    return NextResponse.json({ ok: true });
  }
  await applyOrderUpdate(order, { status, notify: true });
  await answerCallback(cb.id, `${orderId}: ${ORDER_STATUS_LABELS[status]}`);
  if (cb.message?.message_id) await editMessageButtons(chat, cb.message.message_id, orderButtons(orderId, status));
  return NextResponse.json({ ok: true });
}
