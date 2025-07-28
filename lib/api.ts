// lib/api.ts
export async function fetchProducts(
  category?: string,
  subcategory?: string,
  filters?: { brand?: string; minPrice?: string; maxPrice?: string }
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`);

  if (category) url.searchParams.set('category', category);
  if (subcategory) url.searchParams.set('subcategory', subcategory);
  if (filters?.brand) url.searchParams.set('brand', filters.brand);
  if (filters?.minPrice) url.searchParams.set('minPrice', filters.minPrice);
  if (filters?.maxPrice) url.searchParams.set('maxPrice', filters.maxPrice);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  return res.json();
}

// Тогда можешь писать
// const products = await fetchProducts('powerbanky');
