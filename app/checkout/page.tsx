'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import HomeSectionTitle from '@/components/HomeSectionTitle';
import NovaPoshtaDelivery, { type NovaPoshtaSelection } from '@/components/NovaPoshtaDelivery';
import PaymentRulesNote from '@/components/PaymentRulesNote';
import ProductImage from '@/components/ProductImage';
import { ArrowLeft, ArrowRight, CreditCard, Loader2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CARD_ONLY_FROM, storePolicies } from '@/data/storePolicies';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { generateOrderId } from '@/lib/orderStatus';
import { trackBeginCheckout } from '@/lib/analytics';

const inputClass =
  'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [isLoading, setIsLoading] = useState(false);
  const orderCompletedRef = useRef(false);
  const checkoutTrackedRef = useRef(false);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const cardOnlyRequired = total >= CARD_ONLY_FROM;

  const [delivery, setDelivery] = useState<NovaPoshtaSelection>({
    cityRef: '',
    cityLabel: '',
    warehouse: '',
  });

  useEffect(() => {
    if (cart.length === 0 && !orderCompletedRef.current) {
      router.replace('/cart');
    }
  }, [cart.length, router]);

  useEffect(() => {
    if (cardOnlyRequired) {
      setPaymentMethod('card');
    }
  }, [cardOnlyRequired]);

  useEffect(() => {
    if (checkoutTrackedRef.current || cart.length === 0) return;
    checkoutTrackedRef.current = true;
    trackBeginCheckout(cart);
  }, [cart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const normalizedPhone = normalizeUkrainianPhone(phone);
    if (!normalizedPhone) {
      alert('❌ Невірний номер телефону. Введіть, наприклад: 0991234567 або 80991234567');
      setIsLoading(false);
      return;
    }

    if (!delivery.cityRef || !delivery.warehouse) {
      alert('❌ Оберіть місто та відділення Нової Пошти');
      setIsLoading(false);
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('❌ Невірний email');
      setIsLoading(false);
      return;
    }

    if (cardOnlyRequired && paymentMethod !== 'card') {
      alert(`❌ ${storePolicies.cardOnly}`);
      setIsLoading(false);
      return;
    }

    const order = {
      orderId: generateOrderId(),
      name,
      lastName,
      phone: normalizedPhone,
      email,
      comment,
      paymentMethod,
      city: delivery.cityLabel,
      cityRef: delivery.cityRef,
      warehouse: delivery.warehouse,
      total,
      items: cart,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (res.ok) {
        orderCompletedRef.current = true;
        localStorage.setItem('lastOrder', JSON.stringify(order));
        clearCart();
        router.replace('/thank-you');
      }
    } catch {
      alert('❌ Сервер недоступний');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && !orderCompletedRef.current) {
    return null;
  }

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white px-5 py-8 sm:px-8 sm:py-10 mb-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-green-400/10 rounded-full blur-2xl" />
        <div className="relative flex flex-col gap-4">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 w-fit text-sm text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад до кошика
          </Link>
          <div className="flex flex-col gap-3">
          <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
            <Package className="w-3.5 h-3.5" />
            Оформлення
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Оформлення замовлення</h1>
          <p className="text-gray-300 text-sm sm:text-base">
            {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товари' : 'товарів'} на суму {total} грн
          </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 space-y-4">
          <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
            <HomeSectionTitle title="Контактні дані" subtitle="Для зв'язку та підтвердження замовлення" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ім&apos;я <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ваше ім'я"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Прізвище <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Ваше прізвище"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => {
                    const normalized = normalizeUkrainianPhone(phone);
                    if (normalized) setPhone(normalized);
                  }}
                  required
                  placeholder="0991234567"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email (необов'язково)"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
            <HomeSectionTitle title="Доставка" subtitle="Нова Пошта — на відділення" />
            <div className="mt-5">
              <NovaPoshtaDelivery value={delivery} onChange={setDelivery} />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
            <HomeSectionTitle title="Оплата та коментар" />

            <div className="space-y-4 mt-5">
              {cardOnlyRequired && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                  {storePolicies.cardOnly}
                </div>
              )}

              {!cardOnlyRequired && (
                <p className="text-sm text-gray-500">{storePolicies.codAvailable}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Спосіб оплати <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    className={`${inputClass} pl-10 appearance-none cursor-pointer disabled:opacity-70`}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={cardOnlyRequired}
                  >
                    <option value="cod" disabled={cardOnlyRequired}>
                      Оплата при отриманні
                    </option>
                    <option value="card">Оплата карткою</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Коментар</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Коментар до замовлення (необов'язково)"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:w-[340px] shrink-0">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm lg:sticky lg:top-[88px]">
            <HomeSectionTitle title="Ваше замовлення" />

            <ul className="space-y-3 mt-4 max-h-[280px] overflow-y-auto">
              {cart.map((item) => (
                <li key={item._id} className="flex items-center gap-3">
                  {item.image ? (
                    <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                      <ProductImage
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="48px"
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-800 line-clamp-2 leading-snug">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.quantity} × {item.price} грн
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 shrink-0">
                    {item.price * item.quantity}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-baseline">
              <span className="font-semibold text-gray-900">До сплати</span>
              <span className="text-2xl font-bold text-green-600">{total} грн</span>
            </div>

            <div className="mt-4">
              <PaymentRulesNote />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-5 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Опрацювання...
                </>
              ) : (
                <>
                  Підтвердити замовлення
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
