import 'server-only';
import { findCards } from '@/lib/storefront';
import { compatModels } from '@/lib/phoneCompat';
import type { Product } from '@/interface/product';

/**
 * «Часто купують разом»: доповнення до товару.
 * Правила за категоріями + для чохлів/скла — товар для тієї ж моделі телефону.
 */
const CABLES = ['category-type-c-to-lightning', 'category-type-c-to-type-c', 'category-lightning', 'category-type-c', 'category-kabeli-usb'];
const RULES: Record<string, { subs?: string[]; cats?: string[] }> = {
  'category-akkumulyatori-i-powerbank': { subs: CABLES },
  'category-zaryadki-i-kabeli': { subs: CABLES, cats: ['category-akkumulyatori-i-powerbank'] },
  'category-chehli': { cats: ['category-zashtita-ekrana'] },
  'category-zashtita-ekrana': { cats: ['category-chehli'] },
  'category-naushniki': { subs: ['category-chehli-dlya-airpods-i-dr', ...CABLES] },
  'category-audio-i-video': { subs: CABLES },
  'category-gadzheti': { subs: CABLES, cats: ['category-akkumulyatori-i-powerbank'] },
  'category-avtomobilynaya-tematika': { subs: ['category-avtomobilynie-zaryadnie-ustroystva', ...CABLES] },
  'category-kompyyuternaya-periferiya': { cats: ['category-geyming'] },
  'category-geyming': { cats: ['category-kompyyuternaya-periferiya'] },
};

const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getCrossSell(product: { _id?: unknown; handle: string; title: string; price: number; categorySlug?: string }, limit = 8): Promise<Product[]> {
  const rule = RULES[product.categorySlug ?? ''];
  const base: Record<string, unknown> = { handle: { $ne: product.handle }, inStock: { $ne: false } };
  const or: Record<string, unknown>[] = [];
  if (rule?.subs?.length) or.push({ subcategorySlug: { $in: rule.subs } });
  if (rule?.cats?.length) or.push({ categorySlug: { $in: rule.cats } });
  if (!or.length) return [];

  // Для чохла/скла — шукаємо доповнення для тієї ж моделі
  const models = compatModels(product.title);
  const filter: Record<string, unknown> = { ...base, $or: or };
  if (models.length) filter.title = new RegExp(escapeRegex(models[0]), 'i');

  let items = await findCards(filter, { limit: limit * 2, sort: { isTrending: -1, createdAt: -1 } });
  if (models.length && items.length < 3) {
    items = await findCards({ ...base, $or: or }, { limit: limit * 2, sort: { isTrending: -1, createdAt: -1 } });
  }
  // Доповнення має бути дешевшим за основний товар — так його легше додати
  const cheaper = items.filter((p) => p.price <= Math.max(product.price, 300));
  return (cheaper.length >= 3 ? cheaper : items).slice(0, limit);
}
