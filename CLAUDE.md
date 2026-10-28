# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Reciper** is a Chrome Extension (Manifest V3, Vue.js frontend, local storage) that scrapes and manages recipes. Everything runs client-side: there is no server.

Recipes are scraped from 700+ supported websites with the Python `recipe-scrapers` library, run inside the extension through **Pyodide** (Python compiled to WebAssembly).

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
  - `services/db.js` - Recipe storage for the app: adapter over `recipe-store.js`, with a `localStorage` fallback for `npm run dev` outside the extension
  - `services/share.js` - Builds share links (recipe compressed with deflate-raw + base64url in the URL fragment)
  - `assets/ingredients/` - Ingredient illustrations, named by `image_id`
  - `stores/settings.js` - User settings (theme, language)
- `service-worker.js` - Detects recipe sites, fetches the page HTML, sends it to the offscreen document. On bbc.co.uk, bbc.com and theguardian.com only `/food/` pages are intercepted (`SUPPORTED_SITE_PATHS`). Optional "scrape any site" setting (`scrapeAnySite`): registers `detect-content-script.js` on all other sites, which reports pages declaring a schema.org Recipe
- `detect-content-script.js` - Only with `scrapeAnySite`: sends the HTML of pages that look like recipes to the service worker
- `offscreen.html/js` - Hosts the Pyodide Web Worker and relays scrape requests from the service worker
- `pyodide-worker.js` - Loads Pyodide once and runs `reciper.scraper.scrape_recipe_json(html, url)`. Must stay in a worker: extension pages share the offscreen document's thread, so running Pyodide there freezes the UI
- `python/` - Python code run in Pyodide
  - `reciper/scraper.py` - Scraping with `recipe-scrapers` (dedicated scraper for supported sites, generic schema.org scraper otherwise), returns the recipe dict
  - `reciper/ingredient_image_matcher.py`, `language_detection.py`, `data/translations/` - Ingredient → image_id matching (FR/EN)
  - `jstyleson.py` - Vendored extruct dependency (sdist-only on PyPI, so no wheel for Pyodide)
- `scripts/vendor-pyodide.mjs` - Copies Pyodide core, downloads pinned wheels (sha256-checked, cached in `vendor/wheels-cache/`) and adds precompiled bytecode to them (compiled by Pyodide in Node) into `vendor/pyodide/` (all gitignored). The bytecode halves cold-start import time. Also generates `vendor/supported-sites.js` from `recipe_scrapers.SCRAPERS`, so the supported-site list always matches the bundled version. To upgrade recipe-scrapers, update its URL/hash there.
- `recipe-store.js` - Single recipe storage implementation on `chrome.storage.local` (`recipes_index` + `recipe_<id>` keys), shared by the service worker and `src/services/db.js`; plain module with no imports, copied to `dist/`
- `i18n-lite.js` - Minimal translations for the service worker (no vue-i18n there); also provides `detectBrowserLocale`, re-exported to the app by `src/i18n/detect.js`
- `overlay-content-script.js` - Injected at `document_start` on supported sites: plain beige mask (no text) hiding the page while the service worker checks it; removed if the page is not a recipe (5 s safety timeout)
- `manifest.json` - Chrome extension manifest (v3); CSP needs `'wasm-unsafe-eval'` for Pyodide. Host access is limited to `http://*/*` and `https://*/*` (no `tabs` permission)
- `_locales/` - Extension name/description for the Chrome Web Store (en, es, fr, pt_BR, pt_PT)
- `dist/` - Built extension (load this in Chrome)

### Docs / GitHub Pages (`docs/`, served at https://leodurandfr.github.io/Reciper/)
- `index.md` - Privacy policy (Chrome Web Store)
- `share/index.html` + `share/share-page.js` - Static share page: decodes the recipe from the URL fragment (untrusted input: validated, rendered with `textContent`, strict CSP so no inline script). Keep its format in sync with `src/services/share.js`

### User Flow
1. User navigates to a supported recipe site (Marmiton, 750g, etc.); the overlay masks the page
2. The service worker fetches the page and checks it declares a schema.org Recipe (otherwise it removes the overlay and the site shows normally)
3. The tab is redirected to Reciper's loading view (`index.html#/loading?url=…`)
4. The recipe is scraped locally (Pyodide), saved, and shown in the recipe view

With `scrapeAnySite`, other sites skip the overlay: `detect-content-script.js` reports recipe pages once loaded, then steps 3-4 apply.

## Key Dependencies

- Vue 3 with Vue Router, vue-i18n
- Pyodide (pinned in `package.json`; Python packages pinned in `scripts/vendor-pyodide.mjs`)
- `recipe-scrapers` 15.x and its dependencies (extruct, lxml, beautifulsoup4, …)
