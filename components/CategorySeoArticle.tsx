import { jsonLd } from '@/lib/jsonLd';
import Link from 'next/link';
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
    <section className="mt-20 grid gap-10 border-t border-line-soft pt-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqJsonLd)} />

      <article className="max-w-[68ch]">
        <h2 className="display-md">{article.title}</h2>
        <p className="mt-5 text-[16px] leading-relaxed text-ink-2">{article.intro}</p>

        {article.sections.map((section) => (
          <div key={section.heading} className="mt-8">
            <h3 className="mb-2 text-lg font-semibold tracking-tight">{section.heading}</h3>
            {section.paragraphs.map((p) => (
              <p key={p} className="mb-3 text-[15px] leading-relaxed text-ink-2">
                {p}
              </p>
            ))}
            {section.list && section.list.length > 0 && (
              <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-ink-2 marker:text-ink-3">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </article>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        {article.faq.length > 0 && (
          <>
            <h3 className="mb-4 text-xl font-semibold tracking-tight">Часті питання</h3>
            <div className="divide-y divide-line-soft rounded-[22px] bg-white px-5">
              {article.faq.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-medium">
                    {item.question}
                    <span className="mt-0.5 text-lg leading-none text-ink-3 transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{item.answer}</p>
                </details>
              ))}
            </div>
          </>
        )}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/delivery" className="link-more">Доставка і оплата</Link>
          <Link href="/returns" className="link-more">Повернення</Link>
          <Link href="/contacts" className="link-more">Контакти</Link>
        </div>
      </aside>
    </section>
  );
}
