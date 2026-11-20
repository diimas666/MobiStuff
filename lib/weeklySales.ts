import 'server-only';
import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';

/** Скільки разів купили товари за останні 7 днів (з реальних замовлень) */
async function load(): Promise<Record<string, number>> {
  await dbConnect();
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const rows: { _id: string; n: number }[] = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $nin: ['cancelled', 'returned'] } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.handle', n: { $sum: '$items.quantity' } } },
  ]);
  return Object.fromEntries(rows.filter((r) => r._id).map((r) => [r._id, r.n]));
}

export const getWeeklySales = unstable_cache(load, ['weekly-sales-v1'], { revalidate: 3600 });
