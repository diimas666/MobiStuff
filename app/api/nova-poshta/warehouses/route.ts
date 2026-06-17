import { NextRequest, NextResponse } from 'next/server';
import { fetchWarehouses } from '@/lib/novaposhta';

export async function GET(req: NextRequest) {
  const cityRef = req.nextUrl.searchParams.get('cityRef')?.trim() ?? '';
  const query = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!cityRef) {
    return NextResponse.json({ warehouses: [] });
  }

  try {
    const warehouses = await fetchWarehouses(cityRef, query);
    return NextResponse.json({ warehouses });
  } catch (error) {
    console.error('❌ nova-poshta warehouses:', error);
    return NextResponse.json(
      { error: 'Не вдалося знайти відділення' },
      { status: 500 }
    );
  }
}
