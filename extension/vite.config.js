import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, cpSync, readFileSync, writeFileSync, readdirSync, renameSync, rmSync } from 'fs'

// Fichiers de l'extension hors du graphe Vite, copiés tels quels dans dist/ : [source, destination]
const EXTENSION_FILES = [
  ['manifest.json', 'manifest.json'],
  ['service-worker.js', 'service-worker.js'],
  ['recipe-store.js', 'recipe-store.js'], // Stockage des recettes (service worker + app)
  ['overlay-content-script.js', 'overlay-content-script.js'],
  ['detect-content-script.js', 'detect-content-script.js'], // Option « tous les sites »
  ['i18n-lite.js', 'i18n-lite.js'],
  ['theme-boot.js', 'theme-boot.js'], // Thème appliqué avant le premier affichage (index.html)
  // Document offscreen (scraping Python via Pyodide)
  ['offscreen.html', 'offscreen.html'],
  ['offscreen.js', 'offscreen.js'],
  ['pyodide-worker.js', 'pyodide-worker.js'],
  // Généré par scripts/vendor-pyodide.mjs
  ['vendor/supported-sites.js', 'supported-sites.js'],
]
// Dossiers copiés en entier (icônes, i18n du manifest pour le Chrome Web Store)
const EXTENSION_DIRS = ['icons', '_locales']

// Fichiers .py de python/, chemins relatifs avec des « / »
function listPythonFiles() {
  return readdirSync(resolve(__dirname, 'python'), { recursive: true })
    .map((file) => file.split('\\').join('/'))
    .filter((file) => file.endsWith('.py'))
}

// Plugin pour copier les fichiers de l'extension et nettoyer le HTML
function extensionPlugin() {
  const distPyodide = resolve(__dirname, 'dist/pyodide')
  // Copie de dist/pyodide mise de côté pendant un rebuild de build:watch (vendor/ est ignoré par git)
  const keptPyodide = resolve(__dirname, 'vendor/.pyodide-dist')
  // Pyodide (~21 Mo) déjà copié par ce processus : vendor/pyodide ne change qu'au prebuild
  let pyodideCopied = false

  return {
    name: 'extension-plugin',
    buildStart() {
      // En build:watch, recopier aussi quand ces fichiers changent
      for (const [source] of EXTENSION_FILES) this.addWatchFile(resolve(__dirname, source))
      for (const file of listPythonFiles()) this.addWatchFile(resolve(__dirname, 'python', file))

      // emptyOutDir vide dist/ à chaque rebuild : mettre Pyodide de côté pour ne pas le recopier
      // (une copie laissée par un rebuild en échec reste réutilisable ; pas celle d'un autre processus)
      if (!pyodideCopied) {
        rmSync(keptPyodide, { recursive: true, force: true })
      } else if (existsSync(distPyodide)) {
        rmSync(keptPyodide, { recursive: true, force: true })
        renameSync(distPyodide, keptPyodide)
      }
    },
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')

      // Nettoyer index.html - supprimer les attributs crossorigin
      const indexPath = resolve(distDir, 'index.html')
      let html = readFileSync(indexPath, 'utf-8')
      html = html.replace(/ crossorigin/g, '')
      writeFileSync(indexPath, html)

      for (const [source, target] of EXTENSION_FILES) {
        copyFileSync(resolve(__dirname, source), resolve(distDir, target))
      }
      for (const dir of EXTENSION_DIRS) {
        cpSync(resolve(__dirname, dir), resolve(distDir, dir), { recursive: true })
      }

      // Runtime Pyodide et wheels (préparés par scripts/vendor-pyodide.mjs)
      if (existsSync(keptPyodide)) {
        renameSync(keptPyodide, distPyodide)
      } else {
        cpSync(resolve(__dirname, 'vendor/pyodide'), distPyodide, { recursive: true })
        pyodideCopied = true
      }

      // Copier le code Python et lister ses fichiers pour offscreen.js
      const pythonFiles = listPythonFiles()
      for (const file of pythonFiles) {
        const target = resolve(distDir, 'python', file)
        mkdirSync(dirname(target), { recursive: true })
        copyFileSync(resolve(__dirname, 'python', file), target)
      }
      writeFileSync(resolve(distDir, 'python/files.json'), JSON.stringify(pythonFiles))

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
