import Image, { ImageProps } from 'next/image';

const EXTERNAL_HOSTS = ['cdn.mma.ua', 'mma.in.ua'];

export function isExternalProductImage(src: string) {
  try {
    return EXTERNAL_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

/** Внешние фото MMA грузим напрямую — next/image proxy даёт timeout на cdn.mma.ua */
export default function ProductImage({ src, ...props }: ImageProps) {
  const srcStr = typeof src === 'string' ? src : '';
  return (
    <Image
      src={src}
      unoptimized={isExternalProductImage(srcStr)}
      {...props}
    />
  );
}
