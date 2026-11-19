import { NextResponse } from 'next/server';
import { getStoreSettings, publicSettings } from '@/lib/storeSettings';

/** Публічні налаштування: пороги оплати/доставки, контакти, оголошення */
export async function GET() {
  return NextResponse.json(publicSettings(await getStoreSettings()), {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  });
}
