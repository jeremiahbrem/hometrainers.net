/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    api: process.env.NODE_ENV === 'production'
      ? 'http://backend:8080'
      : 'http://localhost:8080'
  },
  experimental: {
    esmExternals: false,
  }
}

module.exports = nextConfig
