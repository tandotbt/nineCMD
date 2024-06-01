import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), VueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 1414
  },
  preview: {
    port: 2828
  },
  build: {
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari12'],
    minify: 'terser',
    terserOptions: {
      ecma: 5,
      ie8: true,
      safari10: true,
      toplevel: true
    }
  }
})
