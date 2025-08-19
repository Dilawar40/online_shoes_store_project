import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
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
    ],
  },
};

export default nextConfig;
