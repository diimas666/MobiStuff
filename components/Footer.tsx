// components/Footer.tsx
import Link from 'next/link';
import { Facebook, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white px-6 py-10 mt-12">
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3 text-sm">
        {/* Бренд / Контакты */}
        <div>
          <h2 className="text-xl font-bold mb-3">Mobistuff</h2>
          <p className="text-gray-400">
            Найкращі аксесуари для ваших ґаджетів.
          </p>
          <p className="mt-4 flex items-center gap-2 text-gray-400">
            <Mail size={16} /> mobistuffinfo@gmail.com
          </p>
        </div>

        {/* Навигация */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Навігація</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link href="/about" className="hover:underline">
                Про нас
              </Link>
            </li>
            <li>
              <Link href="/delivery" className="hover:underline">
                Доставка і оплата
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:underline">
                Повернення
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="hover:underline">
                Контакти
              </Link>
            </li>
          </ul>
        </div>

        {/* Соцмережі */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Ми в соцмережах</h3>
          <div className="flex gap-4">
            <Link
              href="https://facebook.com"
              target="_blank"
              className="hover:text-blue-400"
            >
              <Facebook size={20} />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              className="hover:text-pink-400"
            >
              <Instagram size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} Mobistuff. Всі права захищені.
      </div>
    </footer>
  );
}
