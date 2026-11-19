import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/dbConnect';
import StoreSettings from '@/app/api/models/StoreSettings';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { getStoreSettings, parseSettings } from '@/lib/storeSettings';

export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  return NextResponse.json({
    settings: await getStoreSettings(),
    channels: {
      sms: Boolean(process.env.TURBOSMS_TOKEN),
      email: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    },
  });
}

export async function PUT(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Некоректні дані' }, { status: 400 });

  const settings = parseSettings(body, await getStoreSettings());
  await dbConnect();
  await StoreSettings.updateOne({ key: 'main' }, { $set: settings }, { upsert: true });
  revalidateTag('settings', { expire: 0 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ settings });
}
