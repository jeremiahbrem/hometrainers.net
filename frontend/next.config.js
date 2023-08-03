/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API: process.env.NODE_ENV === 'production'
      ? 'http://docker.host.internal:8080'
      : 'http://localhost:8080'
  },
}

module.exports = nextConfig
