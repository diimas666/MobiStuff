import { cache } from 'react';
import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/app/api/models/Product';
import Promotion from '@/app/api/models/Promotion';
import { resolvePromotionImageUrl } from '@/lib/promotionMedia';
import type { Product } from '@/interface/product';

/** Лише поля, потрібні карточці товару — у рази менший HTML/RSC, ніж повний документ з описом */
export const CARD_FIELDS =
  'title handle image price oldPrice discountPercent inStock lowStock isNew isTrending isFeatured brand category categorySlug subcategorySlug createdAt';

type Filter = Record<string, unknown>;

export async function findCards(filter: Filter, opts: { limit?: number; sort?: Record<string, 1 | -1> } = {}): Promise<Product[]> {
  await dbConnect();
  const docs = await ProductModel.find(filter)
    .select(CARD_FIELDS)
    .sort(opts.sort ?? { inStock: -1, createdAt: -1 })
    .limit(opts.limit ?? 16)
    .lean<Record<string, any>[]>();
  return docs.map((p) => ({
    ...p,
    _id: String(p._id),
    id: String(p._id),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
  })) as unknown as Product[];
}

export const SALE_FILTER: Filter = {
  $or: [
    { discountPercent: { $gt: 0 } },
    { $expr: { $and: [{ $gt: ['$oldPrice', '$price'] }, { $gt: ['$oldPrice', 0] }] } },
  ],
};

export const getHits = cache((limit = 16) => findCards({ isTrending: true }, { limit }));
export const getFeatured = cache((limit = 6) => findCards({ isFeatured: true, inStock: { $ne: false } }, { limit }));
export const getNewArrivals = cache((limit = 16) => findCards({ isNew: true }, { limit }));
export const getSaleProducts = cache((limit = 16, categorySlug?: string) =>
  findCards(categorySlug ? { ...SALE_FILTER, categorySlug } : SALE_FILTER, {
    limit,
    sort: { inStock: -1, discountPercent: -1, createdAt: -1 },
  })
);

export interface StorePromotion {
  id: string;
  title: string;
  subtitle?: string;
  cta?: string;
  color?: string;
  emoji?: string;
  imageUrl?: string;
  href: string;
}

/** Акційні банери з адмінки (розділ «Акції») */
export const getPromotions = cache(async (): Promise<StorePromotion[]> => {
  try {
    await dbConnect();
    const items = await Promotion.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(12).lean<Record<string, any>[]>();
    return items.map((p) => ({
      id: String(p._id),
      title: p.title,
      subtitle: p.subtitle || undefined,
      cta: p.cta || undefined,
      color: p.color || undefined,
      emoji: p.emoji || undefined,
      imageUrl: resolvePromotionImageUrl(p),
      href:
        p.linkType === 'on_sale'
          ? `/sale${p.categorySlug ? `?category=${encodeURIComponent(p.categorySlug)}` : ''}`
          : p.subcategorySlug
            ? `/category/${p.categorySlug}/${p.subcategorySlug}`
            : `/catalog#${p.categorySlug}`,
    }));
  } catch (e) {
    console.error('getPromotions failed', e);
    return [];
  }
});
