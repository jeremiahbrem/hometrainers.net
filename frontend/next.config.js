/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API: process.env.NODE_ENV === 'production'
      ? 'http://backend:8080/api'
      : 'http://localhost:8080/api'
  },
}

module.exports = nextConfig
