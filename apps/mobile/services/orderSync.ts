import { api } from '../config/api';
import type { StoredOrder, OrderStatus } from '../types/order';
import { normalizeOrderStatus } from '../types/order';

export async function fetchOrdersByPhone(phone: string): Promise<StoredOrder[]> {
  if (!phone.trim()) {
    return [];
  }

  try {
    const response = await api.listOrders({ phone });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { orders?: StoredOrder[] };
    return Array.isArray(data.orders) ? data.orders : [];
  } catch {
    return [];
  }
}

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

export function mergeOrders(
  localOrders: StoredOrder[],
  serverOrders: StoredOrder[],
): StoredOrder[] {
  const byId = new Map<string, StoredOrder>();

  for (const order of localOrders) {
    byId.set(order.id, order);
  }

  for (const serverOrder of serverOrders) {
    const existing = byId.get(serverOrder.id);

    if (!existing) {
      byId.set(serverOrder.id, serverOrder);
      continue;
    }

    byId.set(serverOrder.id, {
      ...existing,
      ...serverOrder,
      items: serverOrder.items?.length ? serverOrder.items : existing.items,
      status: serverOrder.status,
    });
  }

  return [...byId.values()];
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
  const beforeById = new Map(before.map(order => [order.id, order]));

  if (before.length !== after.length) {
    return true;
  }

  return after.some(order => beforeById.get(order.id)?.status !== order.status);
}

export function ordersDataChanged(before: StoredOrder[], after: StoredOrder[]): boolean {
  if (before.length !== after.length) {
    return true;
  }

  const beforeById = new Map(before.map(order => [order.id, order]));

  return after.some(order => {
    const previous = beforeById.get(order.id);

    if (!previous) {
      return true;
    }

    return (
      previous.status !== order.status ||
      previous.total !== order.total ||
      previous.warehouse !== order.warehouse ||
      previous.city !== order.city
    );
  });
}
