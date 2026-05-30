import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'

// Plugin to redirect index.html → index-ts.html in dev mode
// This prevents Vite from processing the JS version's index.html
function tsEntryPointPlugin() {
  return {
    name: 'ts-entry-point',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          req.url = '/index-ts.html'
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), tsEntryPointPlugin(), VueDevTools()],
  build: {
    rollupOptions: {
      input: 'index-ts.html'
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src-ts', import.meta.url))
    }
  },
  server: {
    port: 1415
  },
  preview: {
    port: 2829
  }
})
