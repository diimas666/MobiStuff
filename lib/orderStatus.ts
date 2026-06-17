export const ORDER_STATUSES = [
  'processing',
  'in_progress',
  'shipped',
  'completed',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DEFAULT_ORDER_STATUS: OrderStatus = 'processing';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  processing: 'В обробці',
  in_progress: 'В роботі',
  shipped: 'Відправлено',
  completed: 'Виконано',
  cancelled: 'Скасовано',
};

export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  { bg: string; text: string; ring: string }
> = {
  processing: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    ring: 'ring-amber-200',
  },
  in_progress: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    ring: 'ring-blue-200',
  },
  shipped: {
    bg: 'bg-violet-50',
    text: 'text-violet-800',
    ring: 'ring-violet-200',
  },
  completed: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    ring: 'ring-green-200',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    ring: 'ring-red-200',
  },
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === 'string' &&
    ORDER_STATUSES.includes(value as OrderStatus)
  );
}

export function normalizeOrderStatus(value: unknown): OrderStatus {
  if (value === 'confirmed') return 'processing';
  return isOrderStatus(value) ? value : DEFAULT_ORDER_STATUS;
}

export function generateOrderId(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}
