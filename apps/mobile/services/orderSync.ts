import { api } from '../config/api';
import type { StoredOrder, OrderStatus } from '../types/order';
import { normalizeOrderStatus } from '../types/order';

export async function fetchOrderStatuses(
  orders: StoredOrder[],
): Promise<Record<string, OrderStatus>> {
  if (!orders.length) return {};

  try {
    const response = await api.syncOrderStatuses({
      orders: orders.map(order => ({
        orderId: order.id,
        phone: order.phone,
      })),
    });

    if (!response.ok) return {};

    const data = (await response.json()) as { statuses?: Record<string, string> };
    const statuses: Record<string, OrderStatus> = {};

    for (const [orderId, status] of Object.entries(data.statuses ?? {})) {
      statuses[orderId] = normalizeOrderStatus(status);
    }

    return statuses;
  } catch {
    return {};
  }
}

export function applySyncedStatuses(
  orders: StoredOrder[],
  statuses: Record<string, OrderStatus>,
): StoredOrder[] {
  if (!Object.keys(statuses).length) return orders;

  return orders.map(order => {
    const nextStatus = statuses[order.id];
    if (!nextStatus || nextStatus === normalizeOrderStatus(order.status)) {
      return order;
    }

    return { ...order, status: nextStatus };
  });
}

export function ordersStatusChanged(
  before: StoredOrder[],
  after: StoredOrder[],
): boolean {
  return after.some((order, index) => order.status !== before[index]?.status);
}
