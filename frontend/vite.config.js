import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 6391,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4827',
        changeOrigin: true,
      },
    },
  },
})
