import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPageLayout, { InfoCard, InfoStep } from '@/components/InfoPageLayout';
import { BadgeCheck, PackageSearch, ShieldCheck, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Гарантія',
  description: 'Гарантія на аксесуари MobiStuff: що робити, якщо товар зламався, як оформити гарантійний обмін і скільки це займає.',
  alternates: { canonical: '/warranty' },
};

/** Гарантія: умови й порядок звернення (відповідно до Закону «Про захист прав споживачів») */
export default function WarrantyPage() {
  return (
    <InfoPageLayout
      badge="Гарантія"
      title="Якщо щось пішло не так"
      subtitle="Продаємо лише офіційний товар. Якщо аксесуар виявився з дефектом — замінимо його або повернемо гроші."
      ctaLabel="Відстежити посилку"
      ctaHref="/tracking"
    >
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Гарантія виробника">
          Строк гарантії вказаний в описі товару або на упаковці. Якщо не вказаний — діють норми Закону «Про захист прав споживачів».
        </InfoCard>
        <InfoCard icon={<PackageSearch className="h-5 w-5" />} title="Перевірка у відділенні">
          Огляньте посилку при отриманні. Якщо є пошкодження — складіть акт з працівником Нової Пошти.
        </InfoCard>
        <InfoCard icon={<BadgeCheck className="h-5 w-5" />} title="Без зайвих питань">
          Заводський брак — обмін на новий або повернення коштів після перевірки.
        </InfoCard>
      </div>

      <h2 className="mb-5 text-[24px] font-semibold tracking-tight">Як оформити гарантійне звернення</h2>
      <div className="mb-10 space-y-4">
        <InfoStep number={1} title="Напишіть нам">
          Вкажіть номер замовлення, опишіть проблему і додайте фото чи відео дефекту — через <Link href="/contacts" className="text-accent hover:underline">контакти</Link> або підтримку в застосунку.
        </InfoStep>
        <InfoStep number={2} title="Надішліть товар">
          Ми підкажемо адресу. Збережіть комплектацію і, за можливості, упаковку.
        </InfoStep>
        <InfoStep number={3} title="Отримайте рішення">
          Після перевірки (зазвичай до 14 днів) відправимо заміну або повернемо гроші на картку.
        </InfoStep>
      </div>

      <div className="rounded-3xl bg-white p-6">
        <p className="flex items-center gap-2 text-[17px] font-semibold">
          <Wrench className="h-5 w-5 text-accent" /> Що не є гарантійним випадком
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-ink-2">
          <li>механічні пошкодження, сліди падіння чи вологи після отримання;</li>
          <li>природне зношування (подряпини на чохлі, потертості кабелю);</li>
          <li>використання не за призначенням або з несумісними пристроями.</li>
        </ul>
        <p className="mt-4 text-[14px] text-ink-3">
          Повернення товару належної якості протягом 14 днів — на сторінці <Link href="/returns" className="text-accent hover:underline">«Повернення»</Link>.
        </p>
      </div>
    </InfoPageLayout>
  );
}
