import {
  DEFAULT_ORDER_STATUS,
  generateOrderId,
  normalizeOrderStatus,
  type OrderStatus,
} from '@/lib/orderStatus';

export function normalizeOrderPayload(data: Record<string, unknown>) {
  const orderId =
    (typeof data.orderId === 'string' && data.orderId.trim()) ||
    (typeof data.id === 'string' && data.id.trim()) ||
    generateOrderId();

  const status: OrderStatus = normalizeOrderStatus(data.status);

  return {
    ...data,
    orderId,
    status: data.status ? status : DEFAULT_ORDER_STATUS,
  };
}
