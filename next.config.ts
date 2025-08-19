import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */

  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.0.230:3000',
  ],
  images: {
    domains: ['jootishooti.com', 'dazzlebysarah.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dazzlebysarah.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
