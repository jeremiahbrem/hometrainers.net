/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    api: process.env.API_URL
  },
  experimental: {
    esmExternals: false
  },
}

module.exports = nextConfig
