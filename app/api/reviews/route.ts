import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/app/api/models/Review';
import Order from '@/app/api/models/Order';
import Product from '@/app/api/models/Product';
import { getReviews } from '@/lib/reviews';
import { rateLimited } from '@/lib/rateLimit';
import { verifyOrderToken } from '@/lib/orderAccess';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { notifyTelegram } from '@/lib/telegram';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+\n/g, '\n').slice(0, max) : '');

/** Відгуки товару (лише схвалені) */
export async function GET(req: Request) {
  const handle = str(new URL(req.url).searchParams.get('handle'), 200);
  if (!handle) return NextResponse.json({ count: 0, average: 0, reviews: [] });
  return NextResponse.json(await getReviews(handle), { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } });
}

/**
 * Новий відгук: { handle, name, rating, text, orderId?, token? }.
 * З ключем замовлення — «Підтверджена покупка». Публікується після перевірки менеджером.
 */
export async function POST(req: Request) {
  if (rateLimited(req, 'review', 8, 60 * 60 * 1000)) return NextResponse.json({ error: 'Забагато відгуків. Спробуйте пізніше' }, { status: 429 });
  const b = await req.json().catch(() => null);
  const handle = str(b?.handle, 200);
  const rating = Math.round(Number(b?.rating));
  const text = str(b?.text, 2000);
  const name = str(b?.name, 60) || 'Покупець';
  if (!handle || !(rating >= 1 && rating <= 5)) return NextResponse.json({ error: 'Поставте оцінку від 1 до 5' }, { status: 400 });
  if (text.length > 0 && text.length < 3) return NextResponse.json({ error: 'Напишіть трохи більше' }, { status: 400 });
  if (/https?:\/\/|www\./i.test(text)) return NextResponse.json({ error: 'Посилання у відгуках не дозволені' }, { status: 400 });

  await dbConnect();
  const product = await Product.findOne({ handle }, 'title').lean<{ title: string }>();
  if (!product) return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });

  // Підтверджена покупка: замовлення з цим товаром + ключ доступу до замовлення
  let verified = false;
  let orderId: string | undefined;
  if (typeof b?.orderId === 'string' && b.orderId) {
    const order = await Order.findOne({ orderId: b.orderId }, 'orderId phone items').lean<{ orderId: string; phone: string; items: { handle?: string }[] }>();
    const phone = order ? normalizeUkrainianPhone(order.phone) : null;
    if (order && phone && verifyOrderToken(order.orderId, phone, b.token) && order.items?.some((i) => i.handle === handle)) {
      if (await Review.exists({ orderId: order.orderId, handle })) return NextResponse.json({ error: 'Ви вже залишили відгук на цей товар' }, { status: 409 });
      verified = true;
      orderId = order.orderId;
    }
  }

  await Review.create({ handle, productTitle: product.title, name, rating, text, verified, orderId, source: b?.source === 'app' ? 'app' : 'site' });
  void notifyTelegram(`⭐ Новий відгук ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}\n${product.title}\n${name}: ${text || '(без тексту)'}\n\nПеревірте в адмінці → Відгуки`);
  return NextResponse.json({ ok: true, message: 'Дякуємо! Відгук зʼявиться після перевірки' });
}
