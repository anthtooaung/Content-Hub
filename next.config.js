/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['openai', '@google/generative-ai'],
  },
};

module.exports = nextConfig;
