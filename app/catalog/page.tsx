import type { Metadata } from "next";
import CategoryGrid from "@/components/CategoryGrid";
import HomeSectionTitle from "@/components/HomeSectionTitle";
import { getCatalogSections } from "@/lib/getCatalogCategories";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Каталог товарів | MobiStuff",
  description:
    "Повний каталог категорій MobiStuff: чохли, навушники, зарядки, павербанки, аксесуари та інше. Доставка по Україні.",
  alternates: { canonical: "/catalog" },
};

export default async function CatalogPage() {
  const sections = await getCatalogSections();

  return (
    <div className="pb-10">
      <div className="section-surface mb-8 p-5 sm:p-8">
        <HomeSectionTitle title="Каталог" subtitle="Усі категорії товарів — оберіть потрібний розділ" />
      </div>

      <div className="space-y-8">
        {sections.map((section, index) => (
          <section
            key={section.slug}
            className={`p-4 sm:p-6 ${index % 2 === 0 ? 'section-surface' : 'section-surface-alt'}`}
          >
            <HomeSectionTitle title={section.title} />
            <CategoryGrid items={section.items} variant="catalog" />
          </section>
        ))}
      </div>
    </div>
  );
}
