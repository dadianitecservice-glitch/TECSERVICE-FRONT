import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    manifest: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4173',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), {
    name: 'prevent-preview-indexing',
    configureServer(server) {
      server.middlewares.use((_request, response, next) => {
        response.setHeader('X-Robots-Tag', 'noindex, nofollow')
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((_request, response, next) => {
        response.setHeader('X-Robots-Tag', 'noindex, nofollow')
        next()
      })
    },
  }],
})
