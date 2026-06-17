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

export function resolvePromotionImageUrl(item: {
  imageUrl?: string | null;
  imageAssetId?: { toString(): string } | string | null;
}): string | undefined {
  if (item.imageAssetId) {
    const id =
      typeof item.imageAssetId === 'string'
        ? item.imageAssetId
        : item.imageAssetId.toString();
    return getPromotionMediaUrl(id);
  }

  const external = item.imageUrl?.trim();
  return external || undefined;
}
