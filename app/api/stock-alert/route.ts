import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import StockAlert from '@/app/api/models/StockAlert';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { rateLimited } from '@/lib/rateLimit';

/** Підписка «Повідомити, коли зʼявиться» (телефон або email) */
export async function POST(req: Request) {
  if (rateLimited(req, 'stock-alert', 10, 10 * 60 * 1000)) {
    return NextResponse.json({ message: 'Забагато спроб. Спробуйте пізніше.' }, { status: 429 });
  }
  const b = await req.json().catch(() => null);
  const productId = typeof b?.productId === 'string' ? b.productId : '';
  if (!mongoose.Types.ObjectId.isValid(productId)) return NextResponse.json({ message: 'Товар не знайдено' }, { status: 400 });
  const contact = typeof b?.contact === 'string' ? b.contact.trim().slice(0, 120) : '';
  const phone = normalizeUkrainianPhone(contact);
  const email = !phone && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : undefined;
  if (!phone && !email) return NextResponse.json({ message: 'Вкажіть телефон або email' }, { status: 400 });

  await dbConnect();
  const p = await Product.findById(productId).select('title handle').lean<{ title: string; handle: string }>();
  if (!p) return NextResponse.json({ message: 'Товар не знайдено' }, { status: 404 });
  await StockAlert.updateOne(
    { productId, ...(phone ? { phone } : { email }), notifiedAt: { $exists: false } },
    { $set: { handle: p.handle, title: p.title } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
