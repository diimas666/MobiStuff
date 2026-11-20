import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lightbulb } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductShelf from '@/components/ProductShelf';
import { blogPosts, getPost } from '@/data/blog';
import { findCards } from '@/lib/storefront';
import { safe } from '@/lib/safeData';
import { jsonLd } from '@/lib/jsonLd';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

export const revalidate = 3600;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.description, url: absoluteUrl(`/blog/${post.slug}`), publishedTime: post.date },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const products = await safe(
    findCards({ categorySlug: post.shop.categorySlug, subcategorySlug: post.shop.subcategorySlug, inStock: { $ne: false } }, { limit: 10, sort: { isTrending: -1, createdAt: -1 } }),
    [],
    'blog products'
  );
  const shopHref = `/category/${post.shop.categorySlug}/${post.shop.subcategorySlug}`;

  return (
    <article className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { '@type': 'Organization', name: SITE_NAME },
          publisher: { '@type': 'Organization', name: SITE_NAME },
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
        })}
      />
      <Breadcrumbs items={[{ label: 'Головна', href: '/' }, { label: 'Поради', href: '/blog' }, { label: post.title }]} />
      <div className="mx-auto max-w-[680px]">
        <p className="text-[14px] text-ink-3">{post.readMinutes} хв читання</p>
        <h1 className="mt-2 text-[34px] leading-[1.12] font-semibold tracking-[-0.025em] sm:text-[44px]">{post.title}</h1>
        <p className="lead mt-4">{post.description}</p>
        <div className="mt-8 space-y-5 text-[17px] leading-[1.65]">
          {post.blocks.map((b, i) =>
            b.type === 'h2' ? (
              <h2 key={i} className="pt-4 text-[24px] leading-tight font-semibold tracking-tight">{b.text}</h2>
            ) : b.type === 'list' ? (
              <ul key={i} className="list-disc space-y-1.5 pl-6">
                {b.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            ) : b.type === 'tip' ? (
              <p key={i} className="flex gap-3 rounded-2xl bg-accent-soft px-4 py-3 text-[16px]">
                <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-accent" />
                {b.text}
              </p>
            ) : (
              <p key={i} className="text-ink-2">{b.text}</p>
            )
          )}
        </div>
        <Link href={shopHref} className="btn-primary btn-lg mt-10">Дивитися: {post.shop.label}</Link>
      </div>

      {products.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-[26px] font-semibold tracking-tight">{post.shop.label} у наявності</h2>
          <ProductShelf products={products} />
        </section>
      )}
    </article>
  );
}
