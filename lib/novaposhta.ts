import 'server-only';

export const NOVA_API_URL = 'https://api.novaposhta.ua/v2.0/json/';
// Ключ лише на сервері (без NEXT_PUBLIC_), щоб не потрапляв у браузер
const NOVA_API_KEY = process.env.NOVA_POSHTA_API_KEY || process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY;

export interface NovaCity {
  Ref: string;
  Description: string;
  AreaDescription: string;
}

export interface NovaWarehouse {
  Ref: string;
  Description: string;
  Number?: string;
}

async function novaRequest<T>(calledMethod: string, methodProperties: Record<string, string>) {
  if (!NOVA_API_KEY) {
    throw new Error('Nova Poshta API key is not configured');
  }

  const res = await fetch(NOVA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: NOVA_API_KEY,
      modelName: 'Address',
      calledMethod,
      methodProperties,
    }),
  });

  const data = await res.json();

  if (!data.success) {
    const message = data.errors?.[0] || 'Nova Poshta API error';

    if (message.toLowerCase().includes('api key expired')) {
      throw new Error(
        'Ключ Nova Poshta прострочений. Оновіть NOVA_POSHTA_API_KEY у .env.local та на Vercel.',
      );
    }

    throw new Error(message);
  }

  return (data.data || []) as T[];
}

export async function fetchCities(query: string) {
  if (!query.trim()) return [];
  return novaRequest<NovaCity>('getCities', { FindByString: query.trim() });
}

export async function fetchWarehouses(cityRef: string, findByString = '') {
  if (!cityRef) return [];

  const methodProperties: Record<string, string> = { CityRef: cityRef };
  if (findByString.trim()) {
    methodProperties.FindByString = findByString.trim();
  }

  try {
    return await novaRequest<NovaWarehouse>('getWarehouses', methodProperties);
  } catch {
    return [];
  }
}

export type ParcelStatus = {
  number: string;
  status: string;
  statusCode: number;
  citySender?: string;
  cityRecipient?: string;
  warehouseRecipient?: string;
  scheduledDeliveryDate?: string;
  actualDeliveryDate?: string;
  documentWeight?: string;
};

/** Статус посилки за ТТН (телефон відкриває повні дані — місто/відділення) */
export async function trackParcel(ttn: string, phone?: string): Promise<ParcelStatus | null> {
  if (!NOVA_API_KEY) throw new Error('Nova Poshta API key is not configured');
  const res = await fetch(NOVA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: NOVA_API_KEY,
      modelName: 'TrackingDocument',
      calledMethod: 'getStatusDocuments',
      methodProperties: { Documents: [{ DocumentNumber: ttn, ...(phone ? { Phone: phone } : {}) }] },
    }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  const d = data?.data?.[0];
  if (!data?.success || !d) return null;
  return {
    number: d.Number,
    status: d.Status,
    statusCode: Number(d.StatusCode),
    citySender: d.CitySender || undefined,
    cityRecipient: d.CityRecipient || undefined,
    warehouseRecipient: d.WarehouseRecipient || undefined,
    scheduledDeliveryDate: d.ScheduledDeliveryDate || undefined,
    actualDeliveryDate: d.ActualDeliveryDate || undefined,
    documentWeight: d.DocumentWeight ? String(d.DocumentWeight) : undefined,
  };
}
