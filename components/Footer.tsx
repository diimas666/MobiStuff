import Link from 'next/link';
import Container from '@/components/Container';
import { Mail, Truck, CreditCard } from 'lucide-react';
// import { Facebook, Instagram } from 'lucide-react';
import { storePolicies } from '@/data/storePolicies';

const navLinks = [
  { href: '/about', label: 'Про нас' },
  { href: '/delivery', label: 'Доставка і оплата' },
  { href: '/returns', label: 'Повернення' },
  { href: '/contacts', label: 'Контакти' },
];

export default function Footer() {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900" />
      <div className="absolute -top-20 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 left-0 w-48 h-48 bg-green-400/5 rounded-full blur-2xl" />

      <Container className="relative py-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block group mb-4">
              <span className="text-2xl font-bold text-white tracking-tight">
                Mobi
                <span className="text-green-400 group-hover:text-green-300 transition-colors">
                  Stuff
                </span>
              </span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Найкращі аксесуари для ваших ґаджетів — навушники, зарядки, чохли та інше з
              доставкою по Україні.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <span className="inline-flex items-start gap-2 text-xs text-gray-300">
                <Truck className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                {storePolicies.freeDelivery}
              </span>
              <span className="inline-flex items-start gap-2 text-xs text-gray-300">
                <CreditCard className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                {storePolicies.cardOnly}
              </span>
            </div>

            <a
              href="mailto:mobistuffinfo@gmail.com"
              className="mt-5 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-green-300 transition"
            >
              <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </span>
              mobistuffinfo@gmail.com
            </a>
          </div>

          <div className="lg:col-span-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white mb-4">
              <span className="w-1 h-5 rounded-full bg-green-400" />
              Навігація
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-300 transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* TODO: увімкнути, коли будуть актуальні соцмережі
          <div className="lg:col-span-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white mb-4">
              <span className="w-1 h-5 rounded-full bg-green-400" />
              Ми в соцмережах
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Слідкуйте за новинками, акціями та оглядами аксесуарів.
            </p>
            <div className="flex gap-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/15 hover:border-green-500/40 hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/15 hover:border-green-500/40 hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>
          */}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} MobiStuff. Всі права захищені.</p>
          <p className="text-gray-600">Інтернет-магазин мобільних аксесуарів в Україні</p>
        </div>
      </Container>
    </footer>
  );
}
