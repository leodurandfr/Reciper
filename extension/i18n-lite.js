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
  es: {
    recipesStored: 'recetas guardadas',
    openMyRecipes: 'Abrir mis recetas',
    addThisPage: 'Agregar esta página',
    scraping: 'Extrayendo...',
    recipeAdded: '¡Receta agregada!',
    addError: 'Error al agregar la receta',
    error: 'Error',
    errorPrefix: 'Error: ',
    extensionLoaded: 'Reciper: Extensión cargada - 606 sitios compatibles',
  },
  pt: {
    recipesStored: 'receitas salvas',
    openMyRecipes: 'Abrir minhas receitas',
    addThisPage: 'Adicionar esta página',
    scraping: 'Extraindo...',
    recipeAdded: 'Receita adicionada!',
    addError: 'Erro ao adicionar a receita',
    error: 'Erro',
    errorPrefix: 'Erro: ',
    extensionLoaded: 'Reciper: Extensão carregada - 606 sites compatíveis',
  },
}

const SUPPORTED = ['en', 'fr', 'es', 'pt']
let currentLocale = 'en'

function detectBrowserLocale() {
  try {
    const raw = chrome.i18n?.getUILanguage?.() || 'en'
    const base = raw.toLowerCase().split('-')[0]
    return SUPPORTED.includes(base) ? base : 'en'
  } catch {
    return 'en'
  }
}

export async function initLocale() {
  try {
    const result = await chrome.storage.local.get('settings')
    currentLocale = result.settings?.language || detectBrowserLocale()
  } catch {
    currentLocale = detectBrowserLocale()
  }
}

export function t(key) {
  return messages[currentLocale]?.[key] || messages.en[key] || key
}
