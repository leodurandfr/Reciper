/**
 * Gestion des paramètres de l'extension
 * Stockés dans chrome.storage.local (ou localStorage pour dev)
 */

import { detectBrowserLocale } from '../i18n/detect.js'

const SETTINGS_KEY = 'settings'

const defaultSettings = {
  theme: 'light', // 'light', 'dark', 'system'
  language: null, // null = auto (suit le navigateur), sinon 'fr' | 'en' | 'es' | 'pt'
  scrapeAnySite: false, // Récupérer les recettes (schema.org) aussi sur les sites non supportés par recipe-scrapers
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
 * Récupère la langue effective : valeur explicite de l'utilisateur, ou langue détectée du navigateur.
 * @returns {Promise<string>}
 */
export async function getEffectiveLanguage() {
  const settings = await getSettings()
  return settings.language || detectBrowserLocale()
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
  // Relu par theme-boot.js au prochain chargement, avant le premier affichage
  try {
    localStorage.setItem('reciper-theme', theme)
  } catch {}
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
