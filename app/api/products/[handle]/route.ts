import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { getWeeklySales } from '@/lib/weeklySales';
import { safe } from '@/lib/safeData';

type Ctx = { params: Promise<{ handle: string }> };

/** Один товар за адресою (застосунок): + скільки разів купили за тиждень */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const handle = decodeURIComponent((await params).handle || '').slice(0, 200);
  if (!handle) return NextResponse.json({ error: 'Товар не знайдено' }, { status: 400 });
  try {
    await dbConnect();
    const product = await Product.findOne({ handle }).lean();
    if (!product) return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
    const soldThisWeek = (await safe(getWeeklySales(), {} as Record<string, number>, 'weekly-sales'))[handle] ?? 0;
    return NextResponse.json({ ...product, soldThisWeek }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('GET /api/products/[handle] failed', error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
