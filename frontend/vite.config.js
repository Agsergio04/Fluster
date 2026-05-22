import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))
            return 'vendor-react'
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/'))
            return 'vendor-router'
          if (id.includes('node_modules/axios/'))
            return 'vendor-http'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    globals: true,
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
  },
})
