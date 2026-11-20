import 'server-only';
import { gzipSync } from 'zlib';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { sendTelegramFile, telegramConfigured } from '@/lib/telegram';

/**
 * Щоденна резервна копія даних, яких немає більше ніде: замовлення, бали,
 * відгуки, промокоди, налаштування, пристрої push. Товари не копіюємо —
 * їх відновлює синхронізація з MMA. Архів (.json.gz) надходить у Telegram-чат менеджера.
 */
const COLLECTIONS = ['orders', 'loyalties', 'reviews', 'promocodes', 'storesettings', 'appconfigs', 'promotions', 'pushdevices', 'stockalerts', 'cartdrafts'];

export async function runBackup() {
  if (!telegramConfigured()) return { ok: false, error: 'Telegram не налаштовано' };
  await dbConnect();
  const db = mongoose.connection.db!;
  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));
  const dump: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  for (const name of COLLECTIONS) {
    if (!existing.has(name)) continue;
    dump[name] = await db.collection(name).find({}).toArray();
    counts[name] = dump[name].length;
  }
  const date = new Date().toISOString().slice(0, 10);
  const gz = gzipSync(Buffer.from(JSON.stringify({ createdAt: new Date().toISOString(), collections: dump })));
  const caption = `💾 Резервна копія ${date}\nЗамовлень: ${counts.orders ?? 0} · балів: ${counts.loyalties ?? 0} · відгуків: ${counts.reviews ?? 0}\nЗберігайте цей файл — з нього можна відновити дані.`;
  const ok = await sendTelegramFile(`mobistuff-backup-${date}.json.gz`, new Uint8Array(gz), caption);
  return { ok, bytes: gz.length, counts };
}
