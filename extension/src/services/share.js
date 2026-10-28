/**
 * Partage de recettes sans serveur : la recette est compressée dans le fragment (#…)
 * d'un lien vers la page statique docs/share/ (GitHub Pages).
 */

const SHARE_PAGE_URL = 'https://leodurandfr.github.io/Reciper/share/'

function toBase64Url(buffer) {
  let binary = ''
  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Construit le lien de partage d'une recette
 * @param {Object} recipe - Les données de la recette
 * @returns {Promise<{url: string}>}
 */
export async function shareRecipe(recipe) {
  const ingredients = recipe.ingredients || []
  const enriched = recipe.enriched_ingredients || []

  const payload = {
    title: recipe.title,
    image_url: recipe.image_url,
    ingredients: recipe.ingredients,
    // N'utiliser l'image que si l'entrée enrichie correspond bien à l'ingrédient (liste éventuellement modifiée)
    image_ids: ingredients.map((ingredient, index) =>
      enriched[index]?.text?.trim() === ingredient?.trim() ? enriched[index].image_id ?? null : null
    ),
    instructions: recipe.instructions,
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    yields: recipe.yields,
    url: recipe.url,
  }

  const stream = new Blob([JSON.stringify(payload)])
    .stream()
    .pipeThrough(new CompressionStream('deflate-raw'))
  const compressed = await new Response(stream).arrayBuffer()

  return { url: `${SHARE_PAGE_URL}#${toBase64Url(compressed)}` }
}
