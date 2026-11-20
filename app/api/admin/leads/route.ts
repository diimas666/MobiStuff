import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CartDraft from '@/app/api/models/CartDraft';
import StockAlert from '@/app/api/models/StockAlert';
import Order from '@/app/api/models/Order';
import Product from '@/app/api/models/Product';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';

/** Брошені кошики, підписки «Повідомити про наявність», популярні товари, яких немає */
export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  await dbConnect();
  const since = new Date(Date.now() - 30 * 864e5);

  const [carts, alerts, sold] = await Promise.all([
    CartDraft.find({ convertedAt: { $exists: false }, createdAt: { $gte: since } }).sort({ updatedAt: -1 }).limit(200).lean(),
    StockAlert.find({ notifiedAt: { $exists: false } }).sort({ createdAt: -1 }).limit(500).lean<{ productId: string; handle?: string; title?: string; phone?: string; email?: string; createdAt: Date }[]>(),
    Order.aggregate([
      { $match: { createdAt: { $gte: since.toISOString() }, status: { $nin: ['cancelled', 'returned'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.handle', title: { $first: '$items.title' }, qty: { $sum: { $ifNull: ['$items.quantity', 1] } } } },
      { $sort: { qty: -1 } },
      { $limit: 200 },
    ]),
  ]);

  // Підписки, згруповані за товаром
  const byProduct = new Map<string, { productId: string; handle?: string; title?: string; count: number; contacts: string[]; lastAt: Date }>();
  for (const a of alerts) {
    const g = byProduct.get(a.productId) ?? { productId: a.productId, handle: a.handle, title: a.title, count: 0, contacts: [], lastAt: a.createdAt };
    g.count += 1;
    if (g.contacts.length < 20) g.contacts.push(a.phone || a.email || '');
    byProduct.set(a.productId, g);
  }

  // Що добре продавалось, а зараз немає в наявності
  const handles = sold.map((s: { _id: string }) => s._id).filter(Boolean);
  const out = await Product.find({ handle: { $in: handles }, inStock: false }, 'handle title price').lean<{ handle: string; title: string; price: number }[]>();
  const outSet = new Map(out.map((p) => [p.handle, p]));
  const soldOut = sold
    .filter((s: { _id: string }) => outSet.has(s._id))
    .slice(0, 30)
    .map((s: { _id: string; title: string; qty: number }) => ({ handle: s._id, title: outSet.get(s._id)?.title || s.title, qty: s.qty, price: outSet.get(s._id)?.price }));

  return NextResponse.json({
    carts: carts.map((c: Record<string, any>) => ({ id: String(c._id), phone: c.phone, email: c.email, name: c.name, total: c.total, items: (c.items ?? []).map((i: { title: string; quantity?: number }) => ({ title: i.title, quantity: i.quantity ?? 1 })), notifiedAt: c.notifiedAt, updatedAt: c.updatedAt })),
    alerts: [...byProduct.values()].sort((a, b) => b.count - a.count),
    soldOut,
  });
}
