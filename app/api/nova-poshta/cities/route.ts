import { NextRequest, NextResponse } from 'next/server';
import { fetchCities } from '@/lib/novaposhta';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (query.length < 1) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const cities = await fetchCities(query);
    return NextResponse.json({ cities });
  } catch (error) {
    console.error('❌ nova-poshta cities:', error);
    const message =
      error instanceof Error ? error.message : 'Не вдалося знайти місто';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
