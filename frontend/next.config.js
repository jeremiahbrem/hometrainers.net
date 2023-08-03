/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    api: 'http://api:8080'
  }
}

module.exports = nextConfig
