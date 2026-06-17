import { NextResponse } from 'next/server';
import { brands } from '@/data/brands';

function toAbsoluteUrl(path: string, origin: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  return NextResponse.json(
    brands.map(brand => ({
      id: brand.id,
      title: brand.title,
      handle: brand.handle,
      image: toAbsoluteUrl(brand.image, origin),
      imageFull: toAbsoluteUrl(brand.imageFull, origin),
      description: brand.description ?? [],
      products: brand.products ?? [],
    })),
  );
}
