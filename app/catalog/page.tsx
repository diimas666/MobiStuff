import type { Metadata } from "next";
import CategoryGrid from "@/components/CategoryGrid";
import Link from "next/link";
import { getCatalogSections } from "@/lib/getCatalogCategories";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Каталог товарів",
  description:
    "Повний каталог категорій MobiStuff: чохли, навушники, зарядки, павербанки, аксесуари та інше. Доставка по Україні.",
  alternates: { canonical: "/catalog" },
};

export default async function CatalogPage() {
  const sections = await getCatalogSections();

  return (
    <div className="pb-10">
      <header className="mb-8 sm:mb-10">
        <h1 className="display-lg">Каталог.</h1>
        <p className="lead mt-3 max-w-xl">Усі категорії аксесуарів. Оберіть розділ, щоб побачити товари.</p>
      </header>

      <nav aria-label="Розділи каталогу" className="no-scrollbar sticky top-[60px] sm:top-[64px] z-30 -mx-4 mb-10 flex gap-2 overflow-x-auto bg-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        {sections.map((section) => (
          <a key={section.slug} href={`#${section.slug}`} className="chip">
            {section.title}
          </a>
        ))}
      </nav>

      <div className="space-y-14 sm:space-y-20">
        {sections.map((section) => (
          <section key={section.slug} id={section.slug} className="scroll-mt-36">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="display-md">{section.title}</h2>
              {section.items[0] && (
                <Link href={`/category/${section.items[0].categorySlug}/${section.items[0].subcategorySlug}`} className="link-more shrink-0 text-[15px]">
                  Дивитися
                </Link>
              )}
            </div>
            <CategoryGrid items={section.items} variant="catalog" />
          </section>
        ))}
      </div>
    </div>
  );
}
