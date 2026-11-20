// app/api/products/route.ts — публічний каталог (вітрина + мобільний застосунок)
import { NextResponse } from 'next/server';
import { queryProducts } from '@/lib/queryProducts';
import { CARD_FIELDS } from '@/lib/storefront';

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    // Без фільтрів — не більше 60 (головна, пошук), з категорією — до 500; ніколи не весь каталог
    const filtered = Boolean(sp.get('category') || sp.get('subcategory') || sp.get('brand'));
    const requested = Number(sp.get('limit'));
    const limit = Math.min(500, Math.max(1, Number.isFinite(requested) && requested > 0 ? requested : filtered ? 500 : 60));
    const all = await queryProducts({
      category: sp.get('category'),
      subcategory: sp.get('subcategory'),
      brand: sp.get('brand'),
      phone: sp.get('phone'),
      minPrice: sp.get('minPrice'),
      maxPrice: sp.get('maxPrice'),
      isTrending: sp.get('isTrending'),
      onSale: sp.get('onSale'),
      sort: sp.get('sort'),
      featured: sp.get('featured'),
    }, `${CARD_FIELDS} images variants tags`); // без довгих описів — їх віддає /api/products/[handle]
    const products = all.slice(0, limit);
    return NextResponse.json(products, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('❌ Ошибка при получении товаров:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
