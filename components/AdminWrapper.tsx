'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BellRing, ExternalLink, Loader2, Lock, LogOut, Megaphone, Package, PhoneCall, PlusCircle, RefreshCw, Settings, ShoppingCart, Smartphone, Star, Tag, Ticket, Upload, Users } from 'lucide-react';

const NAV = [
  { href: '/admin/products', label: 'Товари', icon: Package },
  { href: '/admin/promotions', label: 'Акції', icon: Tag },
  { href: '/admin/promo', label: 'Промокоди', icon: Ticket },
  { href: '/admin/orders', label: 'Замовлення', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Покупці', icon: Users },
  { href: '/admin/leads', label: 'Нагадування', icon: PhoneCall },
  { href: '/admin/reviews', label: 'Відгуки', icon: Star },
  { href: '/admin/marketing', label: 'Реклама', icon: Megaphone },
  { href: '/admin/push', label: 'Push', icon: BellRing },
  { href: '/admin/app', label: 'Застосунок', icon: Smartphone },
  { href: '/admin/analytics', label: 'Аналітика', icon: BarChart3 },
  { href: '/admin', label: 'Додати товар', icon: PlusCircle },
  { href: '/admin/import', label: 'Імпорт CSV', icon: Upload },
  { href: '/admin/sync', label: 'Синх. MMA', icon: RefreshCw },
  { href: '/admin/settings', label: 'Налаштування', icon: Settings },
];

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [auth, setAuth] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Старий вхід зберігав пароль у браузері — прибираємо
    try {
      localStorage.removeItem('admin_access');
    } catch {}
    fetch('/api/admin/login', { cache: 'no-store' })
      .then((r) => setAuth(r.ok))
      .catch(() => setAuth(false))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Перезавантажуємо, щоб сторінка підтягнула дані вже з сесією
        window.location.reload();
        return;
      } else {
        setError(data.error || 'Неправильний пароль');
      }
    } catch {
      setError('Немає звʼязку із сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' }).catch(() => {});
    setAuth(false);
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-3">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <form onSubmit={handleLogin} className="panel w-full max-w-sm p-8 text-center">
          <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="text-[24px] font-semibold tracking-tight">Вхід в адмінку</h1>
          <p className="mt-1 text-[14px] text-ink-2">Пароль — значення ADMIN_SECRET на сервері.</p>
          <input
            type="password"
            placeholder="Пароль"
            className="field mt-6 text-center"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            autoFocus
          />
          {error && <p className="mt-3 text-[14px] text-sale" role="alert">{error}</p>}
          <button type="submit" disabled={loading || !pass} className="btn-primary mt-5 w-full">
            {loading ? 'Перевіряємо…' : 'Увійти'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-semibold tracking-tight">Адмінка</h1>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-ghost h-9 px-4 text-[13px]" target="_blank">
            <ExternalLink className="h-4 w-4" />
            Сайт
          </Link>
          <button type="button" onClick={handleLogout} className="btn-ghost h-9 px-4 text-[13px]">
            <LogOut className="h-4 w-4" />
            Вийти
          </button>
        </div>
      </div>
      <nav className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Розділи адмінки">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`chip shrink-0 gap-1.5 ${active ? 'chip-active' : ''}`}>
              <Icon className="h-4 w-4" strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
