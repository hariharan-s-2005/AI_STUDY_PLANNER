/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;