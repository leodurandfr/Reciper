# Extension Chrome - RecettesScrapper

Extension Chrome qui intercepte automatiquement les clics sur les liens de recettes et les sauvegarde dans votre application RecettesScrapper locale.

## Fonctionnement

1. Vous cliquez sur un lien vers un site de recette supporte (Marmiton, 750g, etc.)
2. L'extension detecte le site et envoie l'URL au backend local
3. La recette est scrapee et sauvegardee automatiquement
4. Vous etes redirige vers l'app locale pour voir la recette

**Fallback** : Si le backend n'est pas lance, le site original s'ouvre normalement.

## Installation

### Prerequis
- Le backend par défaut est `https://api-reciper.leodurand.com`
- Modifiable dans les paramètres de l'extension

### Installation de l'extension

1. Ouvrir Chrome et aller sur `chrome://extensions/`
2. Activer le **Mode developpeur** (en haut a droite)
3. Cliquer sur **Charger l'extension non empaquetee**
4. Selectionner ce dossier (`extension/`)

## Sites supportes

L'extension supporte **606 sites de recettes**, dont :
- marmiton.org
- 750g.com
- cuisineaz.com
- allrecipes.com
- bbcgoodfood.com
- Et 600+ autres...

La liste complete est dans `supported-sites.js`.

## Debug

Pour voir les logs de l'extension :
1. Aller sur `chrome://extensions/`
2. Cliquer sur "Details" de RecettesScrapper
3. Cliquer sur "service worker" pour ouvrir la console

## Structure

```
extension/
├── manifest.json        # Configuration de l'extension
├── background.js        # Service Worker (logique principale)
├── supported-sites.js   # Liste des 606 domaines supportes
├── icons/               # Icones de l'extension
└── README.md
```
