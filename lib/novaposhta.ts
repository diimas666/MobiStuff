// lib/novaposhta.ts

export const NOVA_API_URL = 'https://api.novaposhta.ua/v2.0/json/';
const NOVA_API_KEY = process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY;

export async function fetchCities(query: string) {
  const res = await fetch(NOVA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: NOVA_API_KEY,
      modelName: 'Address',
      calledMethod: 'getCities',
      methodProperties: {
        FindByString: query,
      },
    }),
  });

  const data = await res.json();
  return data.data || [];
}

export async function fetchWarehouses(cityRef: string) {
  try {
    const res = await fetch(NOVA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: NOVA_API_KEY,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: cityRef,
        },
      }),
    });

    const data = await res.json();
    console.log('✅ Отделения:', data);
    return data.data || [];
  } catch (error) {
    console.error('❌ Ошибка при загрузке отделений:', error);
    return [];
  }
}
