'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import ProductImage from '@/components/ProductImage';
import PaymentRulesNote from '@/components/PaymentRulesNote';
import CartUpsell from '@/components/CartUpsell';
import { ChevronRight, Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { trackViewCart } from '@/lib/analytics';
import { formatPrice, plural, productForms } from '@/lib/format';
import { popularItems } from '@/data/popularAndTrending';

export default function CartPage() {
  const { cart, increment, decrement, removeFromCart, isReady } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const viewedCartRef = useRef(false);

  useEffect(() => {
    if (viewedCartRef.current || cart.length === 0) return;
    viewedCartRef.current = true;
    trackViewCart(cart);
  }, [cart]);

  const { freeDeliveryFrom: FREE_DELIVERY_FROM } = useStoreSettings();
  const progress = Math.min(100, Math.round((total / FREE_DELIVERY_FROM) * 100));
  const left = Math.max(0, FREE_DELIVERY_FROM - total);
  const freeDelivery = left === 0;

  if (!isReady) {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <ShoppingBag className="mb-6 h-14 w-14 text-ink-3" strokeWidth={1.25} />
        <h1 className="display-lg">Кошик порожній.</h1>
        <p className="lead mt-4">Додайте товари з каталогу — і вони з’являться тут.</p>
        <Link href="/catalog" className="btn-primary btn-lg mt-8">
          Перейти до каталогу
        </Link>
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {popularItems.map((item) => (
            <Link key={item.id} href={`/category/${item.categorySlug}/${item.subcategorySlug}`} className="chip">
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 lg:pb-0">
      <header className="mb-8 flex flex-col gap-4 border-b border-line-soft pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display-lg">Ваш кошик — {formatPrice(total)}.</h1>
          <p className="mt-2 text-[15px] text-ink-2">
            {totalItems} {plural(totalItems, productForms)}. Доставка Новою Поштою за 1–3 дні.
          </p>
        </div>
        <Link href="/checkout" className="btn-primary btn-lg hidden sm:inline-flex">
          Оформити замовлення
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <ul className="divide-y divide-line-soft">
          {cart.map((item) => (
            <li key={item._id} className="flex gap-4 py-6 first:pt-0 sm:gap-8">
              <Link
                href={item.handle ? `/product/${item.handle}` : '#'}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-white sm:h-36 sm:w-36"
              >
                {item.image ? (
                  <ProductImage src={item.image} alt={item.title} fill sizes="144px" className="object-contain p-3" />
                ) : null}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={item.handle ? `/product/${item.handle}` : '#'}
                    className="line-clamp-2 text-[15px] font-semibold leading-snug sm:text-[17px]"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-[13px] text-ink-2">{formatPrice(item.price)} за шт.</p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item._id!)}
                    className="mt-2 text-[14px] text-accent hover:underline"
                  >
                    Видалити
                  </button>
                </div>

                <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:justify-start">
                  <p className="order-2 text-[17px] font-semibold sm:order-1">{formatPrice(item.price * item.quantity)}</p>
                  <div className="order-1 flex items-center rounded-full bg-white p-1 sm:order-2">
                    <button
                      type="button"
                      onClick={() => decrement(item._id!)}
                      disabled={item.quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-canvas disabled:opacity-30"
                      aria-label="Зменшити кількість"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-[15px] font-medium tabular-nums" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => increment(item._id!)}
                      className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-canvas"
                      aria-label="Збільшити кількість"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside>
          <div className="panel p-6 sm:p-8 lg:sticky lg:top-24">
            <div className="mb-6 rounded-2xl bg-canvas p-4">
              <p className="flex items-center gap-2 text-[14px] font-medium">
                <Truck className={`h-5 w-5 ${freeDelivery ? 'text-accent' : 'text-ink-2'}`} strokeWidth={1.75} />
                {freeDelivery ? 'Доставка безкоштовна' : `Ще ${formatPrice(left)} до безкоштовної доставки`}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <dl className="space-y-3 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-ink-2">Товари ({totalItems})</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Доставка</dt>
                <dd>{freeDelivery ? 'Безкоштовно' : 'За тарифами НП'}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line-soft pt-4">
                <dt className="text-[17px] font-semibold">Разом</dt>
                <dd className="text-[24px] font-semibold tracking-tight">{formatPrice(total)}</dd>
              </div>
            </dl>

            <Link href="/checkout" className="btn-primary btn-lg mt-6 w-full">
              Оформити замовлення
            </Link>
            <Link href="/catalog" className="link-more mt-4 flex justify-center text-[14px]">
              Продовжити покупки
              <ChevronRight className="h-4 w-4" />
            </Link>

            <div className="mt-6 border-t border-line-soft pt-6">
              <PaymentRulesNote />
            </div>
          </div>
        </aside>
      </div>

      <CartUpsell />

      {/* Липка кнопка (мобільний) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-white/85 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-ink-2">Разом</p>
            <p className="text-[19px] font-semibold tracking-tight">{formatPrice(total)}</p>
          </div>
          <Link href="/checkout" className="btn-primary">
            Оформити
          </Link>
        </div>
      </div>
    </div>
  );
}
