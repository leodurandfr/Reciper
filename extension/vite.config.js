import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, cpSync, readFileSync, writeFileSync, readdirSync } from 'fs'

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

      // Copier detect-content-script.js (option « tous les sites »)
      copyFileSync(
        resolve(__dirname, 'detect-content-script.js'),
        resolve(distDir, 'detect-content-script.js')
      )

      // Copier supported-sites.js (généré par scripts/vendor-pyodide.mjs)
      copyFileSync(
        resolve(__dirname, 'vendor/supported-sites.js'),
        resolve(distDir, 'supported-sites.js')
      )

      // Copier i18n-lite.js
      copyFileSync(
        resolve(__dirname, 'i18n-lite.js'),
        resolve(distDir, 'i18n-lite.js')
      )

      // Copier le document offscreen (scraping Python via Pyodide)
      copyFileSync(
        resolve(__dirname, 'offscreen.html'),
        resolve(distDir, 'offscreen.html')
      )
      copyFileSync(
        resolve(__dirname, 'offscreen.js'),
        resolve(distDir, 'offscreen.js')
      )
      copyFileSync(
        resolve(__dirname, 'pyodide-worker.js'),
        resolve(distDir, 'pyodide-worker.js')
      )

      // Copier le runtime Pyodide et les wheels (préparés par scripts/vendor-pyodide.mjs)
      cpSync(resolve(__dirname, 'vendor/pyodide'), resolve(distDir, 'pyodide'), { recursive: true })

      // Copier le code Python et lister ses fichiers pour offscreen.js
      const pythonFiles = readdirSync(resolve(__dirname, 'python'), { recursive: true })
        .map((file) => file.split('\\').join('/'))
        .filter((file) => file.endsWith('.py'))
      for (const file of pythonFiles) {
        const target = resolve(distDir, 'python', file)
        mkdirSync(dirname(target), { recursive: true })
        copyFileSync(resolve(__dirname, 'python', file), target)
      }
      writeFileSync(resolve(distDir, 'python/files.json'), JSON.stringify(pythonFiles))

      // Copier le dossier icons
      const iconsDir = resolve(distDir, 'icons')
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true })
      }
      cpSync(resolve(__dirname, 'icons'), iconsDir, { recursive: true })

      // Copier le dossier _locales (i18n du manifest pour le Chrome Web Store)
      const localesDir = resolve(distDir, '_locales')
      if (!existsSync(localesDir)) {
        mkdirSync(localesDir, { recursive: true })
      }
      cpSync(resolve(__dirname, '_locales'), localesDir, { recursive: true })

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
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
