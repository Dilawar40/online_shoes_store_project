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
      {
        protocol: 'https',
        hostname: 'jootishooti.com',
        port: '',
        pathname: '/**',
      },
      // Supabase Storage public bucket
      {
        protocol: 'https',
        hostname: 'xjeqbabofibvugvzoyph.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
