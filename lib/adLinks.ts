/** Генерація посилань з UTM-мітками для таргетованої реклами */
export const AD_SOURCES = [
  { id: 'instagram', label: 'Instagram', source: 'instagram', medium: 'paid_social' },
  { id: 'facebook', label: 'Facebook', source: 'facebook', medium: 'paid_social' },
  { id: 'tiktok', label: 'TikTok', source: 'tiktok', medium: 'paid_social' },
  { id: 'google', label: 'Google Ads', source: 'google', medium: 'cpc' },
  { id: 'telegram', label: 'Telegram', source: 'telegram', medium: 'social' },
  { id: 'blogger', label: 'Блогер / інфлюенсер', source: 'influencer', medium: 'referral' },
] as const;

export type AdSource = (typeof AD_SOURCES)[number]['id'];

export function slugifyCampaign(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яіїєґ_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function buildAdLink(
  origin: string,
  path: string,
  opts: { source: AdSource; campaign?: string; content?: string }
) {
  const src = AD_SOURCES.find((s) => s.id === opts.source) ?? AD_SOURCES[0];
  const url = new URL(path, origin);
  url.searchParams.set('utm_source', src.source);
  url.searchParams.set('utm_medium', src.medium);
  if (opts.campaign) url.searchParams.set('utm_campaign', slugifyCampaign(opts.campaign));
  if (opts.content) url.searchParams.set('utm_content', slugifyCampaign(opts.content));
  return url.toString();
}
