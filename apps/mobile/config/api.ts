import { API_BASE_URL } from '@env';
import { isNetworkOffline, setNetworkOffline } from '../lib/networkStatus';

const baseUrl = API_BASE_URL.replace(/\/$/, '');

const jsonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

function isLikelyNetworkError(error: unknown) {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error) {
    return /network|fetch|failed|internet/i.test(error.message);
  }

  return false;
}

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
      if (isLikelyNetworkError(error)) {
        setNetworkOffline(true);
      }
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
  requestOrdersOtp: (body: unknown) =>
    request('/api/orders/otp/request', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  verifyOrdersOtp: (body: unknown) =>
    request('/api/orders/otp/verify', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  promotions: () => request('/api/promotions'),
  settings: () => request('/api/settings'),
  points: (body: unknown) => request('/api/account/points', { method: 'POST', body: JSON.stringify(body) }),
  phoneModels: () => request('/api/phone-models'),
  crossSell: (handle: string, exclude = '') =>
    request(`/api/cross-sell?handle=${encodeURIComponent(handle)}&exclude=${encodeURIComponent(exclude)}`),
  stockAlert: (body: unknown) =>
    request('/api/stock-alert', { method: 'POST', body: JSON.stringify(body) }),
  tracking: (ttn: string) => request(`/api/tracking?ttn=${encodeURIComponent(ttn)}`),
  search: (q: string) => request(`/api/search?q=${encodeURIComponent(q)}`),
  registerPush: (body: unknown) =>
    request('/api/push/register', { method: 'POST', body: JSON.stringify(body) }),
  quickOrder: (body: unknown) =>
    request('/api/quick-order', { method: 'POST', body: JSON.stringify(body) }),
  validatePromo: (body: unknown) =>
    request('/api/promo/validate', { method: 'POST', body: JSON.stringify(body) }),
  brands: () => request('/api/brands'),
  support: (body: unknown) =>
    request('/api/support', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export { baseUrl };
