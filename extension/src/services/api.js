/**
 * Service API pour communiquer avec le backend de scraping
 */

import { getBackendUrl } from '../stores/settings.js'

/**
 * Scrape une recette depuis une URL
 * @param {string} url - L'URL de la recette à scraper
 * @returns {Promise<Object>} Les données de la recette scrapée
 */
export async function scrapeRecipe(url) {
  const backendUrl = await getBackendUrl()

  const response = await fetch(`${backendUrl}/api/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erreur inconnue' }))
    throw new Error(error.detail || `Erreur HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Vérifie la santé du backend
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  const backendUrl = await getBackendUrl()

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
