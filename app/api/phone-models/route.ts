import { NextResponse } from 'next/server';
import { getPhoneModels } from '@/lib/phoneModels';
import { safe } from '@/lib/safeData';

export async function GET() {
  const models = await safe(getPhoneModels(), [], 'phone-models');
  return NextResponse.json({ models }, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } });
}
