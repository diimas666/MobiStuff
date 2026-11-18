'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import NovaPoshtaDelivery, { type NovaPoshtaSelection } from '@/components/NovaPoshtaDelivery';
import CheckoutConsentCheckbox from '@/components/CheckoutConsentCheckbox';
import PaymentRulesNote from '@/components/PaymentRulesNote';
import ProductImage from '@/components/ProductImage';
import { AlertCircle, ChevronLeft, CreditCard, Loader2, Lock, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CARD_ONLY_FROM, storePolicies } from '@/data/storePolicies';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { generateOrderId } from '@/lib/orderStatus';
import { trackBeginCheckout } from '@/lib/analytics';
import { formatPrice, plural, productForms } from '@/lib/format';

const inputClass = 'field';

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="panel p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white">
          {n}
        </span>
        <div>
          <h2 className="text-[22px] font-semibold leading-tight tracking-tight">{title}</h2>
          {hint ? <p className="mt-1 text-[14px] text-ink-2">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function CheckoutPage() {
  const { cart, clearCart, isReady } = useCart();
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
  const [personalDataConsent, setPersonalDataConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const cardOnlyRequired = total >= CARD_ONLY_FROM;

  const [delivery, setDelivery] = useState<NovaPoshtaSelection>({
    cityRef: '',
    cityLabel: '',
    warehouse: '',
  });

  useEffect(() => {
    if (isReady && cart.length === 0 && !orderCompletedRef.current) {
      router.replace('/cart');
    }
  }, [cart.length, isReady, router]);

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
    setFormError(null);
    setIsLoading(true);

    const fail = (message: string) => {
      setFormError(message);
      setIsLoading(false);
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    };

    const normalizedPhone = normalizeUkrainianPhone(phone);
    if (!normalizedPhone) {
      return fail('Перевірте номер телефону. Наприклад: 0991234567.');
    }

    if (!delivery.cityRef || !delivery.warehouse) {
      return fail('Оберіть місто та відділення Нової Пошти.');
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail('Перевірте email — схоже, в адресі помилка.');
    }

    if (cardOnlyRequired && paymentMethod !== 'card') {
      return fail(storePolicies.cardOnly);
    }

    if (!personalDataConsent) {
      setConsentError(true);
      return fail('Підтвердьте згоду на обробку персональних даних.');
    }

    setConsentError(false);

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
      } else {
        fail('Не вдалося оформити замовлення. Спробуйте ще раз або напишіть нам на mobistuffinfo@gmail.com.');
      }
    } catch {
      fail('Немає з’єднання з сервером. Перевірте інтернет і спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && !orderCompletedRef.current) {
    return null;
  }

  return (
    <div className="pb-10">
      <header className="mb-8">
        <Link href="/cart" className="link-more mb-4 text-[14px]">
          <ChevronLeft className="h-4 w-4" />
          Кошик
        </Link>
        <h1 className="display-lg">Оформлення замовлення.</h1>
        <p className="mt-2 text-[15px] text-ink-2">
          {totalItems} {plural(totalItems, productForms)} на {formatPrice(total)}. Займе близько хвилини.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate={false} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
        <div className="min-w-0 space-y-4">
          <Step n={1} title="Контактні дані" hint="Зателефонуємо, щоб підтвердити замовлення.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-name" className="field-label">Ім’я</label>
                <input id="co-name" type="text" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="co-last" className="field-label">Прізвище</label>
                <input id="co-last" type="text" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="co-phone" className="field-label">Телефон</label>
                <input
                  id="co-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => {
                    const normalized = normalizeUkrainianPhone(phone);
                    if (normalized) setPhone(normalized);
                  }}
                  required
                  placeholder="099 123 45 67"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="co-email" className="field-label">Email <span className="text-ink-3">(необов’язково)</span></label>
                <input id="co-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
          </Step>

          <Step n={2} title="Доставка" hint="Нова Пошта, на відділення по всій Україні.">
            <NovaPoshtaDelivery value={delivery} onChange={setDelivery} />
          </Step>

          <Step n={3} title="Оплата">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Спосіб оплати">
              {[
                { value: 'cod', icon: Wallet, title: 'При отриманні', text: cardOnlyRequired ? `Недоступно від ${formatPrice(CARD_ONLY_FROM)}` : 'Огляньте товар і оплатіть у відділенні' },
                { value: 'card', icon: CreditCard, title: 'Карткою', text: 'Visa / Mastercard, реквізити надішлемо після підтвердження' },
              ].map(({ value, icon: Icon, title, text }) => {
                const disabled = value === 'cod' && cardOnlyRequired;
                const checked = paymentMethod === value;
                return (
                  <label
                    key={value}
                    className={`relative flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                      checked ? 'border-accent bg-accent-soft ring-1 ring-accent' : 'border-line hover:border-ink-3'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => setPaymentMethod(value)}
                      className="sr-only"
                    />
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.75} />
                    <span>
                      <span className="block text-[15px] font-semibold">{title}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-2">{text}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {!cardOnlyRequired && <p className="mt-3 text-[13px] text-ink-2">{storePolicies.codAvailable}.</p>}

            <div className="mt-6">
              <label htmlFor="co-comment" className="field-label">Коментар до замовлення <span className="text-ink-3">(необов’язково)</span></label>
              <textarea id="co-comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className={`${inputClass} resize-none`} />
            </div>
          </Step>
        </div>

        <aside>
          <div className="panel p-6 sm:p-8 lg:sticky lg:top-24">
            <h2 className="mb-5 text-[22px] font-semibold tracking-tight">Ваше замовлення</h2>

            <ul className="no-scrollbar max-h-[300px] space-y-4 overflow-y-auto">
              {cart.map((item) => (
                <li key={item._id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-canvas">
                    {item.image ? (
                      <ProductImage src={item.image} alt={item.title} fill sizes="56px" className="object-contain p-1.5" />
                    ) : null}
                    {item.quantity > 1 && (
                      <span className="absolute -top-0 -right-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-white">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-snug">{item.title}</p>
                  <span className="shrink-0 text-[14px] font-medium">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-baseline justify-between border-t border-line-soft pt-5">
              <span className="text-[17px] font-semibold">До сплати</span>
              <span className="text-[26px] font-semibold tracking-tight">{formatPrice(total)}</span>
            </div>

            <div className="mt-5">
              <PaymentRulesNote />
            </div>

            <div className="mt-5">
              <CheckoutConsentCheckbox
                checked={personalDataConsent}
                onChange={(checked) => {
                  setPersonalDataConsent(checked);
                  if (checked) setConsentError(false);
                }}
                showError={consentError}
              />
            </div>

            {formError && (
              <div ref={errorRef} role="alert" className="fade-in mt-5 flex gap-2 rounded-2xl bg-sale/5 p-4 text-[14px] text-sale">
                <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary btn-lg mt-6 w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Оформлюємо…
                </>
              ) : (
                'Підтвердити замовлення'
              )}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ink-3">
              <Lock className="h-3.5 w-3.5" />
              Дані передаються захищеним з’єднанням
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
