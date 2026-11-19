'use client';

import AdminWrapper from '@/components/AdminWrapper';
import ProductForm, { EMPTY_PRODUCT } from '@/components/admin/ProductForm';

/** Додавання нового товару */
export default function AdminNewProductPage() {
  return (
    <AdminWrapper>
      <ProductForm initial={EMPTY_PRODUCT} mode="create" />
    </AdminWrapper>
  );
}
