'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useCart } from '@/context/CartContext';

/** /cart?restore=… — відновлює кошик з нагадування і запамʼятовує промокод */
export default function CartRestore() {
  const params = useSearchParams();
  const router = useRouter();
  const { restoreCart } = useCart();
  const token = params.get('restore');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/cart/restore?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.items?.length) {
          restoreCart(d.items);
          if (d.promoCode) {
            try {
              sessionStorage.setItem('ms_promo', d.promoCode);
            } catch {
              // ignore
            }
            toast.success(`Кошик відновлено. Промокод ${d.promoCode} застосуємо під час оформлення`);
          } else toast.success('Кошик відновлено');
        }
        router.replace('/cart', { scroll: false });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return null;
}
