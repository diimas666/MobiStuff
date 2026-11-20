import 'server-only';
import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { extractCompatibility, splitPhoneModels } from '@/lib/glassPhoneFilter';

/** Усі моделі телефонів, для яких є товари (з назв «… для iPhone 15 / 15 Pro»), з кількістю */
async function load(): Promise<{ model: string; count: number }[]> {
  await dbConnect();
  const titles = await Product.find({ inStock: { $ne: false }, title: /\b(for|для)\s/i }).select('title').lean<{ title: string }[]>();
  const counts = new Map<string, number>();
  for (const { title } of titles) {
    const compat = extractCompatibility(title);
    if (!compat) continue;
    for (const m of splitPhoneModels(compat)) counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([m, n]) => n >= 2 && m.length <= 40 && /iphone|samsung|xiaomi|redmi|poco|google|pixel|huawei|honor|motorola|oppo|realme|oneplus|nokia|zte|vivo/i.test(m))
    .map(([model, count]) => ({ model, count }))
    .sort((a, b) => b.count - a.count);
}

export const getPhoneModels = unstable_cache(load, ['phone-models-v1'], { revalidate: 3600, tags: ['products'] });
