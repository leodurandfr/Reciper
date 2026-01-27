/**
 * Service d'export/import de recettes
 * Permet de sauvegarder et restaurer les recettes au format JSON
 */

import { exportRecipes, importRecipes, clearAllRecipes } from './db.js'

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

/**
 * Importe des recettes depuis un fichier JSON
 * @param {File} file - Le fichier JSON à importer
 * @param {Object} options - Options d'import
 * @param {boolean} options.overwrite - Écraser les recettes existantes
 * @param {boolean} options.clearFirst - Vider la base avant import
 * @returns {Promise<{imported: number, skipped: number, errors: string[]}>}
 */
export async function importRecipesFromFile(file, options = {}) {
  const { overwrite = false, clearFirst = false } = options
  const errors = []

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    // Vérifier le format
    if (!data.recipes || !Array.isArray(data.recipes)) {
      throw new Error('Format de fichier invalide: pas de tableau "recipes"')
    }

    // Vider la base si demandé
    if (clearFirst) {
      await clearAllRecipes()
    }

    // Importer les recettes
    const result = await importRecipes(data.recipes, overwrite)

    return {
      ...result,
      errors,
      version: data.version || 'unknown',
    }
  } catch (error) {
    errors.push(error.message)
    return {
      imported: 0,
      skipped: 0,
      errors,
    }
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

    if (!data.recipes || !Array.isArray(data.recipes)) {
      throw new Error('Format invalide')
    }

    return {
      valid: true,
      version: data.version || 'unknown',
      exportDate: data.exportDate || null,
      recipeCount: data.recipes.length,
      recipes: data.recipes.slice(0, 5).map(r => ({
        title: r.title,
        host: r.host,
      })),
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    }
  }
}

/**
 * Crée une sauvegarde automatique dans chrome.storage.local
 * Utile pour la récupération en cas de problème
 */
export async function createAutoBackup() {
  try {
    const recipes = await exportRecipes()

    const backup = {
      date: new Date().toISOString(),
      recipeCount: recipes.length,
      recipes,
    }

    // Stocker dans chrome.storage.local (limite 10MB avec unlimitedStorage)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ autoBackup: backup })
    } else {
      // Fallback localStorage pour dev
      localStorage.setItem('autoBackup', JSON.stringify(backup))
    }

    return { success: true, count: recipes.length }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde auto:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Restaure depuis une sauvegarde automatique
 * @returns {Promise<{restored: number}>}
 */
export async function restoreFromAutoBackup() {
  try {
    let backup

    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get('autoBackup')
      backup = result.autoBackup
    } else {
      const stored = localStorage.getItem('autoBackup')
      backup = stored ? JSON.parse(stored) : null
    }

    if (!backup || !backup.recipes) {
      throw new Error('Aucune sauvegarde trouvée')
    }

    const result = await importRecipes(backup.recipes, false)
    return result
  } catch (error) {
    throw new Error(`Restauration impossible: ${error.message}`)
  }
}

// Utilitaire pour formater la date
function formatDate(date) {
  return date.toISOString().split('T')[0]
}
