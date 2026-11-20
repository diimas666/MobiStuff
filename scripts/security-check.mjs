#!/usr/bin/env node
/**
 * Перевірка безпеки магазину «очима зловмисника».
 *
 *   npm run security-check                       → http://localhost:3005
 *   npm run security-check -- https://mobistuff.shop
 *
 * Нічого не ламає і не створює даних, крім одного тестового замовлення
 * на неіснуючий номер (перевірка підміни ціни) — його видно в адмінці з
 * іменем «SECURITY-CHECK». На бойовому сайті цю перевірку можна вимкнути: --no-order.
 */
import { readFileSync, existsSync } from 'node:fs';

const BASE = (process.argv.find((a) => a.startsWith('http')) || 'http://localhost:3005').replace(/\/$/, '');
const SKIP_ORDER = process.argv.includes('--no-order');
const results = [];
const ok = (name) => results.push({ ok: true, name });
const fail = (name, detail) => results.push({ ok: false, name, detail });
const check = (cond, name, detail = '') => (cond ? ok(name) : fail(name, detail));

const req = async (path, init = {}) => {
  const res = await fetch(BASE + path, { redirect: 'manual', ...init, headers: { 'Content-Type': 'application/json', ...(init.headers || {}) } });
  let body = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, headers: res.headers, body, text };
};
const post = (path, data, headers) => req(path, { method: 'POST', body: JSON.stringify(data), headers });

// 1. Адмінка закрита без входу
const ADMIN = [
  ['GET', '/api/admin/getOrders'],
  ['GET', '/api/admin/products'],
  ['POST', '/api/admin/products'],
  ['GET', '/api/admin/products/000000000000000000000000'],
  ['PUT', '/api/admin/products/000000000000000000000000'],
  ['PATCH', '/api/admin/updateProduct'],
  ['POST', '/api/admin/addProduct'],
  ['DELETE', '/api/admin/deleteProduct'],
  ['DELETE', '/api/admin/deleteOrders'],
  ['PATCH', '/api/admin/updateOrderStatus'],
  ['PATCH', '/api/admin/orders/000000000000000000000000'],
  ['GET', '/api/admin/orders/export'],
  ['POST', '/api/admin/bulkUpdate'],
  ['GET', '/api/admin/analytics?year=2026&month=1'],
  ['GET', '/api/admin/settings'],
  ['PUT', '/api/admin/settings'],
  ['POST', '/api/admin/upload'],
  ['POST', '/api/admin/import'],
  ['GET', '/api/admin/promotions'],
  ['POST', '/api/admin/promotions'],
  ['POST', '/api/admin/promotions/upload'],
  ['GET', '/api/admin/promo'],
  ['POST', '/api/admin/promo'],
  ['DELETE', '/api/admin/promo/000000000000000000000000'],
  ['GET', '/api/admin/push'],
  ['POST', '/api/admin/push'],
];
for (const [method, path] of ADMIN) {
  const r = await req(path, { method, body: method === 'GET' ? undefined : '{}' });
  check(r.status === 401, `Адмінка без входу: ${method} ${path} → 401`, `отримано ${r.status}`);
}

// Підроблена cookie сесії
{
  const r = await req('/api/admin/getOrders', { headers: { cookie: `ms_admin=${Math.floor(Date.now() / 1000) + 9999}.forged` } });
  check(r.status === 401, 'Підроблена cookie адмінки не пускає', `отримано ${r.status}`);
}
// Підроблене посилання входу
{
  const r = await req('/api/admin/login?link=link-9999999999.forged');
  check(r.status >= 300 && r.status < 400 && !String(r.headers.get('set-cookie') || '').includes('ms_admin=1'), 'Підроблене посилання входу не дає сесії');
}
// Неправильний пароль
{
  const r = await post('/api/admin/login', { password: 'wrong-password' });
  check(r.status === 401 || r.status === 429, 'Неправильний пароль адмінки відхилено', `отримано ${r.status}`);
}

// 2. Чужі замовлення
{
  const r = await post('/api/orders/list', { phone: '0991112233' });
  check(r.status === 401, 'Замовлення за номером без ключа → 401', `отримано ${r.status}`);
  const r2 = await post('/api/orders/list', { phone: '0991112233', token: 'v1.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' });
  check(r2.status === 401, 'Замовлення з підробленим ключем → 401', `отримано ${r2.status}`);
  const r3 = await post('/api/orders/list', { phone: { $ne: null }, token: { $ne: null } });
  check(r3.status === 400 || r3.status === 401, 'NoSQL-інʼєкція в /api/orders/list відхилена', `отримано ${r3.status}`);
  const r4 = await post('/api/orders/sync-status', { orders: [{ orderId: { $ne: null }, phone: { $ne: null } }] });
  check(r4.status === 200 && Object.keys(r4.body?.statuses || {}).length === 0, 'NoSQL-інʼєкція в sync-status нічого не віддає', JSON.stringify(r4.body).slice(0, 120));
}

// 3. Код з SMS
{
  const r = await post('/api/orders/otp/verify', { phone: '0991112233', code: { $ne: null } });
  check(r.status === 400 || r.status === 429, 'Інʼєкція в код SMS відхилена', `отримано ${r.status}`);
  let limited = false;
  for (let i = 0; i < 25 && !limited; i++) {
    const t = await post('/api/orders/otp/verify', { phone: '0991112233', code: String(100000 + i) });
    if (t.status === 429) limited = true;
  }
  check(limited, 'Перебір коду SMS обмежено (429)');
}

// 4. Дані постачальника і службові поля не віддаються
{
  const r = await req('/api/products?limit=50');
  const text = r.text;
  check(r.status === 200, 'Каталог доступний');
  for (const field of ['mmaSourcePrice', 'mmaKey', 'priceManuallyEdited', 'manualFields', 'mmaSourceCurrency']) {
    check(!text.includes(`"${field}"`), `Каталог не розкриває поле ${field}`);
  }
  const first = Array.isArray(r.body) ? r.body[0] : null;
  if (first?.handle) {
    const one = await req(`/api/products/${encodeURIComponent(first.handle)}`);
    check(!/mmaSourcePrice|mmaKey/.test(one.text), 'Сторінка товару в API не розкриває закупівлю');
  }
  const s = await req('/api/settings');
  check(s.status === 200 && !/notifyCustomers|SMTP|TOKEN|SECRET/i.test(s.text), 'Публічні налаштування без службових даних');
}

// 5. Підміна ціни
if (!SKIP_ORDER) {
  const list = await req('/api/products?limit=1');
  const p = Array.isArray(list.body) ? list.body[0] : null;
  if (p) {
    const r = await post('/api/checkout', {
      name: 'SECURITY-CHECK',
      lastName: 'TEST',
      phone: '0990000000',
      city: 'Тест',
      warehouse: 'Тест',
      paymentMethod: 'cod',
      items: [{ _id: p._id, price: 1, quantity: 1, title: 'hack' }],
      total: 1,
    });
    check(r.status === 200 && r.body?.total === p.price, 'Підміна ціни в замовленні не працює (ціна з бази)', `total=${r.body?.total}, справжня ${p.price}`);
  }
}

// 6. Заголовки безпеки
{
  const r = await req('/');
  for (const h of ['x-content-type-options', 'x-frame-options', 'referrer-policy', 'strict-transport-security', 'permissions-policy']) {
    check(r.headers.get(h), `Заголовок ${h}`);
  }
  check(!r.headers.get('x-powered-by'), 'Немає заголовка X-Powered-By');
  const a = await req('/admin');
  check(/noindex/.test(a.headers.get('x-robots-tag') || ''), 'Адмінка закрита від пошуковиків');
}

// 7. Секрети не потрапили в код сторінок
{
  const html = (await req('/')).text;
  const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]).slice(0, 60);
  let bundle = html;
  for (const s of scripts) bundle += (await req(s)).text;
  const patterns = [/mongodb(\+srv)?:\/\//i, /ADMIN_SECRET/, /ORDER_ACCESS_SECRET/, /TELEGRAM_BOT_TOKEN/, /\b\d{9,10}:[A-Za-z0-9_-]{30,}\b/, /SMTP_PASS/, /TURBOSMS/];
  // Справжні значення секретів (якщо скрипт запущено поруч із .env.local)
  if (existsSync('.env.local')) {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      const m = line.match(/^(MONGODB_URI|ADMIN_SECRET|ORDER_ACCESS_SECRET|TELEGRAM_BOT_TOKEN|SMTP_PASS|NOVA_POSHTA_API_KEY|MMA_PASSWORD|RESEND_API_KEY|TURBOSMS_TOKEN)=(.+)$/);
      const v = m?.[2]?.replace(/^["']|["']$/g, '');
      if (v && v.length >= 8) patterns.push(new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  }
  const leaked = patterns.filter((re) => re.test(bundle));
  check(leaked.length === 0, `Секрети не потрапили в код сайту (перевірено ${scripts.length} файлів)`, `знайдено збігів: ${leaked.length}`);
}

// 8. Обмеження частоти на публічних формах
{
  let limited = false;
  for (let i = 0; i < 8 && !limited; i++) {
    const r = await post('/api/support', { topic: 'x' });
    if (r.status === 429) limited = true;
  }
  check(limited, 'Спам у підтримку обмежено (429)');
}

// 9. Перебір промокодів обмежено
{
  let limited = false;
  for (let i = 0; i < 25 && !limited; i++) {
    const r = await post('/api/promo/validate', { code: `GUESS${i}`, total: 1000 });
    if (r.status === 429) limited = true;
  }
  check(limited, 'Перебір промокодів обмежено (429)');
}

// Підсумок
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? '✅' : '❌'} ${r.name}${r.ok ? '' : ` — ${r.detail}`}`);
console.log(`\n${results.length - failed.length}/${results.length} перевірок пройдено (${BASE})`);
process.exit(failed.length ? 1 : 0);
