import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import CartDraft from '@/app/api/models/CartDraft';
import Product from '@/app/api/models/Product';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { rateLimited } from '@/lib/rateLimit';

const str = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Зберігає кошик покупця, який почав оформлення (ввів телефон або email).
 * Якщо не дооформить — нагадаємо. Ціни і назви беремо з бази.
 */
export async function POST(req: Request) {
  if (rateLimited(req, 'cart-draft', 30, 10 * 60 * 1000)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => null);
  const phone = normalizeUkrainianPhone(str(b?.phone, 30)) || undefined;
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(b?.email)) ? str(b?.email) : undefined;
  if (!phone && !email) return NextResponse.json({ ok: false }, { status: 400 });

  const raw = Array.isArray(b?.items) ? b.items.slice(0, 30) : [];
  const ids = raw.map((i: { _id?: unknown }) => str(i?._id, 40)).filter((id: string) => mongoose.Types.ObjectId.isValid(id));
  if (!ids.length) return NextResponse.json({ ok: false }, { status: 400 });

  await dbConnect();
  const products = await Product.find({ _id: { $in: ids } }).select('title handle image price').lean<{ _id: unknown; title: string; handle: string; image: string; price: number }[]>();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  const items = raw
    .map((i: { _id?: unknown; quantity?: unknown }) => {
      const p = byId.get(str(i?._id, 40));
      return p ? { _id: String(p._id), handle: p.handle, title: p.title, image: p.image, price: p.price, quantity: Math.min(99, Math.max(1, Math.floor(Number(i?.quantity) || 1))) } : null;
    })
    .filter(Boolean) as { price: number; quantity: number }[];
  const total = items.reduce((n, i) => n + i.price * i.quantity, 0);

  const key = phone ? { phone, convertedAt: { $exists: false } } : { email, convertedAt: { $exists: false } };
  await CartDraft.findOneAndUpdate(
    key,
    {
      $set: { phone, email, name: str(b?.name, 80) || undefined, items, total },
      $unset: { notifiedAt: '' },
      $setOnInsert: { restoreToken: randomBytes(12).toString('base64url') },
    },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
