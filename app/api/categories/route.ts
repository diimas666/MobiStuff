import { NextResponse } from 'next/server';
import { getMenuData } from '@/lib/getMenuData';

/** Каталог для застосунку: категорії й підкатегорії з фото товару та кількістю */
export async function GET() {
  try {
    const menu = await getMenuData();
    const categories = menu.map((c) => ({
      slug: c.slug,
      title: c.title,
      image: c.image,
      count: c.count,
      subcategories: c.subs.map((s) => ({ slug: s.slug, title: s.title, image: s.image, count: s.count })),
    }));
    return NextResponse.json(
      { categories },
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } }
    );
  } catch (error) {
    console.error('GET /api/categories failed:', error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
