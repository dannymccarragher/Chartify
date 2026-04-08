import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "172.20.240.1",
  ],
    async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://chartify-786g.onrender.com/:path*'
      }
    ];
  }
};

export default nextConfig;