/**
 * Service API pour communiquer avec le backend de scraping
 */

import { getBackendUrl } from '../stores/settings.js'
import i18n from '../i18n/index.js'

const t = i18n.global.t

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
    const error = await response.json().catch(() => ({ detail: t('errors.unknown') }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Partage une recette et retourne l'URL de partage
 * @param {Object} recipe - Les données de la recette
 * @returns {Promise<{url: string}>}
 */
export async function shareRecipe(recipe) {
  const backendUrl = await getBackendUrl()
  const response = await fetch(`${backendUrl}/api/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: recipe.title,
      image_url: recipe.image_url,
      ingredients: recipe.ingredients,
      enriched_ingredients: recipe.enriched_ingredients || [],
      instructions: recipe.instructions,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      total_time: recipe.total_time,
      yields: recipe.yields,
      host: recipe.host,
      url: recipe.url,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: t('errors.unknown') }))
    throw new Error(error.detail || `HTTP ${response.status}`)
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
