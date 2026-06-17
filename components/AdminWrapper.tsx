'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  const verifyPassword = async (password: string) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return res.ok;
  };

  useEffect(() => {
    const saved = localStorage.getItem('admin_access');
    if (!saved) {
      setChecking(false);
      return;
    }

    verifyPassword(saved)
      .then((ok) => {
        if (ok) setAuth(true);
        else localStorage.removeItem('admin_access');
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const ok = await verifyPassword(pass);
      if (ok) {
        setAuth(true);
        localStorage.setItem('admin_access', pass);
      } else {
        setError('Неправильний пароль');
      }
    } catch {
      setError('Помилка зʼєднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_access');
    setAuth(false);
    setPass('');
  };

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Перевірка доступу...
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="h-screen flex flex-col justify-center items-center px-4">
        <h1 className="text-xl font-bold mb-4">🔐 Вхід в адмінку</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col items-center w-full max-w-xs"
        >
          <input
            type="password"
            placeholder="Введіть пароль"
            className="border px-4 py-2 rounded w-full"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            disabled={loading || !pass}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 w-full"
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 flex-wrap">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ➕ Додати товар
          </Link>
          <Link href="/admin/products" className="text-blue-600 hover:underline">
            📋 Товари
          </Link>
          <Link href="/admin/promotions" className="text-blue-600 hover:underline">
            🎯 Акції
          </Link>
          <Link href="/admin/orders" className="text-blue-600 hover:underline">
            📦 Замовлення
          </Link>
          <Link href="/admin/analytics" className="text-blue-600 hover:underline">
            📊 Аналітика
          </Link>
          <Link href="/admin/sync" className="text-blue-600 hover:underline">
            🔄 Синх. MMA
          </Link>
          <Link href="/" className="text-blue-600 hover:underline">
            🏠 На сайт
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        >
          Вийти
        </button>
      </div>
      {children}
    </div>
  );
}
