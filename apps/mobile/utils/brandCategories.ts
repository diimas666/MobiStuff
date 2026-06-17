import type { ApiProduct } from '../types/catalog';

export type BrandCategoryOption = {
  slug: string;
  title: string;
  count: number;
};

export function getBrandCategories(products: ApiProduct[]): BrandCategoryOption[] {
  const categories = new Map<string, BrandCategoryOption>();

  for (const product of products) {
    const slug = product.categorySlug?.trim();
    const title = product.category?.trim();

    if (!slug || !title) {
      continue;
    }

    const current = categories.get(slug);

    if (current) {
      current.count += 1;
      continue;
    }

    categories.set(slug, {
      slug,
      title,
      count: 1,
    });
  }

  return Array.from(categories.values()).sort((left, right) =>
    left.title.localeCompare(right.title, 'uk'),
  );
}

export function filterBrandProductsByCategory(
  products: ApiProduct[],
  categorySlug: string | null,
): ApiProduct[] {
  if (!categorySlug) {
    return products;
  }

  return products.filter(product => product.categorySlug === categorySlug);
}
