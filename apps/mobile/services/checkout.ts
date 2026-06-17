import type { CartItem } from '../types/cart';
import { api } from '../config/api';

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

export async function submitCheckout(order: CheckoutOrder): Promise<boolean> {
  try {
    const response = await api.checkout(order);
    return response.ok;
  } catch {
    return false;
  }
}
