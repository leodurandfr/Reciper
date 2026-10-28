/**
 * Service d'export/import de recettes
 * Permet de sauvegarder et restaurer les recettes au format JSON
 */

import { exportRecipes, importRecipes } from './db.js'
import i18n from '../i18n/index.js'

const t = i18n.global.t

const EXPORT_VERSION = '2.0'

/**
 * Exporte toutes les recettes dans un fichier JSON téléchargeable
 */
export async function downloadRecipesExport() {
  const recipes = await exportRecipes()

  const exportData = {
    version: EXPORT_VERSION,
    exportDate: new Date().toISOString(),
    recipeCount: recipes.length,
    recipes,
  }

  const json = JSON.stringify(exportData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  // Créer le lien de téléchargement
  const link = document.createElement('a')
  link.href = url
  link.download = `recettes-export-${formatDate(new Date())}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Libérer l'URL
  URL.revokeObjectURL(url)

  return { success: true, count: recipes.length }
}

const TIME_FIELDS = ['prep_time', 'cook_time', 'total_time']

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

function stringList(value) {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
}

/**
 * Valide une entrée de sauvegarde et n'en garde que les champs connus d'une recette.
 * @returns {Object|null} La recette nettoyée, ou null si l'entrée est inutilisable
 */
function sanitizeRecipe(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null

  const ingredients = stringList(entry.ingredients)
  const instructions = stringList(entry.instructions)
  if (ingredients.length === 0 && instructions.length === 0) return null

  const recipe = {
    url: isHttpUrl(entry.url) ? entry.url : null,
    title: typeof entry.title === 'string' ? entry.title : '',
    image_url: isHttpUrl(entry.image_url) ? entry.image_url : null,
    ingredients,
    enriched_ingredients: Array.isArray(entry.enriched_ingredients)
      ? entry.enriched_ingredients
        .filter(item => item && typeof item.text === 'string')
        .map(item => ({ text: item.text, image_id: typeof item.image_id === 'string' ? item.image_id : null }))
      : [],
    instructions,
    yields: typeof entry.yields === 'string' ? entry.yields : (Number.isFinite(entry.yields) ? String(entry.yields) : null),
    host: typeof entry.host === 'string' ? entry.host : null,
    is_favorite: entry.is_favorite === true,
  }
  for (const field of TIME_FIELDS) {
    recipe[field] = Number.isFinite(entry[field]) && entry[field] > 0 ? entry[field] : null
  }
  if (typeof entry.created_at === 'string' && !Number.isNaN(Date.parse(entry.created_at))) {
    recipe.created_at = entry.created_at
  }
  return recipe
}

/**
 * Importe des recettes depuis un fichier JSON
 * @param {File} file - Le fichier JSON à importer
 * @param {Object} options - Options d'import
 * @param {boolean} options.overwrite - Écraser les recettes existantes
 * @returns {Promise<{imported: number, skipped: number, invalid: number, version: string}>}
 *   invalid : entrées inutilisables, ignorées
 * @throws {Error} Fichier illisible ou au mauvais format, ou échec de l'écriture
 */
export async function importRecipesFromFile(file, options = {}) {
  const { overwrite = false } = options

  let data
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error(t('errors.invalidFormat'))
  }

  // Vérifier le format
  if (!data || !Array.isArray(data.recipes)) {
    throw new Error(t('errors.invalidExportFormat'))
  }

  const recipes = data.recipes.map(sanitizeRecipe).filter(Boolean)
  const result = await importRecipes(recipes, overwrite)

  return {
    ...result,
    invalid: data.recipes.length - recipes.length,
    version: data.version || 'unknown',
  }
}

/**
 * Lit un fichier et parse le JSON pour preview avant import
 * @param {File} file - Le fichier à lire
 * @returns {Promise<Object>} Les métadonnées du fichier
 */
export async function previewImportFile(file) {
  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!data || !Array.isArray(data.recipes)) {
      throw new Error(t('errors.invalidFormat'))
    }

    return {
      valid: true,
      version: data.version || 'unknown',
      exportDate: data.exportDate || null,
      recipeCount: data.recipes.length,
      recipes: data.recipes.slice(0, 5).map(r => ({
        title: r?.title,
        host: r?.host,
      })),
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    }
  }
}

// Utilitaire pour formater la date
function formatDate(date) {
  return date.toISOString().split('T')[0]
}
