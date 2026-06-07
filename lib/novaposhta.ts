export const NOVA_API_URL = 'https://api.novaposhta.ua/v2.0/json/';
const NOVA_API_KEY = process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY;

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
