/**
 * Composable pour le matching d'ingrédients aux étapes de recette
 * Port JavaScript de ingredient_matcher.py
 */

// Pattern pour détecter les lignes qui sont UNIQUEMENT des numéros d'étapes
const EMPTY_STEP_PATTERN = /^(?:[EeÉé]tape|[Ss]tep)?\s*\d+\.?\s*$/u

// Pattern pour retirer les préfixes d'étapes
const STEP_PREFIX_PATTERN = /^(?:[EeÉé]tape|[Ss]tep)\s*\d+\s*[:.\-–—]?\s*/u

// Unités communes à ignorer
const COMMON_UNITS = new Set([
  'ml', 'cl', 'dl', 'tsp', 'tbsp', 'cup', 'cups', 'tasse', 'tasses',
  'gramme', 'grammes', 'gram', 'grams', 'kilogramme', 'kilogrammes',
  'litre', 'litres', 'liter', 'liters', 'ounce', 'ounces', 'pound', 'pounds',
  'cuillère', 'cuillères', 'soupe', 'café', 'pincée', 'pincées',
  'goutte', 'gouttes', 'tranche', 'tranches', 'gousse', 'gousses',
  'feuille', 'feuilles', 'branche', 'branches', 'morceau', 'morceaux',
])

/**
 * Vérifie si une ligne est juste un numéro d'étape
 * @param {string} text
 * @returns {boolean}
 */
function isEmptyStepMarker(text) {
  return EMPTY_STEP_PATTERN.test(text.trim())
}

/**
 * Retire le préfixe 'Étape N:' du texte
 * @param {string} text
 * @returns {string}
 */
function cleanStepText(text) {
  return text.trim().replace(STEP_PREFIX_PATTERN, '')
}

/**
 * Normalise le texte pour le matching (minuscules, retire articles/ponctuation)
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  let normalized = text.toLowerCase()
  // Retirer les articles courants (français et anglais)
  normalized = normalized.replace(/\b(le|la|les|l'|un|une|des|du|de|d'|the|a|an|some|of)\b/g, '')
  // Retirer la ponctuation
  normalized = normalized.replace(/[^\w\s]/g, ' ')
  // Normaliser les espaces
  normalized = normalized.split(/\s+/).filter(Boolean).join(' ')
  return normalized
}

/**
 * Extrait les mots-clés significatifs d'un ingrédient
 * @param {string} ingredient
 * @returns {string[]}
 */
function extractKeywords(ingredient) {
  const normalized = normalizeText(ingredient)
  const words = normalized.split(' ')

  return words.filter(word => {
    // Ignorer les mots courts
    if (word.length <= 3) return false
    // Ignorer les mots qui commencent par un chiffre
    if (/^\d/.test(word)) return false
    // Ignorer les unités communes
    if (COMMON_UNITS.has(word)) return false
    return true
  })
}

/**
 * Trouve quels ingrédients sont mentionnés dans une étape
 * @param {string} step - Le texte de l'étape
 * @param {string[]} ingredients - Liste des ingrédients
 * @returns {string[]} Liste des ingrédients mentionnés
 */
export function matchIngredientsToStep(step, ingredients) {
  const stepNormalized = normalizeText(step)
  const matched = []

  for (const ingredient of ingredients) {
    const keywords = extractKeywords(ingredient)

    // Vérifier si un mot-clé apparaît dans l'étape
    for (const keyword of keywords) {
      if (stepNormalized.includes(keyword)) {
        matched.push(ingredient)
        break
      }
    }
  }

  return matched
}

/**
 * Parse les instructions et associe les ingrédients correspondants
 * @param {string[]} instructions - Liste des étapes
 * @param {string[]} ingredients - Liste des ingrédients
 * @returns {Array<{step_number: number, text: string, related_ingredients: string[]}>}
 */
export function parseInstructionsWithIngredients(instructions, ingredients) {
  const result = []
  let stepNumber = 1

  for (const step of instructions) {
    // Ignorer les marqueurs d'étape vides
    if (isEmptyStepMarker(step)) {
      continue
    }

    // Nettoyer le texte
    const cleanedText = cleanStepText(step)
    if (!cleanedText) {
      continue
    }

    // Trouver les ingrédients liés
    const relatedIngredients = matchIngredientsToStep(cleanedText, ingredients)

    result.push({
      step_number: stepNumber,
      text: cleanedText,
      related_ingredients: relatedIngredients,
    })

    stepNumber++
  }

  return result
}

/**
 * Composable Vue pour utiliser le matcher d'ingrédients
 */
export function useIngredientMatcher() {
  return {
    matchIngredientsToStep,
    parseInstructionsWithIngredients,
  }
}

export default useIngredientMatcher
