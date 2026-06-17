import type { NotificationItem } from '../types/notification';

export type NotificationsGroup = {
  dateKey: string;
  label: string;
  items: NotificationItem[];
};

function getLocalDateKey(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isSameLocalDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function getNotificationsDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameLocalDay(date, today)) {
    return 'Сьогодні';
  }

  if (isSameLocalDay(date, yesterday)) {
    return 'Вчора';
  }

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function groupNotificationsByDate(items: NotificationItem[]): NotificationsGroup[] {
  const groups = new Map<string, NotificationItem[]>();

  for (const item of items) {
    const dateKey = getLocalDateKey(item.createdAt);
    const current = groups.get(dateKey) ?? [];
    current.push(item);
    groups.set(dateKey, current);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([dateKey, groupItems]) => ({
      dateKey,
      label: getNotificationsDateLabel(dateKey),
      items: groupItems.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    }));
}
