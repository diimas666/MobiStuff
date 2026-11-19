/**
 * Простий ліміт запитів з одного IP (у пам'яті інстансу).
 * Захищає публічні форми від спаму: замовлення, звернення в підтримку.
 */
const buckets = new Map<string, { count: number; until: number }>();

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** true — ліміт перевищено */
export function rateLimited(req: Request, scope: string, max: number, windowMs: number): boolean {
  const key = `${scope}:${clientIp(req)}`;
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.until < now) buckets.delete(k);
  }
  const entry = buckets.get(key);
  if (!entry || entry.until < now) {
    buckets.set(key, { count: 1, until: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}
