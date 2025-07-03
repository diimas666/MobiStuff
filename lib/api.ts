// lib/api.ts
export async function fetchProducts(category?: string, subcategory?: string) {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`);
  if (category) url.searchParams.set('category', category);
  if (subcategory) url.searchParams.set('subcategory', subcategory);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  return res.json();
}


// Тогда можешь писать
// const products = await fetchProducts('powerbanky');
