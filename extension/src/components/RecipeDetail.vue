<template>
  <article class="recipe-grid">
    <RecipeHeader :recipe="recipe" class="col-full" />

    <div class="col-left">
      <RecipeIngredients :ingredients="recipe.ingredients || []"
        :enriched-ingredients="recipe.enriched_ingredients || []" :scaled-ingredients="scaledIngredients"
        :current-portions="currentPortions" :portion-options="portionOptions"
        @update:current-portions="currentPortions = $event" />
    </div>

    <div class="col-right">
      <RecipeInstructions :instructions="recipe.parsed_instructions || []" />
      <RecipeFooter :recipe="recipe" @edit="showEditModal = true"
        @deleted="handleRecipeDeleted" />
    </div>

    <RecipeEditModal :is-open="showEditModal" :recipe="recipe" @close="showEditModal = false"
      @updated="handleRecipeUpdated" />
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

const emit = defineEmits(['recipe-updated', 'recipe-deleted'])

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
  row-gap: var(--grid-gutter);
}

.recipe-grid > :nth-child(1) { animation: stagger-in 300ms ease-out both; animation-delay: 150ms; }
.recipe-grid > :nth-child(2) { animation: stagger-in 300ms ease-out both; animation-delay: 200ms; }
.recipe-grid > :nth-child(3) { animation: stagger-in 300ms ease-out both; animation-delay: 250ms; }

@keyframes stagger-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

.col-left,
.col-right {
  padding: var(--space-06);
  background: var(--color-background-neutral);
  border-radius: var(--radius-07);
}

.col-full {
  grid-column: 1 / -1;
}

.col-left {
  grid-column: 1 / 4;
}

.col-right {
  grid-column: 4 / -1;
}


@media (max-width: 1280px) {
  .recipe-grid {
    grid-column: 1 / 13;
  }

  .col-left {
    grid-column: 1 / 5;
  }

  .col-right {
    grid-column: 5 / -1;
  }
}

/* Mobile: empilé */
@media (max-width: 800px) {
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
