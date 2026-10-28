/**
 * Composable for calculating portions and scaling ingredients.
 * Works directly with raw ingredient strings.
 */

import { ref, computed } from 'vue'

// Fraction mappings for display
const FRACTION_MAP = {
  0.25: '\u00BC',
  0.5: '\u00BD',
  0.75: '\u00BE',
  0.333: '\u2153',
  0.667: '\u2154',
  0.125: '\u215B',
  0.375: '\u215C',
  0.625: '\u215D',
  0.875: '\u215E',
}

// Unicode fractions for parsing
const UNICODE_FRACTIONS = {
  '\u00BD': 0.5, '\u2153': 1 / 3, '\u2154': 2 / 3, '\u00BC': 0.25, '\u00BE': 0.75,
  '\u2155': 0.2, '\u2156': 0.4, '\u2157': 0.6, '\u2158': 0.8,
  '\u2159': 1 / 6, '\u215A': 5 / 6, '\u215B': 0.125, '\u215C': 0.375, '\u215D': 0.625, '\u215E': 0.875,
}

/**
 * Parse a yields string to extract the number of portions.
 * Examples: "6 personnes", "4 servings", "8 portions", "6", "Makes 12"
 * Au-delà de MAX_PORTIONS (ex. « 1000 g »), la valeur est traitée comme inconnue,
 * comme sur la page de partage.
 */
const MAX_PORTIONS = 100

export function parseYields(yieldsStr) {
  if (!yieldsStr) return null
  const match = String(yieldsStr).match(/(\d+)/)
  const portions = match ? parseInt(match[1], 10) : null
  return portions && portions <= MAX_PORTIONS ? portions : null
}

/**
 * Extract quantity from the beginning of an ingredient string.
 * Handles: "200g", "1/2 cup", "1 1/2", "3", unicode fractions, etc.
 *
 * Returns: { quantity: number | null, rest: string }
 */
function extractQuantity(ingredient) {
  const original = ingredient.trim()

  // Pattern to match quantity at the beginning:
  // - Unicode fraction (optionally with whole number before)
  // - Mixed fraction like "1 1/2"
  // - Simple fraction like "1/2"
  // - Decimal like "1.5" or "1,5"
  // - Integer like "200"
  const quantityPattern = /^(\d+\s*)?([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])|^(\d+)\s+(\d+)\/(\d+)|^(\d+)\/(\d+)|^(\d+[.,]\d+)|^(\d+)/

  const match = original.match(quantityPattern)
  if (!match) {
    return { quantity: null, rest: original }
  }

  let quantity = null
  let matchLength = match[0].length

  // Unicode fraction (with optional whole number)
  if (match[2]) {
    const fraction = UNICODE_FRACTIONS[match[2]] || 0
    const whole = match[1] ? parseInt(match[1].trim(), 10) : 0
    quantity = whole + fraction
  }
  // Mixed fraction: "1 1/2"
  else if (match[3] && match[4] && match[5]) {
    const whole = parseInt(match[3], 10)
    const num = parseInt(match[4], 10)
    const denom = parseInt(match[5], 10)
    quantity = denom !== 0 ? whole + num / denom : null
  }
  // Simple fraction: "1/2"
  else if (match[6] && match[7]) {
    const num = parseInt(match[6], 10)
    const denom = parseInt(match[7], 10)
    quantity = denom !== 0 ? num / denom : null
  }
  // Decimal: "1.5" or "1,5"
  else if (match[8]) {
    quantity = parseFloat(match[8].replace(',', '.'))
  }
  // Integer: "200"
  else if (match[9]) {
    quantity = parseInt(match[9], 10)
  }

  const rest = original.slice(matchLength).trim()
  return { quantity, rest }
}

/**
 * Format a quantity for display with intelligent rounding.
 * - Whole numbers: display as-is
 * - Nice fractions (0.25, 0.5, 0.75): display as unicode fractions
 * - Others: round to 1 decimal
 */
function formatQuantity(quantity) {
  if (quantity === null || quantity === undefined) return ''

  // Check for whole number
  if (Number.isInteger(quantity)) {
    return quantity.toString()
  }

  // Check for mixed number (e.g., 1.5 -> 1½)
  const whole = Math.floor(quantity)
  const fraction = quantity - whole

  // Round fraction to 3 decimals for comparison
  const roundedFraction = Math.round(fraction * 1000) / 1000

  for (const [decimal, symbol] of Object.entries(FRACTION_MAP)) {
    if (Math.abs(roundedFraction - parseFloat(decimal)) < 0.01) {
      return whole > 0 ? `${whole}${symbol}` : symbol
    }
  }

  // Default: round to 1 decimal, remove trailing zeros
  const rounded = Math.round(quantity * 10) / 10
  if (rounded === 0 && quantity > 0) {
    // Petite quantité non nulle : garder 1 chiffre significatif plutôt qu'afficher « 0 »
    return Number(quantity.toPrecision(1)).toString()
  }
  return rounded.toString().replace(/\.0$/, '')
}

// Fourchette en début d'ingrédient : « 2-3 », « 2 à 3 », « 2 to 3 », « 1,5 ou 2 », « 1 to 1 1/2 »…
// Seuls la borne basse et le séparateur sont capturés ; la borne haute est lue par extractQuantity.
const RANGE_PATTERN = /^(\d+(?:[.,]\d+)?)(\s*[-–]\s*|\s+(?:à|a|to|ou|or)\s+)(?=[\d½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/

function parseNumber(str) {
  return parseFloat(str.replace(',', '.'))
}

/**
 * Scale an ingredient string based on portion ratio.
 * Extracts the quantity, scales it, and reconstructs the string.
 */
function scaleIngredientString(ingredient, originalPortions, newPortions) {
  if (!originalPortions || originalPortions === 0) {
    return ingredient
  }

  const ratio = newPortions / originalPortions

  // Fourchette : mettre les deux bornes à l'échelle en gardant le séparateur d'origine
  const range = ingredient.trim().match(RANGE_PATTERN)
  if (range) {
    const [whole, min, separator] = range
    const max = extractQuantity(ingredient.trim().slice(whole.length))
    if (max.quantity !== null) {
      const scaledRange = `${formatQuantity(parseNumber(min) * ratio)}${separator}${formatQuantity(max.quantity * ratio)}`
      return `${scaledRange} ${max.rest}`.trim()
    }
  }

  const { quantity, rest } = extractQuantity(ingredient)

  if (quantity === null) {
    return ingredient
  }

  const scaledQuantity = quantity * ratio
  const displayQuantity = formatQuantity(scaledQuantity)

  return `${displayQuantity} ${rest}`.trim()
}

export function usePortionCalculator(yieldsStr) {
  const originalPortions = ref(parseYields(yieldsStr))
  const currentPortions = ref(originalPortions.value || 4)

  // Sans nombre de portions d'origine, aucune mise à l'échelle n'est possible
  const canScale = computed(() => !!originalPortions.value)

  /**
   * Available portion options for the dropdown.
   * Includes at least 1-12, plus the original portions if higher.
   */
  const portionOptions = computed(() => {
    const max = Math.max(12, originalPortions.value || 4)
    const options = []
    for (let i = 1; i <= max; i++) {
      options.push(i)
    }
    return options
  })

  /**
   * Scale all ingredients in a list.
   */
  function scaleAllIngredients(ingredients) {
    return ingredients.map(ing => scaleIngredientString(ing, originalPortions.value, currentPortions.value))
  }

  return {
    originalPortions,
    currentPortions,
    canScale,
    portionOptions,
    scaleAllIngredients,
  }
}
