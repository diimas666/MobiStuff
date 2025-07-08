'use client';
import { useCart } from '@/context/CartContext';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchCities, fetchWarehouses } from '@/lib/novaposhta';

const isValidPhone = (phone: string) => /^(\+?38)?0\d{9}$/.test(phone.trim());

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' або 'card'

  const [cityInput, setCityInput] = useState('');
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [cityRef, setCityRef] = useState('');
  const [cityLabel, setCityLabel] = useState('');

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouse, setWarehouse] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (cityInput.length > 2) {
        fetchCities(cityInput).then(setCitiesList);
      } else {
        setCitiesList([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [cityInput]);

  useEffect(() => {
    if (cityRef) {
      fetchWarehouses(cityRef).then(setWarehouses);
    } else {
      setWarehouses([]);
    }
  }, [cityRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      alert('❌ Невірний номер телефону');
      return;
    }

    if (!cityRef || !warehouse) {
      alert('❌ Оберіть місто та відділення');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('❌ Невірний email');
      return;
    }

    const order = {
      name,
      lastName,
      phone,
      email,
      comment,
      paymentMethod,
      city: cityLabel,
      cityRef,
      warehouse,
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
        alert('✅ Замовлення прийнято!');
        clearCart();
        router.push('/thank-you');
      } else {
        const data = await res.json();
        alert(`❌ Помилка: ${data.message || 'Спробуйте ще раз'}`);
      }
    } catch {
      alert('❌ Сервер недоступний');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-black transition cursor-pointer"
      >
        <ArrowLeft size={20} />
        Назад до кошика
      </button>

      <h2 className="text-2xl font-bold mb-4">Оформлення замовлення</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ім’я"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="text"
          placeholder="Прізвище"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="tel"
          placeholder="+380XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="email"
          placeholder="email (необов’язково)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="text"
          placeholder="Почніть вводити назву міста"
          value={cityInput}
          onChange={(e) => {
            setCityInput(e.target.value);
            setCityRef('');
            setCityLabel('');
            setWarehouses([]);
            setWarehouse('');
          }}
          className="w-full border rounded px-3 py-2"
        />

        {citiesList.length > 0 && (
          <div className="relative">
            <select
              aria-label="Оберіть місто"
              className="w-full border rounded px-3 py-2 pr-10 bg-white cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => {
                const selected = citiesList.find(
                  (c) => c.Ref === e.target.value
                );
                if (selected) {
                  setCityRef(selected.Ref);
                  setCityLabel(
                    `${selected.Description} (${selected.AreaDescription})`
                  );
                  setCityInput(selected.Description);
                  setWarehouses([]);
                  setWarehouse('');
                }
              }}
            >
              <option value="">Оберіть місто зі списку</option>
              {citiesList.map((c) => (
                <option key={c.Ref} value={c.Ref}>
                  {c.Description} ({c.AreaDescription})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 011.1 1.02l-4.25 4.66a.75.75 0 01-1.1 0l-4.25-4.66a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}

        {warehouses.length > 0 && (
          <div className="relative">
            <select
              className="w-full border rounded px-3 py-2 pr-10 bg-white cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              aria-label="Оберіть відділення"
              required
            >
              <option value="">Оберіть відділення</option>
              {warehouses.map((w) => (
                <option key={w.Ref} value={w.Description}>
                  {w.Description}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 011.1 1.02l-4.25 4.66a.75.75 0 01-1.1 0l-4.25-4.66a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}

        <textarea
          rows={3}
          placeholder="Коментар до замовлення (необов’язково)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        {/* Спосіб оплати */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">
            Спосіб оплати
          </label>
          <select
            className="w-full border rounded px-3 py-2 appearance-none pr-10 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            aria-label="Оберіть оплату"
          >
            <option value="cod">Оплата при отриманні</option>
            <option value="card">Оплата карткою</option>
          </select>

          {/* Стрелочка справа */}
          <div className="pointer-events-none absolute top-[38px] right-3 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <div className="flex justify-between items-center font-bold text-lg">
          <span>Сума до оплати:</span>
          <span className="text-green-600">{total} ₴</span>
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
          onClick={() => {
            router.push('/thank-you');
          }}
        >
          Підтвердити замовлення
        </button>
      </form>
    </div>
  );
}
