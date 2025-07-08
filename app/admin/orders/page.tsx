'use client';

import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/admin/getOrders')
      .then((res) => res.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (!confirm('Видалити вибрані замовлення?')) return;

    await fetch('/api/admin/deleteOrders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected }),
    });

    setSelected([]);
    fetchOrders();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📦 Замовлення</h1>

      {selected.length > 0 && (
        <button
          onClick={deleteSelected}
          className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          🗑️ Видалити вибрані ({selected.length})
        </button>
      )}

      {loading ? (
        <p>Завантаження...</p>
      ) : orders.length === 0 ? (
        <p>Замовлень поки немає.</p>
      ) : (
        <table className="w-full border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? orders.map((o) => o._id) : []
                    )
                  }
                  checked={selected.length === orders.length}
                />
              </th>
              <th className="p-2 border">Дата</th>
              <th className="p-2 border">Ім’я</th>
              <th className="p-2 border">Телефон</th>
              <th className="p-2 border">Сума</th>
              <th className="p-2 border">Місто</th>
              <th className="p-2 border">Оплата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selected.includes(order._id)}
                    onChange={() => toggleSelect(order._id)}
                  />
                </td>
                <td className="p-2 border">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border">
                  {order.name} {order.lastName}
                </td>
                <td className="p-2 border">{order.phone}</td>
                <td className="p-2 border">{order.total} ₴</td>
                <td className="p-2 border">{order.city}</td>
                <td className="p-2 border">
                  {order.paymentMethod === 'card' ? 'Картка' : 'Післяплата'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
