/**
 * Mise en forme des étapes de recette : retire les marqueurs d'étape vides
 * et les préfixes « Étape N : », puis numérote les étapes
 */

// Pattern pour détecter les lignes qui sont UNIQUEMENT des numéros d'étapes
const EMPTY_STEP_PATTERN = /^(?:[EeÉé]tape|[Ss]tep)?\s*\d+\.?\s*$/u

// Pattern pour retirer les préfixes d'étapes
const STEP_PREFIX_PATTERN = /^(?:[EeÉé]tape|[Ss]tep)\s*\d+\s*[:.\-–—]?\s*/u

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
 * Parse les instructions en étapes numérotées
 * @param {string[]} instructions - Liste des étapes
 * @returns {Array<{step_number: number, text: string}>}
 */
export function parseInstructions(instructions) {
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

    result.push({
      step_number: stepNumber,
      text: cleanedText,
    })

    stepNumber++
  }

  return result
}
