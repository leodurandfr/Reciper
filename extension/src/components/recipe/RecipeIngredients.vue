<template>
  <section class="recipe-ingredients">
    <div class="section-header">
      <h2 class="heading-03">{{ $t('recipe.ingredients') }}</h2>
      <label class="portion-selector">
<Icon name="arrows-vertical" size="md" class="portion-arrows" />
        <span class="portion-value body-medium">{{ portions }}</span>
<Icon name="cutlery" size="md" />
        <select v-model="portions" class="portion-native-select">
          <option v-for="n in portionOptions" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
    </div>

    <ul class="ingredients-list">
      <li v-for="(ingredient, index) in scaledIngredients" :key="index">
        <div class="ingredient-image">
          <img
            v-if="hasImage(index)"
            :src="getIngredientImageUrl(index)"
            :alt="ingredient"
            width="32"
            height="32"
            @error="onImageError"
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
import Icon from '@/components/Icon.vue'
import { useSettings, BACKEND_URL } from '@/stores/settings'

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

const settings = useSettings()

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

function getImageBaseUrl() {
  return import.meta.env.DEV ? '' : (settings.backendUrl || BACKEND_URL)
}

function hasImage(index) {
  return !!props.enrichedIngredients?.[index]?.image_id
}

function getIngredientImageUrl(index) {
  return `${getImageBaseUrl()}/api/ingredients/images/${props.enrichedIngredients[index].image_id}`
}

function onImageError(e) {
  e.target.style.display = 'none'
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
  gap: var(--space-02);
  padding: var(--space-02) 0;
  border-bottom: 2px solid var(--color-border);
}

.ingredients-list li:first-child {
  border-top: 2px solid var(--color-border);
}

.ingredients-list li:last-child {
  border-bottom: none;
}

.ingredient-image {
  width: 36px;
  height: 36px;
  margin-left: -4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-full);
  background-color: var(--color-background-strong);
}

.ingredient-image img {
  width: 100%;
  height: 100%;
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
