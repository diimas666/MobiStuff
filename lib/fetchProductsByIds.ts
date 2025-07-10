import { Product } from '@/interface/product';

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const res = await fetch('/api/products/byIds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    console.error('❌ Не удалось загрузить избранные товары');
    return [];
  }

  const products = await res.json();
  return products.filter((p: Product) => !!p._id); // ✅ Защита от пустых
}
