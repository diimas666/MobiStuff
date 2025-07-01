import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mma.in.ua',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
// images: {
//     domains: ['cdn.shopify.com'],
//   },
