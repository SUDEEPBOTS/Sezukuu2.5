/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    optimizePackageImports: ["axios"],
  },
};

export default nextConfig;
