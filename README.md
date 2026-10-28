# Reciper

Extension Chrome (Manifest V3) qui sauvegarde et organise vos recettes de cuisine. Tout se passe dans le navigateur : pas de compte, pas de serveur.

## Fonctionnalites

- Detection automatique des pages de recettes sur 700+ sites supportes (Marmiton, 750g, AllRecipes, BBC Good Food...)
- Option (desactivee par defaut) pour recuperer les recettes sur n'importe quel site qui declare une recette schema.org
- Bibliotheque de recettes stockee localement (`chrome.storage.local`)
- Detail d'une recette : ingredients illustres, etapes, temps, calcul des portions, edition
- Export / import des recettes
- Partage par lien : la recette est compressee dans le fragment de l'URL d'une page statique (rien n'est envoye a un serveur)

## Stack technique

- **Scraping** : [recipe-scrapers](https://github.com/hhursev/recipe-scrapers) (Python), execute dans l'extension via [Pyodide](https://pyodide.org/) (WebAssembly)
- **Interface** : Vue.js 3 / Vue Router / vue-i18n, build avec Vite
- **Extension** : Chrome Manifest V3 (service worker, document offscreen + Web Worker pour Pyodide)
- **Partage** : page statique `docs/share/` servie par GitHub Pages

## Installation

```bash
cd extension
npm install
npm run build   # prepare Pyodide + wheels dans vendor/, puis build dans dist/
```

1. Ouvrir `chrome://extensions/`
2. Activer le **Mode developpeur**
3. Cliquer sur **Charger l'extension non empaquetee**
4. Selectionner le dossier `extension/dist/`

## Utilisation

1. Ouvrir une recette sur un site supporte (ex: une recette Marmiton depuis Google)
2. L'extension analyse la page localement et ouvre la recette dans Reciper
3. La recette est sauvegardee dans votre bibliotheque ; le bouton de retour ramene au site d'origine

Si la page n'est pas une recette, le site s'affiche normalement.

## Documentation

- [`extension/README.md`](extension/README.md) : fonctionnement detaille, debug et structure de l'extension
- [`CLAUDE.md`](CLAUDE.md) : architecture et organisation du code
- [Politique de confidentialite](https://leodurandfr.github.io/Reciper/) (`docs/index.md`)
