import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PushDevice from '@/app/api/models/PushDevice';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { apnsConfigured, sendPush } from '@/lib/apns';

/** Кількість пристроїв і чи налаштовано APNs */
export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  await dbConnect();
  return NextResponse.json({ devices: await PushDevice.countDocuments(), configured: apnsConfigured() });
}

/** Розсилка всім користувачам застосунку */
export async function POST(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  if (!apnsConfigured()) return NextResponse.json({ error: 'Push не налаштовано: додайте APNS_KEY, APNS_KEY_ID, APNS_TEAM_ID на сервері' }, { status: 400 });
  const b = await req.json().catch(() => null);
  const title = typeof b?.title === 'string' ? b.title.trim().slice(0, 100) : '';
  const body = typeof b?.body === 'string' ? b.body.trim().slice(0, 300) : '';
  const url = typeof b?.url === 'string' && /^mobistuff:\/\/[\w\-/]*$/.test(b.url.trim()) ? b.url.trim() : undefined;
  if (!title || !body) return NextResponse.json({ error: 'Вкажіть заголовок і текст' }, { status: 400 });
  await dbConnect();
  const devices = await PushDevice.find().select('token').lean<{ token: string }[]>();
  const delivered = await sendPush(devices.map((d) => d.token), { title, body, url });
  return NextResponse.json({ delivered, total: devices.length });
}
