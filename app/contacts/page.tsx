import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPageLayout, { InfoCard } from '@/components/InfoPageLayout';
import PaymentRulesNote from '@/components/PaymentRulesNote';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { getStoreSettings } from '@/lib/storeSettings';

export const metadata: Metadata = {
  title: 'Контакти',
  description:
    'Зв’яжіться з нами — MobiStuff. Ми завжди на зв’язку для консультацій, замовлень та підтримки. Працюємо онлайн по всій Україні!',
  alternates: { canonical: '/contacts' },
};

export default async function ContactsPage() {
  const s = await getStoreSettings();
  const socials = [
    { label: 'Instagram', href: s.instagram },
    { label: 'Telegram', href: s.telegram },
  ].filter((x) => x.href);
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
        {s.phone && (
          <InfoCard icon={<Phone className="w-5 h-5" />} title="Телефон">
            <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`} className="text-accent font-semibold hover:underline text-base">
              {s.phone}
            </a>
            {s.viber && <p className="mt-2">Viber: {s.viber}</p>}
          </InfoCard>
        )}
        <InfoCard icon={<Mail className="w-5 h-5" />} title="Email">
          <a href={`mailto:${s.email}`} className="text-accent font-semibold hover:underline text-base">
            {s.email}
          </a>
          <p className="mt-2">Замовлення, повернення, консультації — пишіть сюди.</p>
        </InfoCard>
        <InfoCard icon={<Clock className="w-5 h-5" />} title="Графік роботи">
          <p>{s.workingHours || 'Пн – Пт: 9:00 – 18:00'}</p>
          <p className="mt-2">Замовлення на сайті — цілодобово.</p>
        </InfoCard>
        <InfoCard icon={<MapPin className="w-5 h-5" />} title="Доставка">
          Працюємо <strong>онлайн по всій Україні</strong>. Відправляємо через Нову Пошту на
          відділення або кур&apos;єром.
        </InfoCard>
        <InfoCard icon={<MessageCircle className="w-5 h-5" />} title="Швидкі посилання">
          <ul className="space-y-1.5">
            <li>
              <Link href="/delivery" className="text-accent hover:underline">
                Доставка і оплата →
              </Link>
            </li>
            <li>
              <Link href="/returns" className="text-accent hover:underline">
                Повернення товарів →
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-accent hover:underline">
                Про нас →
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-accent hover:underline">
                Політика конфіденційності →
              </Link>
            </li>
          </ul>
        </InfoCard>
      </div>

      {socials.length > 0 && (
        <section className="rounded-[28px] bg-ink text-white px-6 py-12 sm:px-12 text-center">
          <h2 className="text-lg font-bold mb-4">Ми в соцмережах</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Новинки, акції та знижки — першими там</p>
          <div className="flex justify-center gap-3">
            {socials.map((x) => (
              <a key={x.label} href={x.href} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 px-5 py-3 font-medium transition hover:bg-white/20">
                {x.label}
              </a>
            ))}
          </div>
        </section>
      )}
    </InfoPageLayout>
  );
}
