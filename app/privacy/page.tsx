import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPageLayout from '@/components/InfoPageLayout';
import { privacyPolicyMeta, privacyPolicySections } from '@/data/privacyPolicyUa';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Політика конфіденційності | MobiStuff',
  description:
    'Політика конфіденційності інтернет-магазину MobiStuff. Порядок збору, обробки та захисту персональних даних відповідно до законодавства України.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      badge="Конфіденційність"
      title="Політика конфіденційності"
      subtitle="Як ми збираємо, використовуємо та захищаємо ваші персональні дані відповідно до законодавства України."
      ctaLabel="Перейти до каталогу"
      ctaHref="/"
    >
      <p className="text-sm text-gray-500 mb-8">
        Останнє оновлення: {privacyPolicyMeta.lastUpdated}
      </p>

      <div className="space-y-6">
        {privacyPolicySections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500 shrink-0" />
              {section.title}
            </h2>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="list-disc pl-5 space-y-1.5">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500 mt-10">
        Питання щодо персональних даних?{' '}
        <a
          href={`mailto:${privacyPolicyMeta.email}`}
          className="text-green-600 hover:underline"
        >
          {privacyPolicyMeta.email}
        </a>
        {' · '}
        <Link href="/contacts" className="text-green-600 hover:underline">
          Контакти
        </Link>
      </p>
    </InfoPageLayout>
  );
}
