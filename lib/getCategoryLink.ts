// lib/getCategoryLink.ts
export function getCategoryLink(categorySlug: string, subcategorySlug: string) {
  return `/category/${categorySlug}/${subcategorySlug}`;
}


// Используй её везде — и в OffersSection, и в CategoryList, и в CategoryGrid.

