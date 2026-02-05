<template>
  <section class="recipe-ingredients">
    <div class="section-header">
      <h2 class="heading-03">{{ $t('recipe.ingredients') }}</h2>
      <label class="portion-selector">
        <svg class="portion-arrows" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" clip-path="url(#arrows)">
            <path d="m13 12-3 3-3-3M7 8l3-3 3 3"/>
          </g>
          <defs><clipPath id="arrows"><path fill="#fff" d="M0 0h20v20H0z"/></clipPath></defs>
        </svg>
        <span class="portion-value body-medium">{{ portions }}</span>
        <svg class="portion-cutlery" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#cutlery)" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 2.5V5.5M5 8V14M13 10.5H9.5C9.5 10.5 9.5 4 13 2.5V14M2.8 2.5L2.5 5.5C2.5 6.163 2.763 6.799 3.232 7.268 3.701 7.737 4.337 8 5 8 5.663 8 6.299 7.737 6.768 7.268 7.237 6.799 7.5 6.163 7.5 5.5L7.2 2.5"/>
          </g>
          <defs><clipPath id="cutlery"><rect width="16" height="16" fill="white"/></clipPath></defs>
        </svg>
        <select v-model="portions" class="portion-native-select">
          <option v-for="n in portionOptions" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
    </div>

    <ul class="ingredients-list">
      <li v-for="(ingredient, index) in scaledIngredients" :key="index">
        <div class="ingredient-image">
          <img
            v-if="getIngredientImageUrl(index)"
            :src="getIngredientImageUrl(index)"
            :alt="ingredient"
            width="32"
            height="32"
          />
        </div>
        <div class="ingredient-content">
          <span v-if="getIngredientParts(ingredient).quantity" class="ingredient-quantity">{{ getIngredientParts(ingredient).quantity }}</span>
          <span class="ingredient-text">{{ getIngredientParts(ingredient).rest }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { BACKEND_URL } from '@/stores/settings'

const props = defineProps({
  ingredients: {
    type: Array,
    required: true,
  },
  enrichedIngredients: {
    type: Array,
    default: () => [],
  },
  scaledIngredients: {
    type: Array,
    required: true,
  },
  currentPortions: {
    type: Number,
    required: true,
  },
  portionOptions: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:current-portions'])

const portions = computed({
  get: () => props.currentPortions,
  set: (val) => emit('update:current-portions', val),
})

const QUANTITY_RE = /^(\d+[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+[.,]\d+|\d+|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(\s*(?:kg|mg|cl|dl|ml|g|l)\b)?/

function getIngredientParts(ingredient) {
  const match = ingredient.match(QUANTITY_RE)
  if (!match) {
    return { quantity: '', rest: ingredient }
  }
  const quantity = match[0]
  const rest = ingredient.slice(quantity.length).trimStart()
  return { quantity, rest }
}

function getIngredientImageUrl(index) {
  const enriched = props.enrichedIngredients?.[index]
  if (!enriched?.image_id) {
    return null
  }

  return `${BACKEND_URL}/api/ingredients/images/${enriched.image_id}`
}
</script>

<style scoped>

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-05);
}

.section-header h2 {
  margin: 0;
}

.portion-selector {
  position: relative;
  display: flex;
  align-items: center;
  border: none;
  cursor: pointer;
  color: var(--color-brand);
  user-select: none;
}


.portion-arrows {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.portion-value {
  min-width: 1.2em;
  text-align: center;
}

.portion-cutlery {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.portion-native-select {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ingredients-list li {
  display: flex;
  align-items: center;
  gap: var(--space-03);
  padding: var(--space-03) 0;
  border-bottom: 2px solid var(--color-border);
}

.ingredients-list li:first-child {
  border-top: 2px solid var(--color-border);
}

.ingredients-list li:last-child {
  border-bottom: none;
}

.ingredient-image {
  width: 40px;
  height: 40px;
  background: var(--color-background);
  border-radius: var(--radius-01);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ingredient-image img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.ingredient-content {
  line-height: 1.4;
}

.ingredient-quantity {
  color: var(--color-brand);
  margin-right: var(--space-02);
}

.ingredient-text {
  color: var(--color-text);
}
</style>
