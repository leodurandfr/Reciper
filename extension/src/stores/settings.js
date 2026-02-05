/**
 * Gestion des paramètres de l'extension
 * Stockés dans chrome.storage.local (ou localStorage pour dev)
 */

import { reactive, watch } from 'vue'

export const BACKEND_URL = import.meta.env.DEV
  ? ''
  : 'https://reciper-api-605923399344.europe-west1.run.app'
const SETTINGS_KEY = 'settings'

const defaultSettings = {
  autoSaveImages: false, // Télécharger et sauver les images localement
  theme: 'light', // 'light', 'dark', 'system'
  language: 'fr', // 'fr', 'en'
}

// Reactive settings store for composable
let settingsStore = null

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
 * Récupère l'URL du backend (custom ou défaut)
 * @returns {Promise<string>}
 */
export async function getBackendUrl() {
  if (import.meta.env.DEV) return ''
  const settings = await getSettings()
  return settings.backendUrl || BACKEND_URL
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

/**
 * Composable Vue pour utiliser les paramètres de manière réactive
 * @returns {Object} - Objet réactif contenant les paramètres
 */
export function useSettings() {
  if (!settingsStore) {
    settingsStore = reactive({ ...defaultSettings })

    // Charger les paramètres au premier appel
    getSettings().then(settings => {
      Object.assign(settingsStore, settings)
    })

    // Écouter les changements dans chrome.storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[SETTINGS_KEY]) {
          Object.assign(settingsStore, changes[SETTINGS_KEY].newValue)
        }
      })
    }
  }

  return settingsStore
}
