import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { revalidateStore } from '@/lib/revalidateStore';

const FLAGS = ['isTrending', 'isNew', 'isFeatured', 'inStock', 'lowStock'] as const;

/**
 * Масові дії над товарами з адмінки.
 * body: { ids: string[], set?: { isTrending?, isNew?, isFeatured?, inStock?, lowStock? }, discountPercent?: number }
 */
export async function POST(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  const body = await req.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.filter((id: unknown) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)).slice(0, 2000)
    : [];
  if (!ids.length) return NextResponse.json({ error: 'Не вибрано товарів' }, { status: 400 });

  await dbConnect();

  const set: Record<string, boolean> = {};
  for (const key of FLAGS) {
    if (typeof body?.set?.[key] === 'boolean') set[key] = body.set[key];
  }
  if (Object.keys(set).length) {
    await Product.updateMany({ _id: { $in: ids } }, { $set: set });
  }

  if (body?.discountPercent !== undefined) {
    const discount = Math.round(Number(body.discountPercent) || 0);
    if (discount < 0 || discount >= 100) {
      return NextResponse.json({ error: 'Знижка має бути від 0 до 99%' }, { status: 400 });
    }
    const docs = await Product.find({ _id: { $in: ids } }).select('price oldPrice').lean<{ _id: unknown; price: number; oldPrice?: number }[]>();
    await Product.bulkWrite(
      docs.map((d) => {
        const base = d.oldPrice && d.oldPrice > d.price ? d.oldPrice : d.price;
        return {
          updateOne: {
            filter: { _id: d._id },
            update:
              discount > 0
                ? { $set: { oldPrice: base, price: Math.round(base * (1 - discount / 100)), discountPercent: discount, priceManuallyEdited: true } }
                : { $set: { price: base, priceManuallyEdited: true }, $unset: { oldPrice: '', discountPercent: '' } },
          },
        };
      })
    );
  }

  revalidateStore();
  return NextResponse.json({ ok: true, count: ids.length });
}
