import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { checkAdminAuth } from '@/lib/adminAuth';
import { runBackup } from '@/lib/backup';

export const maxDuration = 120;

/** Резервна копія в Telegram: Vercel Cron (Bearer CRON_SECRET) або кнопка в адмінці */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET || '';
  const auth = req.headers.get('authorization') || '';
  const cronOk = secret && auth.length === `Bearer ${secret}`.length && timingSafeEqual(Buffer.from(auth), Buffer.from(`Bearer ${secret}`));
  if (!cronOk && !checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json(await runBackup());
  } catch (e) {
    console.error('backup failed', e);
    return NextResponse.json({ error: 'Помилка' }, { status: 500 });
  }
}
