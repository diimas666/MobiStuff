'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import ProductImage from '@/components/ProductImage';
import CategoryList from '@/components/CategoryList';
import HomeSectionTitle from '@/components/HomeSectionTitle';
import PaymentRulesNote from '@/components/PaymentRulesNote';
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FREE_DELIVERY_FROM } from '@/data/storePolicies';

export default function CartPage() {
  const { cart, increment, decrement, removeFromCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();

  const deliveryProgress = Math.min(100, Math.round((total / FREE_DELIVERY_FROM) * 100));
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_FROM - total);

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white px-5 py-8 sm:px-8 sm:py-10 mb-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-green-400/10 rounded-full blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
            <ShoppingCart className="w-3.5 h-3.5" />
            Кошик
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Ваш кошик</h1>
          <p className="text-gray-300 text-sm sm:text-base mt-2">
            {cart.length > 0
              ? `${totalItems} ${totalItems === 1 ? 'товар' : totalItems < 5 ? 'товари' : 'товарів'} на суму ${total} грн`
              : 'Додайте товари з каталогу, щоб оформити замовлення'}
          </p>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-4">
        <aside className="hidden md:block w-[300px] shrink-0 px-4 py-4 rounded-2xl border border-gray-100 bg-white shadow-sm h-fit sticky top-[88px] z-30">
          <HomeSectionTitle title="Каталог" />
          <CategoryList />
        </aside>

        <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-4">
          <section className="flex-1 min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-5">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Кошик порожній</h2>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                  Оберіть аксесуари в каталозі та натисніть іконку кошика на картці товару.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
                >
                  Перейти до каталогу
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <HomeSectionTitle
                  title="Товари в кошику"
                  subtitle={`${cart.length} ${cart.length === 1 ? 'позиція' : cart.length < 5 ? 'позиції' : 'позицій'}`}
                />

                <ul className="space-y-3 mt-5">
                  {cart.map((item) => {
                    const lineTotal = item.price * item.quantity;
                    const titleContent = (
                      <p className="font-medium text-gray-900 line-clamp-2 text-sm sm:text-base leading-snug">
                        {item.title}
                      </p>
                    );

                    return (
                      <li
                        key={item._id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:border-green-200 hover:bg-white transition"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {item.image ? (
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-white border border-gray-100">
                              <ProductImage
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="96px"
                                loading="lazy"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center text-xs text-gray-400">
                              Нема фото
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            {item.handle ? (
                              <Link href={`/product/${item.handle}`} className="hover:text-green-600 transition">
                                {titleContent}
                              </Link>
                            ) : (
                              titleContent
                            )}
                            <p className="text-green-600 font-bold text-lg mt-1">{item.price} грн</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {item.quantity} × {item.price} = {lineTotal} грн
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => decrement(item._id!)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-700"
                              aria-label="Зменшити кількість"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="min-w-[28px] text-center font-semibold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => increment(item._id!)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-700"
                              aria-label="Збільшити кількість"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id!)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition"
                            aria-label="Видалити з кошика"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>

          {cart.length > 0 && (
            <aside className="lg:w-[320px] shrink-0">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm lg:sticky lg:top-[88px]">
                <HomeSectionTitle title="Підсумок" />

                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Товарів</span>
                    <span className="font-medium text-gray-900">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Позицій</span>
                    <span className="font-medium text-gray-900">{cart.length}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">До сплати</span>
                    <span className="text-2xl font-bold text-green-600">{total} грн</span>
                  </div>
                </div>

                {total < FREE_DELIVERY_FROM && (
                  <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-100">
                    <p className="text-xs text-green-800 mb-2">
                      До безкоштовної доставки залишилось{' '}
                      <strong>{amountToFreeDelivery} грн</strong>
                    </p>
                    <div className="h-1.5 rounded-full bg-green-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                        style={{ width: `${deliveryProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {total >= FREE_DELIVERY_FROM && (
                  <p className="mt-4 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                    Безкоштовна доставка доступна для цього замовлення
                  </p>
                )}

                <div className="mt-4">
                  <PaymentRulesNote />
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="w-full mt-5 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition"
                >
                  Оформити замовлення
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/"
                  className="block text-center text-sm text-gray-500 hover:text-green-600 mt-3 transition"
                >
                  Продовжити покупки
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
