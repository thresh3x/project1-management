import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http:localhost:3000/',
        changeOrigin:true,
        rewrite: path => path.replace(/^\/api/, ''),
      }
    }
  },
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': path.resolve("./src")
    }
  },
})
