<template>
  <article class="recipe-grid">
    <RecipeHeader :recipe="recipe" class="col-full" />

    <div class="col-left">
      <RecipeIngredients
        :ingredients="recipe.ingredients || []"
        :enriched-ingredients="recipe.enriched_ingredients || []"
        :scaled-ingredients="scaledIngredients"
        :current-portions="currentPortions"
        :portion-options="portionOptions"
        @update:current-portions="currentPortions = $event"
      />
    </div>

    <div class="col-right">
      <RecipeInstructions :instructions="recipe.parsed_instructions || []" />
    </div>

    <RecipeFooter
      :recipe="recipe"
      class="col-full"
      @edit="showEditModal = true"
      @favorite-toggled="handleFavoriteToggled"
      @deleted="handleRecipeDeleted"
    />

    <RecipeEditModal
      :is-open="showEditModal"
      :recipe="recipe"
      @close="showEditModal = false"
      @updated="handleRecipeUpdated"
    />
  </article>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import RecipeHeader from './recipe/RecipeHeader.vue'
import RecipeIngredients from './recipe/RecipeIngredients.vue'
import RecipeInstructions from './recipe/RecipeInstructions.vue'
import RecipeFooter from './recipe/RecipeFooter.vue'
import RecipeEditModal from './recipe/RecipeEditModal.vue'
import { usePortionCalculator } from '../composables/usePortionCalculator'

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['favorite-toggled', 'recipe-updated', 'recipe-deleted'])

const showEditModal = ref(false)

// Centralized portion management
const {
  originalPortions,
  currentPortions,
  portionOptions,
  scaleAllIngredients,
} = usePortionCalculator(props.recipe.yields)

// Computed scaled ingredients
const scaledIngredients = computed(() => {
  return scaleAllIngredients(props.recipe.ingredients || [])
})

// Watch for yields changes when recipe is updated
watch(
  () => props.recipe.yields,
  (newYields) => {
    const parsed = newYields?.match(/(\d+)/)?.[1]
    if (parsed) {
      const portions = parseInt(parsed, 10)
      originalPortions.value = portions
      currentPortions.value = portions
    }
  }
)

function handleFavoriteToggled(isFavorite) {
  emit('favorite-toggled', isFavorite)
}

function handleRecipeUpdated(updatedRecipe) {
  emit('recipe-updated', updatedRecipe)
}

function handleRecipeDeleted() {
  emit('recipe-deleted')
}
</script>

<style scoped>
.recipe-grid {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 2 / 12;
  gap: var(--space-05);
  padding: var(--space-05) 0;
}

.col-full {
  grid-column: 1 / -1;
}

/* Desktop & Tablet: split 3/7 (colonnes 1-3 / 4-10) */
.col-left {
  grid-column: 1 / 4;
}

.col-right {
  grid-column: 4 / -1;
}

/* Mobile: empilé */
@media (max-width: 480px) {
  .recipe-grid {
    grid-column: 1 / -1;
  }

  .col-full,
  .col-left,
  .col-right {
    grid-column: 1 / -1;
  }
}
</style>
