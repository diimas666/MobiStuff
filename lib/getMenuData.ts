import 'server-only';
import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { catalogCategory } from '@/data/catalogCategory';

export type MenuSub = { title: string; slug: string; href: string; image: string | null; count: number };
export type MenuCategory = { title: string; slug: string; image: string | null; count: number; subs: MenuSub[] };

/**
 * Дані для мобільного меню: на кожну категорію/підкатегорію — фото реального
 * товару та кількість товарів у наявності. Порожні підкатегорії ховаємо.
 */
async function load(): Promise<MenuCategory[]> {
  await dbConnect();
  const rows: { _id: { c: string; s: string }; count: number; image: string | null }[] = await Product.aggregate([
    { $match: { inStock: { $ne: false }, image: { $nin: ['', null] } } },
    { $sort: { isTrending: -1, isFeatured: -1, createdAt: -1 } },
    { $group: { _id: { c: '$categorySlug', s: '$subcategorySlug' }, count: { $sum: 1 }, image: { $first: '$image' } } },
  ]);
  const bySub = new Map(rows.map((r) => [`${r._id.c}/${r._id.s}`, r]));

  return catalogCategory
    .map((cat) => {
      const subs = cat.subcategories
        .map((sub) => {
          const row = bySub.get(`${cat.slug}/${sub.slug}`);
          return {
            title: sub.title,
            slug: sub.slug,
            href: `/category/${cat.slug}/${sub.slug}`,
            image: row?.image ?? null,
            count: row?.count ?? 0,
          };
        })
        .filter((s) => s.count > 0)
        .sort((a, b) => b.count - a.count);
      return {
        title: cat.title,
        slug: cat.slug,
        image: subs[0]?.image ?? null,
        count: subs.reduce((n, s) => n + s.count, 0),
        subs,
      };
    })
    .filter((c) => c.count > 0);
}

export const getMenuData = unstable_cache(load, ['menu-v1'], { revalidate: 3600, tags: ['products'] });
