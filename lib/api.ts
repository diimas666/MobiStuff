// lib/api.ts
export interface ProductFilters {
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  isTrending?: string;
  onSale?: string;
  sort?: string;
}

export async function fetchProducts(
  category?: string,
  subcategory?: string,
  filters?: ProductFilters
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`);

  if (category) url.searchParams.set('category', category);
  if (subcategory) url.searchParams.set('subcategory', subcategory);
  if (filters?.brand) url.searchParams.set('brand', filters.brand);
  if (filters?.minPrice) url.searchParams.set('minPrice', filters.minPrice);
  if (filters?.maxPrice) url.searchParams.set('maxPrice', filters.maxPrice);
  if (filters?.isTrending) url.searchParams.set('isTrending', filters.isTrending);
  if (filters?.onSale) url.searchParams.set('onSale', filters.onSale);
  if (filters?.sort) url.searchParams.set('sort', filters.sort);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  return res.json();
}

export async function fetchProductFacets(category: string, subcategory: string) {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/facets`);
  url.searchParams.set('category', category);
  url.searchParams.set('subcategory', subcategory);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  return res.json() as Promise<{
    brands: string[];
    minPrice: number;
    maxPrice: number;
    count: number;
  }>;
}
