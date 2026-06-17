import { baseUrl } from '../config/api';

type ApiCity = {
  Ref: string;
  Description: string;
  AreaDescription: string;
};

type ApiWarehouse = {
  Ref: string;
  Description: string;
  Number?: string;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: 'application/json' },
  });

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error(
        'API Nova Poshta ще не на сервері. Запустіть npm run dev локально або задеployте сайт.',
      );
    }

    throw new Error('Сервер повернув некоректну відповідь');
  }

  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || `API ${response.status}`);
  }

  return data;
}

export async function searchCities(query: string) {
  if (!query.trim()) {
    return [];
  }

  const data = await request<{ cities: ApiCity[] }>(
    `/api/nova-poshta/cities?q=${encodeURIComponent(query.trim())}`,
  );

  return data.cities.map(city => ({
    Ref: city.Ref,
    DeliveryCity: city.Ref,
    Present: city.Description,
    MainDescription: city.Description,
    Area: city.AreaDescription,
  }));
}

export async function searchWarehouses(cityRef: string, query: string) {
  if (!cityRef) {
    return [];
  }

  const params = new URLSearchParams({ cityRef });
  if (query.trim()) {
    params.set('q', query.trim());
  }

  const data = await request<{ warehouses: ApiWarehouse[] }>(
    `/api/nova-poshta/warehouses?${params.toString()}`,
  );

  return data.warehouses.map(warehouse => ({
    Ref: warehouse.Ref,
    Description: warehouse.Description,
    ShortAddress: warehouse.Description,
    CityRef: cityRef,
  }));
}
