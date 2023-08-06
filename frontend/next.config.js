/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    api: process.env.API_URL,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleClientID: process.env.GOOGLE_CLIENT_ID,
  },
  experimental: {
    esmExternals: false
  },
}

module.exports = nextConfig
