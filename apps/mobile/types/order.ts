import type { CartItem } from './cart';

export type OrderStatus =
  | 'processing'
  | 'in_progress'
  | 'shipped'
  | 'completed'
  | 'confirmed';

export const ORDER_STATUS_LABELS: Record<
  Exclude<OrderStatus, 'confirmed'>,
  string
> = {
  processing: 'В обробці',
  in_progress: 'В роботі',
  shipped: 'Відправлено',
  completed: 'Виконано',
};

export type StoredOrder = {
  id: string;
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
  status: OrderStatus;
};

export function normalizeOrderStatus(
  status: OrderStatus | string,
): Exclude<OrderStatus, 'confirmed'> {
  if (status === 'confirmed') return 'processing';
  if (
    status === 'processing' ||
    status === 'in_progress' ||
    status === 'shipped' ||
    status === 'completed'
  ) {
    return status;
  }
  return 'processing';
}

export function getOrderStatusLabel(status: OrderStatus | string): string {
  return ORDER_STATUS_LABELS[normalizeOrderStatus(status)];
}

export function getOrderStatusStyle(status: OrderStatus | string): {
  badgeBg: string;
  textColor: string;
  icon: string;
} {
  const normalized = normalizeOrderStatus(status);

  switch (normalized) {
    case 'in_progress':
      return {
        badgeBg: 'rgba(59, 130, 246, 0.16)',
        textColor: '#93C5FD',
        icon: 'time-outline',
      };
    case 'shipped':
      return {
        badgeBg: 'rgba(139, 92, 246, 0.16)',
        textColor: '#C4B5FD',
        icon: 'airplane-outline',
      };
    case 'completed':
      return {
        badgeBg: 'rgba(45, 184, 75, 0.16)',
        textColor: '#86EFAC',
        icon: 'checkmark-circle',
      };
    case 'processing':
    default:
      return {
        badgeBg: 'rgba(245, 158, 11, 0.16)',
        textColor: '#FCD34D',
        icon: 'hourglass-outline',
      };
  }
}

export function formatOrderPaymentMethod(method: string): string {
  if (method === 'card_online') {
    return 'Онлайн оплата карткою';
  }

  if (method === 'cod') {
    return 'Оплата при отриманні';
  }

  return method;
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateOrderId(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}
