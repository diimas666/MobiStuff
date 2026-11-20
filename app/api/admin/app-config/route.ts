import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import AppConfig from '@/app/api/models/AppConfig';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { getAppConfig, parseAppConfig } from '@/lib/appConfig';

export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  return NextResponse.json({ config: await getAppConfig() });
}

export async function PUT(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== 'object') return NextResponse.json({ error: 'Некоректні дані' }, { status: 400 });
  const config = parseAppConfig(b);
  await dbConnect();
  await AppConfig.updateOne({ key: 'main' }, { $set: config }, { upsert: true });
  revalidateTag('app-config', { expire: 0 });
  return NextResponse.json({ config });
}
