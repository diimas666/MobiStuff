import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import dbConnect from '@/lib/dbConnect';
import AppError from '@/app/api/models/AppError';
import { rateLimited } from '@/lib/rateLimit';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

/** Звіт про помилку застосунку; про нову помилку — повідомлення в Telegram */
export async function POST(req: Request) {
  if (rateLimited(req, 'app-errors', 20, 10 * 60 * 1000)) return NextResponse.json({ ok: true });
  const b = await req.json().catch(() => null);
  const message = str(b?.message, 500) || 'Unknown error';
  const stack = str(b?.stack, 3000);
  const firstFrame = stack.split('\n').find((l) => l.includes('@') || l.includes('at ')) ?? '';
  const fingerprint = createHash('sha1').update(`${message}|${firstFrame}`).digest('hex');

  await dbConnect();
  const prev = await AppError.findOneAndUpdate(
    { fingerprint },
    {
      $set: { message, stack, screen: str(b?.screen, 80), appVersion: str(b?.appVersion, 20), platform: str(b?.platform, 20), fatal: Boolean(b?.fatal), lastAt: new Date() },
      $inc: { count: 1 },
    },
    { upsert: true, new: false }
  );

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!prev && token && chatId) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `🐞 Нова помилка в застосунку${b?.fatal ? ' (аварійне закриття)' : ''}\n${message}\nЕкран: ${str(b?.screen, 80) || '—'}` }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
