#!/usr/bin/env node
/**
 * Вхід в адмінку без пароля з цього компʼютера.
 *
 *   npm run admin                         → локальний сайт (http://localhost:3005)
 *   npm run admin -- https://mobistuff.shop → бойовий сайт
 *
 * Створює одноразове посилання (діє 10 хв), підписане ADMIN_SECRET з .env.local,
 * і відкриває його в браузері. Після цього браузер памʼятає вхід 90 днів.
 * Секрет на сервері має збігатися з тим, що в .env.local.
 */
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(path.join(root, '.env.local'), 'utf8')
    .split('\n')
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')])
);

const secret = env.ADMIN_SECRET;
if (!secret) {
  console.error('❌ У .env.local немає ADMIN_SECRET');
  process.exit(1);
}

const base = (process.argv[2] || `http://localhost:${process.env.PORT || 3005}`).replace(/\/$/, '');
const payload = `link-${Math.floor(Date.now() / 1000) + 10 * 60}`;
const sig = createHmac('sha256', `mobistuff-admin:${secret}`).update(payload).digest('base64url');
const url = `${base}/api/admin/login?link=${encodeURIComponent(`${payload}.${sig}`)}`;

const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open';
execFile(opener, [url], (err) => {
  if (err) console.log(`Відкрийте посилання вручну (діє 10 хв):\n${url}`);
  else console.log(`✅ Відкриваю адмінку: ${base}/admin (посилання одноразове, діє 10 хв)`);
});
