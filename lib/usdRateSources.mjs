/**
 * Курс долара для цін постачальника.
 * Порядок: курс MMA (той, за яким рахує сам постачальник) → курс НБУ → MMA_USD_RATE з .env → 42.
 * Спільний для скриптів синхронізації та адмінки.
 */
const TIMEOUT_MS = 8000;

async function getJson(url, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const sane = (n) => (Number.isFinite(n) && n > 10 && n < 200 ? Math.round(n * 100) / 100 : null);

export async function fetchMmaUsdRate() {
  const data = await getJson('https://api.mma.ua/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ siteSettings(groups:[PRICES]) { ... on PricesSetting { rateUah } } }' }),
  });
  return sane(Number(data?.data?.siteSettings?.[0]?.rateUah));
}

export async function fetchNbuUsdRate() {
  const data = await getJson('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json');
  return sane(Number(data?.[0]?.rate));
}

/** { rate, source } — ніколи не падає */
export async function resolveUsdRate() {
  for (const [source, fn] of [
    ['MMA', fetchMmaUsdRate],
    ['НБУ', fetchNbuUsdRate],
  ]) {
    try {
      const rate = await fn();
      if (rate) return { rate, source };
    } catch {
      // пробуємо наступне джерело
    }
  }
  const envRate = sane(Number(process.env.MMA_USD_RATE));
  return envRate ? { rate: envRate, source: '.env (MMA_USD_RATE)' } : { rate: 42, source: 'запасний (42)' };
}
