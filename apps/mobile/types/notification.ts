export type NotificationType = 'order_status' | 'favorite_discount';

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
  productId?: string;
  productHandle?: string;
};

export function generateNotificationId(): string {
  return `NOTIF-${Date.now().toString(36).toUpperCase()}`;
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'order_status':
      return 'receipt-outline';
    case 'favorite_discount':
      return 'pricetag-outline';
    default:
      return 'notifications-outline';
  }
}
