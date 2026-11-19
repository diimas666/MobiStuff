'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminWrapper from '@/components/AdminWrapper';
import ProductForm, { toFormValue, type ProductFormValue } from '@/components/admin/ProductForm';

/** Редагування товару: назва, опис, фото, ціни, категорія, позначки */
export default function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [value, setValue] = useState<ProductFormValue | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/products/${id}`, { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 401) return null;
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || 'Не вдалося завантажити товар');
        return d.product;
      })
      .then((p) => alive && p && setValue(toFormValue(p)))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <AdminWrapper>
      {error ? (
        <div className="panel mx-auto max-w-md p-8 text-center">
          <p className="text-[17px] font-semibold">{error}</p>
          <Link href="/admin/products" className="btn-primary mt-5">До списку товарів</Link>
        </div>
      ) : value ? (
        <ProductForm key={value._id} initial={value} mode="edit" />
      ) : (
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-8 w-60 rounded-xl bg-line-soft" />
          <div className="h-80 rounded-3xl bg-white" />
        </div>
      )}
    </AdminWrapper>
  );
}
