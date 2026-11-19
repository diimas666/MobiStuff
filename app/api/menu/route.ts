import { NextResponse } from 'next/server';
import { getMenuData } from '@/lib/getMenuData';

export async function GET() {
  try {
    const categories = await getMenuData();
    return NextResponse.json(
      { categories },
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } }
    );
  } catch (error) {
    console.error('GET /api/menu failed:', error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
