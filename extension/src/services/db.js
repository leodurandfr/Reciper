/**
 * Service de stockage des recettes avec chrome.storage.local
 * Persiste meme quand l'utilisateur vide le cache/cookies du navigateur
 * Implementation partagee avec le service worker : ../../recipe-store.js
 */

import i18n from '../i18n/index.js'
import { createRecipeStore } from '../../recipe-store.js'

// Fallback localStorage pour le dev (npm run dev, hors extension)
const localStorageArea = {
  async get(keys) {
    const keyList = keys === null ? Object.keys(localStorage) : [].concat(keys)
    const result = {}
    for (const key of keyList) {
      const val = localStorage.getItem(key)
      if (val !== null) result[key] = JSON.parse(val)
    }
    return result
  },
  async set(items) {
    for (const [key, val] of Object.entries(items)) {
      localStorage.setItem(key, JSON.stringify(val))
    }
  },
  async remove(keys) {
    for (const key of [].concat(keys)) {
      localStorage.removeItem(key)
    }
  },
}

const store = createRecipeStore(
  typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : localStorageArea
)

export const {
  getRecipe,
  getAllRecipes,
  getRecipeCount,
  deleteRecipe,
  clearAllRecipes,
  importRecipes,
} = store

/**
 * Met a jour une recette
 */
export async function updateRecipe(id, updates) {
  const updated = await store.updateRecipe(id, updates)
  if (!updated) {
    throw new Error(i18n.global.t('errors.recipeNotFound'))
  }
  return updated
}

/**
 * Bascule le statut favori d'une recette
 */
export async function toggleFavorite(id) {
  const recipe = await getRecipe(id)
  if (!recipe) {
    throw new Error(i18n.global.t('errors.recipeNotFound'))
  }
  return updateRecipe(id, { is_favorite: !recipe.is_favorite })
}

/**
 * Exporte toutes les recettes pour sauvegarde
 */
export async function exportRecipes() {
  return await getAllRecipes()
}
