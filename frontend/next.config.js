/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    api: "http://backend:8080"
  },
  publicRuntimeConfig: {
    api: "http://localhost:8080"
  }
}

module.exports = nextConfig
