import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['cdn.shopify.com'], // ✅ правильно вложено
  },
};

export default nextConfig;
