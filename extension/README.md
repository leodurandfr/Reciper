# Extension Chrome - Reciper

Extension Chrome qui detecte automatiquement les pages de recettes et les sauvegarde dans votre collection Reciper.

## Fonctionnement

1. Vous ouvrez une page d'un site de recette supporte (Marmiton, 750g, etc.)
2. L'extension recupere le HTML de la page et l'analyse localement avec `recipe-scrapers` (Python, execute via Pyodide dans un document offscreen)
3. La recette est sauvegardee dans le navigateur (`chrome.storage.local`)
4. Vous etes redirige vers Reciper pour voir la recette

Aucun serveur : tout se passe dans le navigateur.

## Installation

```bash
npm install
npm run build   # telecharge Pyodide + wheels dans vendor/ (1re fois), puis build dans dist/
```

1. Ouvrir Chrome et aller sur `chrome://extensions/`
2. Activer le **Mode developpeur** (en haut a droite)
3. Cliquer sur **Charger l'extension non empaquetee**
4. Selectionner le dossier `extension/dist/`

## Sites supportes

L'extension supporte **700+ sites de recettes** (tous ceux de recipe-scrapers), dont :
- marmiton.org
- 750g.com
- cuisineaz.com
- allrecipes.com
- bbcgoodfood.com
- Et 700+ autres...

La liste est generee au build depuis `recipe_scrapers.SCRAPERS` (`vendor/supported-sites.js`, voir `scripts/vendor-pyodide.mjs`) : elle suit toujours la version de recipe-scrapers embarquee.

Option **Recuperer les recettes sur tous les sites** (Parametres, desactivee par defaut) : sur les autres sites, `detect-content-script.js` signale les pages qui declarent une recette schema.org, et recipe-scrapers les lit en mode generique.

## Debug

Pour voir les logs de l'extension :
1. Aller sur `chrome://extensions/`
2. Cliquer sur "Details" de Reciper
3. "Inspecter les vues" : `service worker` (detection, fetch) ou `offscreen.html` (Pyodide / scraping)

## Structure

```
extension/
├── manifest.json              # Configuration de l'extension
├── service-worker.js          # Detection des recettes, fetch du HTML
├── offscreen.html / .js       # Pyodide + recipe-scrapers
├── python/                    # Code Python execute dans Pyodide (scraper, images d'ingredients)
├── scripts/vendor-pyodide.mjs # Prepare vendor/pyodide/ (Pyodide + wheels figees)
├── supported-sites.js         # Liste des domaines supportes
├── src/                       # App Vue.js
└── icons/                     # Icones de l'extension
```
