import type { CartItem } from '../types/cart';
import { api } from '../config/api';
import { saveOrderAccessToken } from './orderAccessStorage';

export type CheckoutOrder = {
  name: string;
  lastName: string;
  phone: string;
  email?: string;
  comment?: string;
  paymentMethod: string;
  city: string;
  cityRef: string;
  warehouse: string;
  total: number;
  items: CartItem[];
  createdAt: string;
};

export async function submitCheckout(order: CheckoutOrder & { id?: string }): Promise<boolean> {
  try {
    const response = await api.checkout({
      ...order,
      orderId: order.id,
    });
    if (!response.ok) {
      return false;
    }

    // Сервер видає ключ для перегляду історії замовлень цього номера
    try {
      const data = (await response.json()) as { ordersToken?: unknown };
      if (typeof data.ordersToken === 'string') {
        await saveOrderAccessToken(order.phone, data.ordersToken);
      }
    } catch {
      // замовлення вже прийняте — відсутність ключа не критична
    }

    return true;
  } catch {
    return false;
  }
}
