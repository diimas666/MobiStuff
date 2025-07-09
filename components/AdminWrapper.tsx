// components/AdminWrapper.tsx
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

  // 🔐 Читання пароля з localStorage при завантаженні сторінки
  useEffect(() => {
    const saved = localStorage.getItem('admin_access');
    if (saved === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setAuth(true);
    }
  }, []);

  const handleLogin = () => {
    if (pass === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setAuth(true);
      localStorage.setItem('admin_access', pass);
    } else {
      alert('❌ Неправильний пароль');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_access');
    setAuth(false);
    setPass('');
  };

  if (!auth) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <h1 className="text-xl font-bold mb-4">🔐 Вхід в адмінку</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col items-center"
        >
          <input
            type="password"
            placeholder="Введіть пароль"
            className="border px-4 py-2 rounded"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button
            type="submit"
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Увійти
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ➕ Додати товар
          </Link>
          <Link href="/admin/orders" className="text-blue-600 hover:underline">
            📦 Замовлення
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
