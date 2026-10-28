/**
 * Stockage des recettes, implémentation unique partagée par le service worker
 * (import './recipe-store.js') et l'app (src/services/db.js). Module autonome : copié
 * tel quel dans dist/, il ne doit rien importer.
 *
 * Clés : 'recipes_index' = { nextId, ids, urlMap } et une clé 'recipe_<id>' par recette.
 *
 * L'app et le service worker écrivent tous les deux : l'index n'est jamais gardé en
 * mémoire, chaque écriture le relit juste avant de le modifier. Les écritures passent par
 * une file dans chaque contexte, et par un verrou Web Locks commun à tous les contextes de
 * l'extension (même origine) pour ne pas s'entrelacer entre le service worker et l'app.
 */

export const INDEX_KEY = 'recipes_index'

const RECIPE_KEY = /^recipe_\d+$/
const LOCK_NAME = 'reciper-recipes'

function recipeKey(id) {
  return `recipe_${id}`
}

/**
 * @param {{get: Function, set: Function, remove: Function}} storage - chrome.storage.local
 *   ou un équivalent de même interface (get(null) renvoie tout)
 */
export function createRecipeStore(storage) {
  let writeQueue = Promise.resolve()

  // Exécute task après les écritures précédentes, de ce contexte comme des autres
  function serialize(task) {
    const locks = globalThis.navigator?.locks
    const run = writeQueue.then(() => (locks ? locks.request(LOCK_NAME, task) : task()))
    writeQueue = run.catch(() => {})
    return run
  }

  async function getIndex() {
    const result = await storage.get(INDEX_KEY)
    return result[INDEX_KEY] || { nextId: 1, ids: [], urlMap: {} }
  }

  async function getRecipe(id) {
    const result = await storage.get(recipeKey(id))
    return result[recipeKey(id)] || null
  }

  async function getRecipeByUrl(url) {
    if (!url) return null
    const id = (await getIndex()).urlMap[url]
    return id ? getRecipe(id) : null
  }

  /**
   * Toutes les recettes, des plus récentes aux plus anciennes
   */
  async function getAllRecipes({ favoritesOnly = false } = {}) {
    const index = await getIndex()
    if (index.ids.length === 0) return []

    const result = await storage.get(index.ids.map(recipeKey))
    let recipes = index.ids.map(id => result[recipeKey(id)]).filter(Boolean)
    if (favoritesOnly) {
      recipes = recipes.filter(r => r.is_favorite)
    }
    return recipes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  async function getRecipeCount() {
    return (await getIndex()).ids.length
  }

  /**
   * Ajoute une recette. Si une recette a déjà cette URL, renvoie l'existante.
   */
  function addRecipe(recipe) {
    return serialize(async () => {
      const index = await getIndex()

      const existingId = recipe.url && index.urlMap[recipe.url]
      if (existingId) {
        const existing = await getRecipe(existingId)
        if (existing) return existing
      }

      const now = new Date().toISOString()
      const id = index.nextId
      const recipeData = {
        ...recipe,
        id,
        is_favorite: Boolean(recipe.is_favorite),
        created_at: recipe.created_at || now,
        updated_at: now,
      }

      index.nextId = id + 1
      index.ids.unshift(id)
      if (recipe.url) {
        index.urlMap[recipe.url] = id
      }

      await storage.set({ [recipeKey(id)]: recipeData, [INDEX_KEY]: index })
      return recipeData
    })
  }

  /**
   * Met à jour une recette. Renvoie null si elle n'existe pas.
   */
  function updateRecipe(id, updates) {
    return serialize(async () => {
      const existing = await getRecipe(id)
      if (!existing) return null

      const updatedRecipe = {
        ...existing,
        ...updates,
        id,
        updated_at: new Date().toISOString(),
      }

      if (updates.url && updates.url !== existing.url) {
        const index = await getIndex()
        if (index.urlMap[existing.url] === id) {
          delete index.urlMap[existing.url]
        }
        index.urlMap[updates.url] = id
        await storage.set({ [recipeKey(id)]: updatedRecipe, [INDEX_KEY]: index })
      } else {
        await storage.set({ [recipeKey(id)]: updatedRecipe })
      }

      return updatedRecipe
    })
  }

  function deleteRecipe(id) {
    return serialize(async () => {
      const existing = await getRecipe(id)
      const index = await getIndex()

      index.ids = index.ids.filter(i => i !== id)
      if (existing?.url && index.urlMap[existing.url] === id) {
        delete index.urlMap[existing.url]
      }

      await storage.set({ [INDEX_KEY]: index })
      await storage.remove(recipeKey(id))
      return true
    })
  }

  /**
   * Supprime toutes les recettes, y compris celles absentes de l'index (clés orphelines)
   */
  function clearAllRecipes() {
    return serialize(async () => {
      const keys = Object.keys(await storage.get(null)).filter(key => RECIPE_KEY.test(key))
      await storage.remove([...keys, INDEX_KEY])
      return true
    })
  }

  /**
   * Importe des recettes (déjà validées) en une seule écriture.
   * Une recette dont l'URL existe déjà est ignorée, ou fusionnée si overwrite.
   */
  function importRecipes(recipes, overwrite = false) {
    return serialize(async () => {
      const index = await getIndex()
      const now = new Date().toISOString()
      const items = {}
      let imported = 0
      let skipped = 0

      // Recettes existantes de mêmes URL, lues en une fois
      const existingKeys = [...new Set(recipes.map(r => r.url && index.urlMap[r.url]).filter(Boolean))]
        .map(recipeKey)
      const stored = existingKeys.length > 0 ? await storage.get(existingKeys) : {}

      for (const recipe of recipes) {
        const existingId = recipe.url && index.urlMap[recipe.url]
        const existing = existingId && (items[recipeKey(existingId)] || stored[recipeKey(existingId)])

        if (existing && !overwrite) {
          skipped++
          continue
        }

        if (existing) {
          items[recipeKey(existingId)] = { ...existing, ...recipe, id: existingId, updated_at: now }
        } else {
          const id = index.nextId++
          items[recipeKey(id)] = {
            ...recipe,
            id,
            is_favorite: Boolean(recipe.is_favorite),
            created_at: recipe.created_at || now,
            updated_at: now,
          }
          index.ids.unshift(id)
          if (recipe.url) {
            index.urlMap[recipe.url] = id
          }
        }
        imported++
      }

      if (imported > 0) {
        await storage.set({ ...items, [INDEX_KEY]: index })
      }
      return { imported, skipped }
    })
  }

  return {
    getRecipe,
    getRecipeByUrl,
    getAllRecipes,
    getRecipeCount,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    clearAllRecipes,
    importRecipes,
  }
}
