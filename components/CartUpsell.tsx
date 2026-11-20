'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductImage from '@/components/ProductImage';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/interface/product';

/** «Додайте до замовлення» у кошику — доповнення до найдорожчого товару */
export default function CartUpsell() {
  const { cart, addToCart } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const main = [...cart].sort((a, b) => b.price - a.price)[0];
  const inCart = new Set(cart.map((c) => c.handle));
  const key = main?.handle ?? '';

  useEffect(() => {
    if (!key) return;
    const exclude = cart.map((c) => c.handle).join(',');
    fetch(`/api/cross-sell?handle=${encodeURIComponent(key)}&exclude=${encodeURIComponent(exclude)}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []))
      .catch(() => {});
    // лише при зміні основного товару
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!items.length) return null;

  return (
    <section className="mt-14">
      <h2 className="text-[24px] font-semibold tracking-tight">Додайте до замовлення</h2>
      <p className="mt-1 text-[15px] text-ink-2">Часто купують разом з «{main?.title}».</p>
      <ul className="no-scrollbar -mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((p) => {
          const added = inCart.has(p.handle);
          return (
            <li key={p.handle} className="w-[220px] shrink-0 rounded-3xl bg-white p-3">
              <Link href={`/product/${p.handle}`} className="relative block aspect-square overflow-hidden rounded-2xl bg-white">
                <ProductImage src={p.image} alt={p.title} fill sizes="220px" className="object-contain p-2" />
              </Link>
              <p className="mt-2 line-clamp-2 min-h-[38px] px-1 text-[14px] leading-snug">{p.title}</p>
              <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-[16px] font-semibold">{formatPrice(p.price)}</span>
                <button
                  type="button"
                  disabled={added}
                  onClick={() => addToCart(p)}
                  aria-label={added ? 'У кошику' : `Додати ${p.title}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${added ? 'bg-accent-soft text-accent' : 'bg-accent text-white hover:bg-accent-hover'}`}
                >
                  {added ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-5 w-5" />}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
