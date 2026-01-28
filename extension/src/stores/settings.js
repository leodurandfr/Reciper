/**
 * Gestion des paramètres de l'extension
 * Stockés dans chrome.storage.local (ou localStorage pour dev)
 */

const DEFAULT_BACKEND_URL = 'https://api-reciper.leodurand.com'
const SETTINGS_KEY = 'settings'

const defaultSettings = {
  backendUrl: DEFAULT_BACKEND_URL,
  autoSaveImages: false, // Télécharger et sauver les images localement
  theme: 'system', // 'light', 'dark', 'system'
  autoOpenRecipe: false, // Ouvrir automatiquement la recette après scraping
}

/**
 * Récupère tous les paramètres
 * @returns {Promise<Object>}
 */
export async function getSettings() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(SETTINGS_KEY)
      return { ...defaultSettings, ...result[SETTINGS_KEY] }
    } else {
      const stored = localStorage.getItem(SETTINGS_KEY)
      return { ...defaultSettings, ...(stored ? JSON.parse(stored) : {}) }
    }
  } catch {
    return defaultSettings
  }
}

/**
 * Sauvegarde les paramètres
 * @param {Object} settings - Les paramètres à sauvegarder
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
  const currentSettings = await getSettings()
  const newSettings = { ...currentSettings, ...settings }

  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [SETTINGS_KEY]: newSettings })
    } else {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    }
  } catch (error) {
    console.error('Erreur sauvegarde paramètres:', error)
    throw error
  }
}

/**
 * Récupère l'URL du backend
 * @returns {Promise<string>}
 */
export async function getBackendUrl() {
  const settings = await getSettings()
  return settings.backendUrl
}

/**
 * Modifie l'URL du backend
 * @param {string} url - La nouvelle URL
 * @returns {Promise<void>}
 */
export async function setBackendUrl(url) {
  await saveSettings({ backendUrl: url })
}

/**
 * Teste la connexion au backend
 * @param {string} url - L'URL à tester (optionnel, utilise l'URL configurée sinon)
 * @returns {Promise<boolean>}
 */
export async function testBackendConnection(url = null) {
  const backendUrl = url || (await getBackendUrl())

  try {
    const response = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Réinitialise les paramètres par défaut
 * @returns {Promise<void>}
 */
export async function resetSettings() {
  await saveSettings(defaultSettings)
}

/**
 * Récupère le thème configuré
 * @returns {Promise<string>}
 */
export async function getTheme() {
  const settings = await getSettings()
  return settings.theme
}

/**
 * Modifie le thème
 * @param {'light'|'dark'|'system'} theme
 * @returns {Promise<void>}
 */
export async function setTheme(theme) {
  await saveSettings({ theme })
}

/**
 * Applique le thème au document
 * @param {string} theme - Le thème à appliquer
 */
export function applyTheme(theme) {
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

/**
 * Initialise le thème au chargement
 */
export async function initTheme() {
  const theme = await getTheme()
  applyTheme(theme)

  // Écouter les changements de préférence système
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
    const currentTheme = await getTheme()
    if (currentTheme === 'system') {
      applyTheme('system')
    }
  })
}
