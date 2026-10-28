/**
 * Lightweight i18n for non-Vue contexts (service worker).
 * Reads language setting from chrome.storage.local.
 * detectBrowserLocale is also used by the Vue app (src/i18n/detect.js).
 */

const messages = {
  fr: {
    error: 'Erreur',
    extensionLoaded: 'Reciper: Extension chargée - {count} sites supportés',
    untitledRecipe: 'Recette sans titre',
    fetchFailed: 'Impossible de récupérer la page',
    scrapeTimeout: "Délai dépassé lors de l'analyse de la recette",
    pythonLoadFailed: 'Échec du chargement de Python',
    noRecipeFound: 'Aucune recette trouvée sur cette page',
    scrapeFailed: 'Erreur lors de la récupération de la recette',
  },
  en: {
    error: 'Error',
    extensionLoaded: 'Reciper: Extension loaded - {count} supported sites',
    untitledRecipe: 'Untitled recipe',
    fetchFailed: 'Could not load the page',
    scrapeTimeout: 'Timed out while reading the recipe',
    pythonLoadFailed: 'Could not load Python',
    noRecipeFound: 'No recipe found on this page',
    scrapeFailed: 'Error while reading the recipe',
  },
  es: {
    error: 'Error',
    extensionLoaded: 'Reciper: Extensión cargada - {count} sitios compatibles',
    untitledRecipe: 'Receta sin título',
    fetchFailed: 'No se pudo cargar la página',
    scrapeTimeout: 'Tiempo agotado al leer la receta',
    pythonLoadFailed: 'No se pudo cargar Python',
    noRecipeFound: 'No se encontró ninguna receta en esta página',
    scrapeFailed: 'Error al leer la receta',
  },
  pt: {
    error: 'Erro',
    extensionLoaded: 'Reciper: Extensão carregada - {count} sites compatíveis',
    untitledRecipe: 'Receita sem título',
    fetchFailed: 'Não foi possível carregar a página',
    scrapeTimeout: 'Tempo esgotado ao ler a receita',
    pythonLoadFailed: 'Não foi possível carregar o Python',
    noRecipeFound: 'Nenhuma receita encontrada nesta página',
    scrapeFailed: 'Erro ao ler a receita',
  },
}

const SUPPORTED = ['en', 'fr', 'es', 'pt']
let currentLocale = 'en'

export function detectBrowserLocale() {
  let raw
  try {
    raw = chrome.i18n?.getUILanguage?.()
  } catch {
    // Hors extension (serveur de dev Vite) : pas d'API chrome
  }
  raw ||= globalThis.navigator?.language || 'en'
  const base = raw.toLowerCase().split('-')[0]
  return SUPPORTED.includes(base) ? base : 'en'
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
