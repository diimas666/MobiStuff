import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPageLayout, { InfoCard } from '@/components/InfoPageLayout';
import PaymentRulesNote from '@/components/PaymentRulesNote';
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Контакти | MobiStuff',
  description:
    'Зв’яжіться з нами — MobiStuff. Ми завжди на зв’язку для консультацій, замовлень та підтримки. Працюємо онлайн по всій Україні!',
  alternates: { canonical: '/contacts' },
};

export default function ContactsPage() {
  return (
    <InfoPageLayout
      badge="Підтримка"
      title="Ми на зв'язку"
      subtitle="Питання щодо товару, замовлення чи доставки? Напишіть нам — відповімо якнайшвидше в робочий час."
      ctaLabel="Перейти до магазину"
      ctaHref="/"
    >
      <div className="mb-8">
        <PaymentRulesNote />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <InfoCard icon={<Mail className="w-5 h-5" />} title="Email">
          <a
            href="mailto:mobistuffinfo@gmail.com"
            className="text-green-600 font-semibold hover:underline text-base"
          >
            mobistuffinfo@gmail.com
          </a>
          <p className="mt-2">Замовлення, повернення, консультації — пишіть сюди.</p>
        </InfoCard>
        <InfoCard icon={<Clock className="w-5 h-5" />} title="Графік роботи">
          <p>
            <strong>Пн – Пт:</strong> 9:00 – 18:00
          </p>
          <p className="mt-1 text-gray-500">Сб – Нд: вихідний</p>
          <p className="mt-2">Замовлення на сайті — цілодобово.</p>
        </InfoCard>
        <InfoCard icon={<MapPin className="w-5 h-5" />} title="Доставка">
          Працюємо <strong>онлайн по всій Україні</strong>. Відправляємо через Нову Пошту на
          відділення або кур&apos;єром.
        </InfoCard>
        <InfoCard icon={<MessageCircle className="w-5 h-5" />} title="Швидкі посилання">
          <ul className="space-y-1.5">
            <li>
              <Link href="/delivery" className="text-green-600 hover:underline">
                Доставка і оплата →
              </Link>
            </li>
            <li>
              <Link href="/returns" className="text-green-600 hover:underline">
                Повернення товарів →
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-green-600 hover:underline">
                Про нас →
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-green-600 hover:underline">
                Політика конфіденційності →
              </Link>
            </li>
          </ul>
        </InfoCard>
      </div>

      <section className="rounded-2xl bg-gray-900 text-white px-6 py-8 sm:px-10 text-center">
        <h2 className="text-lg font-bold mb-4">Ми в соцмережах</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          Слідкуйте за новинками, акціями та знижками на наші сторінки
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10"
          >
            <Facebook className="w-5 h-5" />
            Facebook
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10"
          >
            <Instagram className="w-5 h-5" />
            Instagram
          </a>
        </div>
      </section>
    </InfoPageLayout>
  );
}
