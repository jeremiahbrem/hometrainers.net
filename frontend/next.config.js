/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    api: process.env.NEXT_PUBLIC_API_URL,
    googleClientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    googleClientID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },
  experimental: {
    esmExternals: false
  },
}

module.exports = nextConfig
