import type { CartItem } from '../types/cart';
import { api } from '../config/api';
import { saveOrderToken } from './orderAccessStorage';

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

export type CheckoutResult =
  | { ok: true; total?: number; paymentMethod?: string; orderId?: string }
  | { ok: false; error: string };

/** Надсилає замовлення на сервер. Успіх — лише якщо сервер його прийняв. */
export async function submitCheckout(
  order: CheckoutOrder & { id?: string; promoCode?: string },
): Promise<CheckoutResult> {
  try {
    const response = await api.checkout({
      ...order,
      orderId: order.id,
    });
    const data = (await response.json().catch(() => ({}))) as {
      orderToken?: unknown;
      message?: string;
      total?: number;
      paymentMethod?: string;
      orderId?: string;
    };
    if (!response.ok) {
      return {
        ok: false,
        error:
          data.message ||
          (response.status === 429
            ? 'Забагато спроб. Спробуйте за кілька хвилин.'
            : 'Не вдалося оформити замовлення. Спробуйте ще раз.'),
      };
    }

    // Ключ до цього замовлення — для push-сповіщень про його статус
    if (typeof data.orderToken === 'string' && data.orderId) {
      await saveOrderToken({ orderId: data.orderId, phone: order.phone, token: data.orderToken }).catch(() => {});
    }
    return { ok: true, total: data.total, paymentMethod: data.paymentMethod, orderId: data.orderId };
  } catch {
    return { ok: false, error: 'Немає звʼязку з сервером. Перевірте інтернет і спробуйте ще раз.' };
  }
}
