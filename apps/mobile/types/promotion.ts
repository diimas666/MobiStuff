export type PromotionLinkType = 'category' | 'on_sale';

export type PromoBanner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  color: string;
  emoji: string;
  imageUrl?: string;
  linkType: PromotionLinkType;
  categorySlug: string;
  categoryTitle: string;
  subcategorySlug?: string;
  subcategoryTitle?: string;
  sortOrder?: number;
};
