import { NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { setWebhook, telegramConfigured } from '@/lib/telegram';
import { SITE_URL } from '@/lib/site';

/** Підключити кнопки статусів у Telegram (реєструє вебхук бота на цьому сайті) */
export async function POST(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  if (!telegramConfigured()) return NextResponse.json({ error: 'Не налаштовано TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID' }, { status: 400 });
  const r = await setWebhook(`${SITE_URL}/api/telegram/webhook`);
  return r?.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r?.description || 'Telegram не відповів' }, { status: 502 });
}
