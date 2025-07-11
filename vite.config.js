import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    // Fallback para SPA: cualquier ruta devuelve index.html
    fs: {
      allow: ['.']
    },
    middlewareMode: false,
    historyApiFallback: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  // Handle SPA routing
  preview: {
    port: 5173
  }
}) 