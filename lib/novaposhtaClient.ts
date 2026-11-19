import type { NovaCity, NovaWarehouse } from './novaposhta';

export type { NovaCity, NovaWarehouse };

/**
 * Браузерний клієнт Нової Пошти: ходить через наші /api/nova-poshta/*,
 * тож API-ключ лишається лише на сервері.
 */
export async function fetchCities(query: string): Promise<NovaCity[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/nova-poshta/cities?q=${encodeURIComponent(query.trim())}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Не вдалося знайти місто');
  return Array.isArray(data.cities) ? data.cities : [];
}

export async function fetchWarehouses(cityRef: string, findByString = ''): Promise<NovaWarehouse[]> {
  if (!cityRef) return [];
  const params = new URLSearchParams({ cityRef });
  if (findByString.trim()) params.set('q', findByString.trim());
  const res = await fetch(`/api/nova-poshta/warehouses?${params.toString()}`);
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data.warehouses) ? data.warehouses : [];
}
