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

module.exports = nextConfig;  // ❗ CommonJS export (Correct for Vercel)
