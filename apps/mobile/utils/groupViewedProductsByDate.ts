import type { ViewedProductItem } from '../types/viewedProducts';

export type ViewedProductsGroup = {
  dateKey: string;
  label: string;
  items: ViewedProductItem[];
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

export function getViewedProductsDateLabel(dateKey: string): string {
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

export function groupViewedProductsByDate(items: ViewedProductItem[]): ViewedProductsGroup[] {
  const groups = new Map<string, ViewedProductItem[]>();

  for (const item of items) {
    const dateKey = getLocalDateKey(item.viewedAt);
    const current = groups.get(dateKey) ?? [];
    current.push(item);
    groups.set(dateKey, current);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([dateKey, groupItems]) => ({
      dateKey,
      label: getViewedProductsDateLabel(dateKey),
      items: groupItems.sort(
        (left, right) =>
          new Date(right.viewedAt).getTime() - new Date(left.viewedAt).getTime(),
      ),
    }));
}
