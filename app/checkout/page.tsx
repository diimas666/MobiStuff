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

  const [cityInput, setCityInput] = useState('');
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [cityRef, setCityRef] = useState('');
  const [cityLabel, setCityLabel] = useState('');

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouse, setWarehouse] = useState('');

  // 🔍 Автозагрузка городов
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

  // 🏤 Загрузка отделений при выборе города
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
      alert('❌ Неверный номер телефона');
      return;
    }

    if (!cityRef || !warehouse) {
      alert('❌ Выберите город и отделение');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('❌ Неверный email');
      return;
    }

    const order = {
      name,
      lastName,
      phone,
      email,
      comment,
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
        alert('✅ Заказ принят!');
        clearCart();
        router.push('/thank-you');
      } else {
        const data = await res.json();
        alert(`❌ Ошибка: ${data.message || 'Попробуйте еще раз'}`);
      }
    } catch {
      alert('❌ Сервер недоступен');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-black transition"
      >
        <ArrowLeft size={20} />
        Назад к корзине
      </button>

      <h2 className="text-2xl font-bold mb-4">Оформление заказа</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="text"
          placeholder="Фамилия"
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
          placeholder="example@domain.com (необязательно)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        {/* Поле для ввода города */}
        <input
          type="text"
          placeholder="Начните вводить название города"
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

        {/* Выбор из списка найденных городов */}
        {citiesList.length > 0 && (
          <select
            className="w-full border rounded px-3 py-2"
            onChange={(e) => {
              const selected = citiesList.find((c) => c.Ref === e.target.value);
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
            <option value="">Выберите город из списка</option>
            {citiesList.map((c) => (
              <option key={c.Ref} value={c.Ref}>
                {c.Description} ({c.AreaDescription})
              </option>
            ))}
          </select>
        )}

        {/* Отделения */}
        {warehouses.length > 0 && (
          <select
            className="w-full border rounded px-3 py-2"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            required
          >
            <option value="">Оберіть відділення</option>
            {warehouses.map((w) => (
              <option key={w.Ref} value={w.Description}>
                {w.Description}
              </option>
            ))}
          </select>
        )}

        <textarea
          rows={3}
          placeholder="Комментарий к заказу (необязательно)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <div className="flex justify-between items-center font-bold text-lg">
          <span>Сумма к оплате:</span>
          <span className="text-green-600">{total} ₴</span>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
        >
          Подтвердить заказ
        </button>
      </form>
    </div>
  );
}
