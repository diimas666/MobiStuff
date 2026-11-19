import 'server-only';
import { catalogCategory } from '@/data/catalogCategory';
import { toSlug } from '@/lib/slugify';
import Product from '@/app/api/models/Product';

/**
 * Перевірка і нормалізація полів товару з форми адмінки.
 * Записуються лише дозволені поля; категорія береться з довідника каталогу,
 * знижка рахується з «старої ціни».
 */
const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);
const num = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
};
const list = (v: unknown, max = 40) => {
  const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
  return [...new Set(arr.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean))].slice(0, max);
};
const bool = (v: unknown) => (typeof v === 'boolean' ? v : undefined);
const isImageUrl = (u: string) => /^(https?:\/\/|\/api\/media\/)/.test(u);

export class ProductInputError extends Error {}

export interface ProductPatch {
  set: Record<string, unknown>;
  unset: Record<string, ''>;
}

/** mode 'create' вимагає обовʼязкові поля, 'update' — лише ті, що прийшли */
export function parseProductInput(body: Record<string, unknown>, mode: 'create' | 'update'): ProductPatch {
  const set: Record<string, unknown> = {};
  const unset: Record<string, ''> = {};

  const title = str(body.title, 200);
  if (title !== undefined) {
    if (!title) throw new ProductInputError('Вкажіть назву товару');
    set.title = title;
  }

  if (body.description !== undefined) set.description = str(body.description, 20000) ?? '';
  const brand = str(body.brand, 80);
  if (brand !== undefined) set.brand = brand;

  // Фото: перше — головне
  if (body.images !== undefined || body.image !== undefined) {
    const all = list([str(body.image, 1000), ...list(body.images, 30)].filter(Boolean), 30).filter(isImageUrl);
    if (!all.length) throw new ProductInputError('Додайте хоча б одне фото');
    set.image = all[0];
    set.images = all;
  }

  // Ціна і знижка
  const price = num(body.price);
  if (body.price !== undefined) {
    if (!price) throw new ProductInputError('Вкажіть ціну');
    set.price = price;
  }
  if (body.oldPrice !== undefined) {
    const oldPrice = num(body.oldPrice);
    const base = price ?? undefined;
    if (oldPrice && base && oldPrice > base) {
      set.oldPrice = oldPrice;
      set.discountPercent = Math.round((1 - base / oldPrice) * 100);
    } else {
      unset.oldPrice = '';
      unset.discountPercent = '';
    }
  }

  // Категорія — лише з довідника каталогу
  const categorySlug = str(body.categorySlug, 120);
  if (categorySlug !== undefined) {
    const cat = catalogCategory.find((c) => c.slug === categorySlug);
    if (!cat) throw new ProductInputError('Оберіть категорію');
    const subSlug = str(body.subcategorySlug, 160);
    const sub = cat.subcategories?.find((s) => s.slug === subSlug);
    if (!sub) throw new ProductInputError('Оберіть підкатегорію');
    set.category = cat.title;
    set.categorySlug = cat.slug;
    set.subcategorySlug = sub.slug;
  }

  for (const key of ['inStock', 'lowStock', 'isNew', 'isFeatured', 'isTrending'] as const) {
    const b = bool(body[key]);
    if (b !== undefined) set[key] = b;
  }
  if (body.tags !== undefined) set.tags = list(body.tags);
  if (body.variants !== undefined) set.variants = list(body.variants);

  if (mode === 'create') {
    for (const [key, label] of [
      ['title', 'назву'],
      ['image', 'фото'],
      ['price', 'ціну'],
      ['categorySlug', 'категорію'],
    ] as const) {
      if (set[key] === undefined) throw new ProductInputError(`Вкажіть ${label}`);
    }
    set.inStock ??= true;
  }

  return { set, unset };
}

/** Унікальна адреса товару: naushniki-tws, naushniki-tws-2, … */
export async function uniqueHandle(title: string): Promise<string> {
  const base = toSlug(title).slice(0, 80) || 'tovar';
  let handle = base;
  for (let i = 2; await Product.exists({ handle }); i++) handle = `${base}-${i}`;
  return handle;
}
