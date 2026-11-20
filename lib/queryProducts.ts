import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { filterCatalogProducts } from '@/lib/productCategoryRules';
import {
  GLASS_SUBCATEGORY_SLUG,
  extractCompatibility, getPhoneModelsFromTitles,
  titleMatchesPhoneModel,
} from '@/lib/glassPhoneFilter';

export interface ProductQuery {
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  phone?: string | null;
  featured?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  isTrending?: string | null;
  onSale?: string | null;
  sort?: string | null;
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS: Record<string, Record<string, 1 | -1>> = {
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  newest: { createdAt: -1 },
  'title-asc': { title: 1 },
};

/** Вибірка товарів для каталогу (спільна для API та серверних сторінок) */
export async function queryProducts(q: ProductQuery, fields?: string) {
  await dbConnect();
  const filter: Record<string, unknown> = {};

  if (q.category) filter.categorySlug = String(q.category);
  if (q.subcategory) filter.subcategorySlug = String(q.subcategory);
  if (q.brand) filter.brand = new RegExp(`^${escapeRegex(String(q.brand).slice(0, 80))}$`, 'i');

  const min = Number(q.minPrice);
  const max = Number(q.maxPrice);
  if (Number.isFinite(min) && q.minPrice) filter.price = { ...(filter.price as object), $gte: min };
  if (Number.isFinite(max) && q.maxPrice) filter.price = { ...(filter.price as object), $lte: max };

  if (q.isTrending === 'true') filter.isTrending = true;
  if (q.featured === 'true') filter.isFeatured = true;
  if (q.onSale === 'true') {
    filter.$or = [
      { discountPercent: { $gt: 0 } },
      { $expr: { $and: [{ $gt: ['$oldPrice', '$price'] }, { $gt: ['$oldPrice', 0] }] } },
    ];
  }

  const sort = SORTS[q.sort ?? ''] ?? { title: 1 };
  const base = Product.find(filter).sort(sort);
  const docs = await (fields ? base.select(fields) : base).lean();
  const products = filterCatalogProducts(docs, q.category ?? null);

  const list = q.phone ? products.filter((p) => titleMatchesPhoneModel(p.title, String(q.phone))) : products;
  return JSON.parse(JSON.stringify(list.map((p: any) => ({ ...p, id: String(p._id) }))));
}

export async function queryProductFacets(category: string, subcategory: string) {
  await dbConnect();
  const products = filterCatalogProducts(
    await Product.find({ categorySlug: category, subcategorySlug: subcategory }).select('brand price title').lean(),
    category
  );

  const brands = [
    ...new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b && b.trim()))),
  ].sort((a, b) => a.localeCompare(b, 'uk'));
  const prices = products.map((p) => p.price).filter((n) => typeof n === 'number' && n > 0);

  const brandCounts: Record<string, number> = {};
  products.forEach((p) => {
    if (p.brand && p.brand.trim()) brandCounts[p.brand] = (brandCounts[p.brand] ?? 0) + 1;
  });

  return {
    brands,
    brandCounts,
    // Фільтр «Модель телефону» — там, де хоча б чверть товарів має сумісність у назві (чохли, скло тощо)
    phoneModels:
      subcategory === GLASS_SUBCATEGORY_SLUG ||
      products.filter((p) => extractCompatibility(p.title)).length >= Math.max(3, products.length / 4)
        ? getPhoneModelsFromTitles(products.map((p) => p.title))
        : [],
    minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 5000,
    count: products.length,
  };
}
