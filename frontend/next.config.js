/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    api: process.env.NODE_ENV === 'production'
      ? 'httpsx://homepersonaltrainers.net/api'
      : 'http://localhost:8080'
  }
}

module.exports = nextConfig
