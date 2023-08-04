/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    api: 'http://api:8080'
  },
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig
