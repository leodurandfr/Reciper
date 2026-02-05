/**
 * Service de stockage des recettes avec chrome.storage.local
 * Persiste meme quand l'utilisateur vide le cache/cookies du navigateur
 */

import i18n from '../i18n/index.js'

const INDEX_KEY = 'recipes_index'

// Cache memoire de l'index pour eviter les lectures repetees
let indexCache = null

// --- Helpers storage ---

async function storageGet(keys) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome.storage.local.get(keys)
  }
  // Fallback localStorage pour le dev
  const result = {}
  const keyList = Array.isArray(keys) ? keys : [keys]
  for (const key of keyList) {
    const val = localStorage.getItem(key)
    if (val !== null) result[key] = JSON.parse(val)
  }
  return result
}

async function storageSet(items) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome.storage.local.set(items)
  }
  for (const [key, val] of Object.entries(items)) {
    localStorage.setItem(key, JSON.stringify(val))
  }
}

async function storageRemove(keys) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome.storage.local.remove(keys)
  }
  const keyList = Array.isArray(keys) ? keys : [keys]
  for (const key of keyList) {
    localStorage.removeItem(key)
  }
}

// --- Index management ---

async function getIndex() {
  if (indexCache) return indexCache
  const result = await storageGet(INDEX_KEY)
  indexCache = result[INDEX_KEY] || { nextId: 1, ids: [], urlMap: {} }
  return indexCache
}

async function saveIndex(index) {
  indexCache = index
  await storageSet({ [INDEX_KEY]: index })
}

// --- API publique ---

/**
 * Initialise le stockage (charge l'index en cache)
 */
export async function initDB() {
  await getIndex()
}

/**
 * Ajoute une recette
 * Si une recette avec la meme URL existe, retourne l'existante
 */
export async function addRecipe(recipe) {
  const index = await getIndex()

  // Verifier si la recette existe deja par URL
  if (recipe.url && index.urlMap[recipe.url]) {
    const existingId = index.urlMap[recipe.url]
    return await getRecipe(existingId)
  }

  const id = index.nextId
  const recipeData = {
    ...recipe,
    id,
    is_favorite: recipe.is_favorite || false,
    image_base64: recipe.image_base64 || null,
    created_at: recipe.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Supprimer image_blob si present (ancien format)
  delete recipeData.image_blob

  // Mettre a jour l'index
  index.nextId = id + 1
  index.ids.unshift(id)
  if (recipe.url) {
    index.urlMap[recipe.url] = id
  }

  // Sauvegarder recette + index en une seule operation
  await storageSet({
    [`recipe_${id}`]: recipeData,
    [INDEX_KEY]: index,
  })
  indexCache = index

  return recipeData
}

/**
 * Recupere une recette par son ID
 */
export async function getRecipe(id) {
  const result = await storageGet(`recipe_${id}`)
  return result[`recipe_${id}`] || null
}

/**
 * Recupere une recette par son URL
 */
export async function getRecipeByUrl(url) {
  const index = await getIndex()
  const id = index.urlMap[url]
  if (!id) return null
  return await getRecipe(id)
}

/**
 * Recupere toutes les recettes avec options de filtrage
 */
export async function getAllRecipes(options = {}) {
  const { favoritesOnly = false, limit = 1000, offset = 0 } = options
  const index = await getIndex()

  if (index.ids.length === 0) return []

  const keys = index.ids.map(id => `recipe_${id}`)
  const result = await storageGet(keys)

  let recipes = index.ids
    .map(id => result[`recipe_${id}`])
    .filter(Boolean)

  if (favoritesOnly) {
    recipes = recipes.filter(r => r.is_favorite)
  }

  // Tri par date decroissante
  recipes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return recipes.slice(offset, offset + limit)
}

/**
 * Met a jour une recette
 */
export async function updateRecipe(id, updates) {
  const existing = await getRecipe(id)
  if (!existing) {
    throw new Error(i18n.global.t('errors.recipeNotFound'))
  }

  const updatedRecipe = {
    ...existing,
    ...updates,
    id,
    updated_at: new Date().toISOString(),
  }

  const index = await getIndex()

  // Si l'URL a change, mettre a jour le urlMap
  if (updates.url && updates.url !== existing.url) {
    delete index.urlMap[existing.url]
    index.urlMap[updates.url] = id
    await storageSet({
      [`recipe_${id}`]: updatedRecipe,
      [INDEX_KEY]: index,
    })
    indexCache = index
  } else {
    await storageSet({ [`recipe_${id}`]: updatedRecipe })
  }

  return updatedRecipe
}

/**
 * Supprime une recette
 */
export async function deleteRecipe(id) {
  const existing = await getRecipe(id)
  const index = await getIndex()

  index.ids = index.ids.filter(i => i !== id)
  if (existing?.url) {
    delete index.urlMap[existing.url]
  }

  await storageRemove(`recipe_${id}`)
  await saveIndex(index)

  return true
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
 * Compte le nombre total de recettes
 */
export async function getRecipeCount() {
  const index = await getIndex()
  return index.ids.length
}

/**
 * Supprime toutes les recettes
 */
export async function clearAllRecipes() {
  const index = await getIndex()
  const keys = index.ids.map(id => `recipe_${id}`)
  keys.push(INDEX_KEY)

  await storageRemove(keys)
  indexCache = null

  await saveIndex({ nextId: 1, ids: [], urlMap: {} })
  return true
}

/**
 * Exporte toutes les recettes pour sauvegarde
 */
export async function exportRecipes() {
  return await getAllRecipes({ limit: 10000 })
}

/**
 * Importe des recettes depuis une sauvegarde
 */
export async function importRecipes(recipes, overwrite = false) {
  let imported = 0
  let skipped = 0

  for (const recipe of recipes) {
    const existing = await getRecipeByUrl(recipe.url)

    if (existing && !overwrite) {
      skipped++
      continue
    }

    const recipeData = { ...recipe }
    // Supprimer l'ID pour permettre l'auto-increment
    delete recipeData.id
    // Gerer l'ancien format avec image_blob
    delete recipeData.image_blob

    if (existing && overwrite) {
      await updateRecipe(existing.id, recipeData)
    } else {
      await addRecipe(recipeData)
    }
    imported++
  }

  return { imported, skipped }
}
