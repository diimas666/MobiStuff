import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';
import Product from '@/app/api/models/Product';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { generateOrderId } from '@/lib/orderStatus';
import { createOrderToken } from '@/lib/orderAccess';
import { rateLimited } from '@/lib/rateLimit';

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * «Купити в 1 клік»: лише телефон — менеджер передзвонить і уточнить доставку.
 * Ціна — з бази; сповіщення в Telegram з позначкою «передзвонити».
 */
export async function POST(req: Request) {
  if (rateLimited(req, 'quick-order', 5, 10 * 60 * 1000)) {
    return NextResponse.json({ message: 'Забагато спроб. Спробуйте за кілька хвилин або зателефонуйте нам.' }, { status: 429 });
  }
  const b = await req.json().catch(() => null);
  const phone = normalizeUkrainianPhone(str(b?.phone, 30));
  if (!phone) return NextResponse.json({ message: 'Вкажіть номер телефону: 0XX XXX XX XX' }, { status: 400 });
  const productId = str(b?.productId, 40);
  if (!mongoose.Types.ObjectId.isValid(productId)) return NextResponse.json({ message: 'Товар не знайдено' }, { status: 400 });

  await dbConnect();
  const p = await Product.findById(productId).select('title handle image price inStock brand').lean<{
    _id: unknown; title: string; handle: string; image: string; price: number; inStock?: boolean; brand?: string;
  }>();
  if (!p) return NextResponse.json({ message: 'Товар не знайдено' }, { status: 404 });
  if (p.inStock === false) return NextResponse.json({ message: 'Товар закінчився' }, { status: 400 });

  const quantity = Math.min(10, Math.max(1, Math.floor(Number(b?.quantity) || 1)));
  const variant = str(b?.variant, 80);
  const name = str(b?.name, 80) || 'Покупець';
  const order = {
    orderId: generateOrderId(),
    status: 'processing',
    quick: true,
    name,
    lastName: '',
    phone,
    city: '',
    warehouse: '',
    paymentMethod: 'cod',
    total: p.price * quantity,
    items: [{ _id: String(p._id), handle: p.handle, title: p.title, image: p.image, brand: p.brand, price: p.price, quantity, ...(variant ? { variant } : {}) }],
    createdAt: new Date().toISOString(),
    comment: 'Замовлення в 1 клік — передзвонити, уточнити доставку й оплату',
    history: [{ text: 'Замовлення в 1 клік' }],
  };
  await Order.create(order);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    const text = [
      `⚡ ЗАМОВЛЕННЯ В 1 КЛІК ${order.orderId}`,
      `📞 ${phone} — передзвонити`,
      name !== 'Покупець' ? `👤 ${name}` : '',
      `🧾 ${p.title}${variant ? ` (${variant})` : ''} × ${quantity} = ${order.total} ₴`,
    ]
      .filter(Boolean)
      .join('\n');
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, orderId: order.orderId, total: order.total, orderToken: createOrderToken(order.orderId, phone) });
}
