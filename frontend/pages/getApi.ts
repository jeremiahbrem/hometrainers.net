import getConfig from 'next/config'
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
const api = serverRuntimeConfig.api || publicRuntimeConfig.api
export { api }