import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPageLayout, { InfoCard, InfoStep } from '@/components/InfoPageLayout';
import { CheckCircle2, Mail, PackageX, RefreshCw, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Повернення | MobiStuff',
  description:
    'Політика повернення товарів у магазині MobiStuff. Ви можете повернути товар протягом 14 днів згідно із законодавством України.',
  alternates: { canonical: '/returns' },
};

export default function ReturnsPage() {
  return (
    <InfoPageLayout
      badge="Гарантія спокою"
      title="Повернення без зайвих клопотів"
      subtitle="Не підійшов товар? У вас є 14 днів, щоб повернути або обміняти його згідно із законодавством України."
      ctaLabel="Переглянути каталог"
      ctaHref="/"
    >
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <InfoCard icon={<Shield className="w-5 h-5" />} title="14 днів">
          На повернення або обмін з моменту отримання замовлення
        </InfoCard>
        <InfoCard icon={<RefreshCw className="w-5 h-5" />} title="3–5 днів">
          Повернення коштів після перевірки товару на рахунок
        </InfoCard>
        <InfoCard icon={<CheckCircle2 className="w-5 h-5" />} title="Просто">
          Погоджуємо повернення заздалегідь — без сюрпризів
        </InfoCard>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PackageX className="w-5 h-5 text-green-500" />
          Умови повернення
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-green-500 font-bold">✓</span>
            Товар у <strong>оригінальній упаковці</strong>, без слідів використання
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 font-bold">✓</span>
            Повна <strong>комплектація</strong> збережена
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 font-bold">✓</span>
            Наявність <strong>чека або підтвердження замовлення</strong>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 font-bold">✓</span>
            Попереднє погодження з нашою підтримкою обов&apos;язкове
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-500" />
          Як оформити повернення
        </h2>
        <div className="space-y-6">
          <InfoStep number={1} title="Напишіть нам">
            Email:{' '}
            <a href="mailto:mobistuffinfo@gmail.com" className="text-green-600 font-medium hover:underline">
              mobistuffinfo@gmail.com
            </a>
            . Вкажіть номер замовлення та причину.
          </InfoStep>
          <InfoStep number={2} title="Отримайте підтвердження">
            Ми перевіримо можливість повернення та надішлемо інструкцію з адресою відправки.
          </InfoStep>
          <InfoStep number={3} title="Відправте товар">
            Надішліть через Нову Пошту за узгодженими реквізитами.
          </InfoStep>
          <InfoStep number={4} title="Отримайте кошти">
            Після перевірки товару повернемо кошти протягом 3–5 банківських днів.
          </InfoStep>
        </div>
      </section>

      <p className="text-center text-sm text-gray-500">
        Детальніше — в{' '}
        <a
          href="https://zakon.rada.gov.ua/laws/show/1023-12"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          Законі України «Про захист прав споживачів»
        </a>
        . Питання?{' '}
        <Link href="/contacts" className="text-green-600 hover:underline">
          Контакти
        </Link>
      </p>
    </InfoPageLayout>
  );
}
