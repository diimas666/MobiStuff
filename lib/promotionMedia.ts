export function getPublicBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://mobistuff.shop');

  return base.replace(/\/$/, '');
}

export function getPromotionMediaUrl(assetId: string): string {
  return `${getPublicBaseUrl()}/api/promotions/media/${assetId}`;
}

type PromotionImageSource = {
  imageUrl?: string | null;
  imageAssetId?: { toString(): string } | string | null;
};

function asPromotionImageSource(item: unknown): PromotionImageSource | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  return item as PromotionImageSource;
}

export function getPromotionImageAssetId(item: unknown): string | null {
  const promotion = asPromotionImageSource(item);
  if (!promotion?.imageAssetId) {
    return null;
  }

  return typeof promotion.imageAssetId === 'string'
    ? promotion.imageAssetId
    : promotion.imageAssetId.toString();
}

export function resolvePromotionImageUrl(item: unknown): string | undefined {
  const promotion = asPromotionImageSource(item);
  if (!promotion) {
    return undefined;
  }

  if (promotion.imageAssetId) {
    const id =
      typeof promotion.imageAssetId === 'string'
        ? promotion.imageAssetId
        : promotion.imageAssetId.toString();
    return getPromotionMediaUrl(id);
  }

  const external = promotion.imageUrl?.trim();
  return external || undefined;
}
