# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Reciper** is a Chrome Extension (Manifest V3, Vue.js frontend, local storage) that scrapes and manages recipes. Everything runs client-side: there is no server.

Recipes are scraped from 600+ supported websites with the Python `recipe-scrapers` library, run inside the extension through **Pyodide** (Python compiled to WebAssembly).

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CHROME EXTENSION                             │
│  ┌──────────────┐  ┌────────────────────┐  ┌──────────────────────┐  │
│  │   Frontend   │  │   Service Worker   │  │  Offscreen document  │  │
│  │   (Vue.js)   │  │ detects recipe     │─▶│  Pyodide +           │  │
│  │              │  │ sites, fetches the │  │  recipe-scrapers +   │  │
│  │              │  │ page HTML          │◀─│  python/reciper/     │  │
│  └──────────────┘  └────────────────────┘  └──────────────────────┘  │
│                    chrome.storage.local (recipes)                     │
└──────────────────────────────────────────────────────────────────────┘
          │ Share: link to docs/share/ (GitHub Pages), recipe compressed in the URL #fragment
```

## Common Commands

### Extension (from `extension/` directory)
```bash
npm install           # Install dependencies (incl. pyodide)
npm run build         # Vendor Pyodide + wheels (scripts/vendor-pyodide.mjs), then build to dist/
npm run build:watch   # Build with watch mode
```

Load extension in Chrome: `chrome://extensions/` > Load unpacked > select `extension/dist/`

## Project Structure

### Extension (`extension/`)
- `src/` - Vue.js source code
  - `views/` - HomeView, RecipeView, LoadingView
  - `components/` - UI components
  - `services/db.js` - Recipe storage
  - `services/share.js` - Builds share links (recipe compressed with deflate-raw + base64url in the URL fragment)
  - `assets/ingredients/` - Ingredient illustrations, named by `image_id`
  - `stores/settings.js` - User settings (theme, language)
- `service-worker.js` - Detects recipe sites, fetches the page HTML, sends it to the offscreen document
- `offscreen.html/js` - Hosts the Pyodide Web Worker and relays scrape requests from the service worker
- `pyodide-worker.js` - Loads Pyodide once and runs `reciper.scraper.scrape_recipe_json(html, url)`. Must stay in a worker: extension pages share the offscreen document's thread, so running Pyodide there freezes the UI
- `python/` - Python code run in Pyodide
  - `reciper/scraper.py` - Scraping with `recipe-scrapers`, returns the recipe dict
  - `reciper/ingredient_image_matcher.py`, `language_detection.py`, `data/translations/` - Ingredient → image_id matching (FR/EN)
  - `jstyleson.py` - Vendored extruct dependency (sdist-only on PyPI, so no wheel for Pyodide)
- `scripts/vendor-pyodide.mjs` - Copies Pyodide core, downloads pinned wheels (sha256-checked, cached in `vendor/wheels-cache/`) and adds precompiled bytecode to them (compiled by Pyodide in Node) into `vendor/pyodide/` (all gitignored). The bytecode halves cold-start import time. To upgrade recipe-scrapers, update its URL/hash there.
- `overlay-content-script.js` - Notification overlay on recipe pages
- `manifest.json` - Chrome extension manifest (v3); CSP needs `'wasm-unsafe-eval'` for Pyodide
- `dist/` - Built extension (load this in Chrome)

### Docs / GitHub Pages (`docs/`, served at https://leodurandfr.github.io/Reciper/)
- `index.md` - Privacy policy (Chrome Web Store)
- `share/index.html` - Static share page: decodes the recipe from the URL fragment

### Backend (`backend/`) - legacy
Former FastAPI scraping API (Cloud Run). No longer used by the extension; kept for reference.

### User Flow
1. User navigates to a supported recipe site (Marmiton, 750g, etc.)
2. Notification overlay appears: "Récupération de la recette..."
3. The extension scrapes the recipe locally (Pyodide)
4. Notification shows "Prêt !" with link to view in Reciper

## Key Dependencies

- Vue 3 with Vue Router, vue-i18n
- Pyodide (pinned in `package.json`; Python packages pinned in `scripts/vendor-pyodide.mjs`)
- `recipe-scrapers` 15.x and its dependencies (extruct, lxml, beautifulsoup4, …)
