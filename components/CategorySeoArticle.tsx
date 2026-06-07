import Link from 'next/link';
import HomeSectionTitle from '@/components/HomeSectionTitle';
import { getCategorySeoArticle } from '@/lib/getCategorySeoArticle';

interface CategorySeoArticleProps {
  categorySlug: string;
  subcategorySlug: string;
  categoryTitle: string;
  subcategoryTitle: string;
}

export default function CategorySeoArticle({
  categorySlug,
  subcategorySlug,
  categoryTitle,
  subcategoryTitle,
}: CategorySeoArticleProps) {
  const article = getCategorySeoArticle({
    categorySlug,
    subcategorySlug,
    categoryTitle,
    subcategoryTitle,
  });

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="mt-10 mb-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 shadow-sm">
        <HomeSectionTitle
          title={article.title}
          subtitle={`Корисна інформація про ${subcategoryTitle.toLowerCase()}`}
        />

        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mt-4">
          {article.intro}
        </p>

        {article.sections.map((section) => (
          <div key={section.heading} className="mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {section.heading}
            </h3>
            {section.paragraphs.map((p) => (
              <p key={p} className="text-gray-600 text-sm leading-relaxed mb-2">
                {p}
              </p>
            ))}
            {section.list && section.list.length > 0 && (
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {article.faq.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Часті питання
            </h3>
            <dl className="space-y-4">
              {article.faq.map((item) => (
                <div key={item.question}>
                  <dt className="font-medium text-gray-900 text-sm sm:text-base">
                    {item.question}
                  </dt>
                  <dd className="text-gray-600 text-sm mt-1 leading-relaxed">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/delivery"
            className="text-green-600 hover:text-green-700 font-medium hover:underline"
          >
            Доставка і оплата
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            href="/returns"
            className="text-green-600 hover:text-green-700 font-medium hover:underline"
          >
            Повернення
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            href="/contacts"
            className="text-green-600 hover:text-green-700 font-medium hover:underline"
          >
            Контакти
          </Link>
        </div>
      </article>
    </section>
  );
}
