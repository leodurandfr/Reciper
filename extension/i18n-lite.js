/**
 * Lightweight i18n for non-Vue contexts (service-worker, popup).
 * Reads language setting from chrome.storage.local.
 */

const messages = {
  fr: {
    recipesStored: 'recettes sauvegardées',
    openMyRecipes: 'Ouvrir mes recettes',
    addThisPage: 'Ajouter cette page',
    scraping: 'Scraping en cours...',
    recipeAdded: 'Recette ajoutée !',
    addError: "Erreur lors de l'ajout",
    error: 'Erreur',
    errorPrefix: 'Erreur: ',
    extensionLoaded: 'Reciper: Extension chargée - 606 sites supportés',
  },
  en: {
    recipesStored: 'saved recipes',
    openMyRecipes: 'Open my recipes',
    addThisPage: 'Add this page',
    scraping: 'Scraping...',
    recipeAdded: 'Recipe added!',
    addError: 'Error adding recipe',
    error: 'Error',
    errorPrefix: 'Error: ',
    extensionLoaded: 'Reciper: Extension loaded - 606 supported sites',
  },
}

let currentLocale = 'fr'

export async function initLocale() {
  try {
    const result = await chrome.storage.local.get('settings')
    currentLocale = result.settings?.language || 'fr'
  } catch {
    currentLocale = 'fr'
  }
}

export function t(key) {
  return messages[currentLocale]?.[key] || messages.fr[key] || key
}
