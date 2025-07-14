'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Props {
  categorySlug: string;
  brands: string[];
  types: string[];
  subcategories: { slug: string; title: string }[];
  active: { brand?: string; type?: string; sub?: string };
}

export default function FilterPanel({
  categorySlug,
  brands,
  types,
  subcategories,
  active,
}: Props) {
  const search = useSearchParams();

  const buildUrl = (key: string, value: string) => {
    const params = new URLSearchParams(search.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    return `/category/${categorySlug}?${params.toString()}`;
  };

  const renderList = (
    label: string,
    items: string[],
    keyName: string,
    activeValue?: string
  ) => (
    <div className="mb-6">
      <h4 className="font-semibold mb-2">{label}</h4>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>
            <Link
              href={buildUrl(keyName, item)}
              className={`block hover:underline ${
                activeValue === item ? 'font-bold text-blue-600' : ''
              }`}
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="text-sm">
      {renderList(
        'Підкатегорії',
        subcategories.map((s) => s.title),
        'sub',
        active.sub
      )}
      {renderList('Бренди', brands, 'brand', active.brand)}
      {renderList('Тип кабеля', types, 'type', active.type)}
    </div>
  );
}
