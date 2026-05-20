import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8090'
const apiProxyRoutes = [
  '/inventories',
  '/items',
  '/categories',
  '/tags',
  '/users',
  '/uploads',
  '/signin-google',
  '/signin-github',
]
const apiProxyOptions = {
  target: apiProxyTarget,
  changeOrigin: true,
  secure: false,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: apiProxyTarget,
        changeOrigin: false,
        secure: false,
      },
      ...Object.fromEntries(apiProxyRoutes.map((route) => [route, apiProxyOptions])),
      '/hubs': {
        ...apiProxyOptions,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
