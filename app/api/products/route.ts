// app/api/products/route.ts — публічний каталог (вітрина + мобільний застосунок)
import { NextResponse } from 'next/server';
import { queryProducts } from '@/lib/queryProducts';

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const products = await queryProducts({
      category: sp.get('category'),
      subcategory: sp.get('subcategory'),
      brand: sp.get('brand'),
      phone: sp.get('phone'),
      minPrice: sp.get('minPrice'),
      maxPrice: sp.get('maxPrice'),
      isTrending: sp.get('isTrending'),
      onSale: sp.get('onSale'),
      sort: sp.get('sort'),
    });
    return NextResponse.json(products, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('❌ Ошибка при получении товаров:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
