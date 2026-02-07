import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, cpSync, readFileSync, writeFileSync } from 'fs'

// Plugin pour copier les fichiers de l'extension et nettoyer le HTML
function extensionPlugin() {
  return {
    name: 'extension-plugin',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')

      // Nettoyer index.html - supprimer les attributs crossorigin
      const indexPath = resolve(distDir, 'index.html')
      let html = readFileSync(indexPath, 'utf-8')
      html = html.replace(/ crossorigin/g, '')
      writeFileSync(indexPath, html)

      // Copier manifest.json
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(distDir, 'manifest.json')
      )

      // Copier service-worker.js
      copyFileSync(
        resolve(__dirname, 'service-worker.js'),
        resolve(distDir, 'service-worker.js')
      )

      // Copier overlay-content-script.js
      copyFileSync(
        resolve(__dirname, 'overlay-content-script.js'),
        resolve(distDir, 'overlay-content-script.js')
      )

      // Copier supported-sites.js
      copyFileSync(
        resolve(__dirname, 'supported-sites.js'),
        resolve(distDir, 'supported-sites.js')
      )

      // Copier i18n-lite.js
      copyFileSync(
        resolve(__dirname, 'i18n-lite.js'),
        resolve(distDir, 'i18n-lite.js')
      )

      // Copier popup.html et popup.js
      copyFileSync(
        resolve(__dirname, 'popup.html'),
        resolve(distDir, 'popup.html')
      )
      copyFileSync(
        resolve(__dirname, 'popup.js'),
        resolve(distDir, 'popup.js')
      )

      // Copier le dossier icons
      const iconsDir = resolve(distDir, 'icons')
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true })
      }
      cpSync(resolve(__dirname, 'icons'), iconsDir, { recursive: true })

      console.log('Extension files copied to dist/')
    }
  }
}

export default defineConfig({
  plugins: [vue(), extensionPlugin()],

  // Base relative pour les assets dans l'extension
  base: './',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // Désactiver le polyfill modulepreload pour les extensions Chrome
    modulePreload: {
      polyfill: false,
    },

    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  // Dev server pour test hors extension
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
