import { NextResponse } from 'next/server';
import { queryProductFacets } from '@/lib/queryProducts';

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const category = sp.get('category');
    const subcategory = sp.get('subcategory');
    if (!category || !subcategory) {
      return NextResponse.json({ error: 'category and subcategory required' }, { status: 400 });
    }
    return NextResponse.json(await queryProductFacets(category, subcategory), {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' },
    });
  } catch (error) {
    console.error('❌ Ошибка facets:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
