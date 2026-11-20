import { NextResponse } from 'next/server';
import { getAppConfig, publicAppConfig } from '@/lib/appConfig';

/** Налаштування для застосунку: баннери, мінімальна версія, техроботи, «Що нового» */
export async function GET() {
  return NextResponse.json(publicAppConfig(await getAppConfig()), {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' },
  });
}
