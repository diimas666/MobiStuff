import { API_BASE_URL } from '@env';
import { isNetworkOffline, setNetworkOffline } from '../lib/networkStatus';

const baseUrl = API_BASE_URL.replace(/\/$/, '');

const jsonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

function request(path: string, init?: RequestInit) {
  if (isNetworkOffline()) {
    return Promise.reject(new TypeError('Network request failed'));
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init?.headers,
    },
  })
    .then(response => {
      setNetworkOffline(false);
      return response;
    })
    .catch(error => {
      setNetworkOffline(true);
      throw error;
    });
}

export const api = {
  categories: () => request('/api/categories'),
  products: (params: string) => request(`/api/products?${params}`),
  productByHandle: (handle: string) =>
    request(`/api/products/${encodeURIComponent(handle)}`),
  checkout: (body: unknown) =>
    request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  syncOrderStatuses: (body: unknown) =>
    request('/api/orders/sync-status', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listOrders: (body: unknown) =>
    request('/api/orders/list', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  promotions: () => request('/api/promotions'),
  support: (body: unknown) =>
    request('/api/support', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export { baseUrl };
