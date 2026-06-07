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
      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 sm:p-8 shadow-sm">
        <HomeSectionTitle title="Каталог" subtitle="Усі категорії товарів — оберіть потрібний розділ" />
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.slug} className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
            <HomeSectionTitle title={section.title} />
            <CategoryGrid items={section.items} variant="catalog" />
          </section>
        ))}
      </div>
    </div>
  );
}
