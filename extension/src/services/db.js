/**
 * Service IndexedDB pour le stockage local des recettes
 */

const DB_NAME = 'ReciperDB'
const DB_VERSION = 1

let dbInstance = null

/**
 * Initialise la base de données IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
export async function initDB() {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Créer l'object store recipes
      if (!db.objectStoreNames.contains('recipes')) {
        const store = db.createObjectStore('recipes', {
          keyPath: 'id',
          autoIncrement: true
        })

        // Index pour déduplication par URL
        store.createIndex('url', 'url', { unique: true })
        // Index pour filtrer les favoris
        store.createIndex('is_favorite', 'is_favorite', { unique: false })
        // Index pour trier par date
        store.createIndex('created_at', 'created_at', { unique: false })
        // Index pour filtrer par site
        store.createIndex('host', 'host', { unique: false })
      }
    }
  })
}

/**
 * Ajoute une recette à la base de données
 * Si une recette avec la même URL existe, retourne l'existante
 * @param {Object} recipe - La recette à ajouter
 * @returns {Promise<Object>} La recette ajoutée ou existante
 */
export async function addRecipe(recipe) {
  const db = await initDB()

  // Vérifier si la recette existe déjà
  const existing = await getRecipeByUrl(recipe.url)
  if (existing) {
    return existing
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recipes'], 'readwrite')
    const store = transaction.objectStore('recipes')

    const recipeData = {
      ...recipe,
      is_favorite: recipe.is_favorite || false,
      image_blob: recipe.image_blob || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const request = store.add(recipeData)

    request.onsuccess = () => resolve({ ...recipeData, id: request.result })
    request.onerror = () => reject(request.error)
  })
}

/**
 * Récupère une recette par son ID
 * @param {number} id - L'ID de la recette
 * @returns {Promise<Object|null>}
 */
export async function getRecipe(id) {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recipes'], 'readonly')
    const store = transaction.objectStore('recipes')
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Récupère une recette par son URL
 * @param {string} url - L'URL de la recette
 * @returns {Promise<Object|null>}
 */
export async function getRecipeByUrl(url) {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recipes'], 'readonly')
    const store = transaction.objectStore('recipes')
    const index = store.index('url')
    const request = index.get(url)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Récupère toutes les recettes avec options de filtrage
 * @param {Object} options - Options de filtrage
 * @param {boolean} options.favoritesOnly - Filtrer les favoris uniquement
 * @param {number} options.limit - Limite de résultats
 * @param {number} options.offset - Décalage pour pagination
 * @returns {Promise<Array>}
 */
export async function getAllRecipes(options = {}) {
  const db = await initDB()
  const { favoritesOnly = false, limit = 1000, offset = 0 } = options

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recipes'], 'readonly')
    const store = transaction.objectStore('recipes')

    const request = store.getAll()

    request.onsuccess = () => {
      let recipes = request.result

      // Filtrer les favoris si demandé
      if (favoritesOnly) {
        recipes = recipes.filter(r => r.is_favorite)
      }

      // Trier par date décroissante
      recipes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      // Appliquer pagination
      recipes = recipes.slice(offset, offset + limit)

      resolve(recipes)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Met à jour une recette
 * @param {number} id - L'ID de la recette
 * @param {Object} updates - Les champs à mettre à jour
 * @returns {Promise<Object>}
 */
export async function updateRecipe(id, updates) {
  const db = await initDB()

  const existing = await getRecipe(id)
  if (!existing) {
    throw new Error('Recette non trouvée')
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recipes'], 'readwrite')
    const store = transaction.objectStore('recipes')

    const updatedRecipe = {
      ...existing,
      ...updates,
      id, // S'assurer que l'ID ne change pas
      updated_at: new Date().toISOString(),
    }

    const request = store.put(updatedRecipe)

    request.onsuccess = () => resolve(updatedRecipe)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Supprime une recette
 * @param {number} id - L'ID de la recette
 * @returns {Promise<boolean>}
 */
export async function deleteRecipe(id) {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recipes'], 'readwrite')
    const store = transaction.objectStore('recipes')
    const request = store.delete(id)

    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Bascule le statut favori d'une recette
 * @param {number} id - L'ID de la recette
 * @returns {Promise<Object>}
 */
export async function toggleFavorite(id) {
  const recipe = await getRecipe(id)
  if (!recipe) {
    throw new Error('Recette non trouvée')
  }

  return updateRecipe(id, { is_favorite: !recipe.is_favorite })
}

/**
 * Compte le nombre total de recettes
 * @returns {Promise<number>}
 */
export async function getRecipeCount() {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recipes'], 'readonly')
    const store = transaction.objectStore('recipes')
    const request = store.count()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Supprime toutes les recettes
 * @returns {Promise<boolean>}
 */
export async function clearAllRecipes() {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['recipes'], 'readwrite')
    const store = transaction.objectStore('recipes')
    const request = store.clear()

    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Exporte toutes les recettes pour sauvegarde
 * @returns {Promise<Array>}
 */
export async function exportRecipes() {
  const recipes = await getAllRecipes({ limit: 10000 })

  // Convertir les blobs en base64 pour l'export
  const exportData = await Promise.all(
    recipes.map(async (recipe) => {
      const exportRecipe = { ...recipe }

      if (recipe.image_blob instanceof Blob) {
        exportRecipe.image_base64 = await blobToBase64(recipe.image_blob)
        delete exportRecipe.image_blob
      }

      return exportRecipe
    })
  )

  return exportData
}

/**
 * Importe des recettes depuis une sauvegarde
 * @param {Array} recipes - Les recettes à importer
 * @param {boolean} overwrite - Écraser les recettes existantes
 * @returns {Promise<{imported: number, skipped: number}>}
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

    // Convertir base64 en blob si présent
    const recipeData = { ...recipe }
    if (recipe.image_base64) {
      recipeData.image_blob = base64ToBlob(recipe.image_base64)
      delete recipeData.image_base64
    }

    // Supprimer l'ID pour permettre l'auto-increment
    delete recipeData.id

    if (existing && overwrite) {
      await updateRecipe(existing.id, recipeData)
    } else {
      await addRecipe(recipeData)
    }
    imported++
  }

  return { imported, skipped }
}

// Utilitaires pour conversion blob/base64

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(base64) {
  const parts = base64.split(',')
  const mime = parts[0].match(/:(.*?);/)[1]
  const bstr = atob(parts[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }

  return new Blob([u8arr], { type: mime })
}
