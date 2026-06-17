import { appendNotification, loadNotifications } from './notificationsStorage';
import { getSettingsSnapshot } from '../services/settingsStorage';
import { getOrderStatusLabel, normalizeOrderStatus, type StoredOrder } from '../types/order';
import type { OrderStatus } from '../types/order';

async function orderStatusAlreadyNotified(
  orderId: string,
  status: OrderStatus,
): Promise<boolean> {
  const items = await loadNotifications();
  const statusLabel = getOrderStatusLabel(status);

  return items.some(
    item =>
      item.type === 'order_status' &&
      item.orderId === orderId &&
      item.body.includes(statusLabel),
  );
}

async function notifyOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (await orderStatusAlreadyNotified(orderId, status)) {
    return;
  }

  await appendNotification({
    type: 'order_status',
    title: `Замовлення ${orderId}`,
    body: `Статус змінено на «${getOrderStatusLabel(status)}»`,
    orderId,
    orderStatus: status,
  });
}

export async function notifyOrderStatusChanges(
  before: StoredOrder[],
  after: StoredOrder[],
): Promise<void> {
  const settings = await getSettingsSnapshot();

  if (!settings.orderStatusNotifications) {
    return;
  }

  const beforeById = new Map(before.map(order => [order.id, order]));

  for (const order of after) {
    const previous = beforeById.get(order.id);
    const status = normalizeOrderStatus(order.status);

    if (!previous) {
      if (status !== 'processing') {
        await notifyOrderStatus(order.id, status);
      }
      continue;
    }

    if (previous.status === order.status) {
      continue;
    }

    await notifyOrderStatus(order.id, status);
  }
}
