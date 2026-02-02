<template>
  <header class="recipe-header">
    <div class="recipe-info">
      <h1 class="heading-01">{{ recipe.title }}</h1>

      <p v-if="ingredientNames.length" class="ingredient-list body-medium">
        {{ ingredientNames.join(' · ') }}
      </p>

      <div class="times body-small" v-if="recipe.prep_time || recipe.cook_time">
        <span v-if="recipe.prep_time">Preparation {{ recipe.prep_time }}min</span>
        <span v-if="recipe.prep_time && recipe.cook_time"> / </span>
        <span v-if="recipe.cook_time">Cuisson {{ recipe.cook_time }}min</span>
      </div>
    </div>

    <div v-if="recipe.image_url" class="image-container">
      <img
        :src="recipe.image_url"
        :alt="recipe.title"
        class="recipe-image"
      />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})

const ingredientNames = computed(() => {
  if (!props.recipe.parsed_ingredients) return []
  return props.recipe.parsed_ingredients.map(ing => ing.name).slice(0, 8)
})
</script>

<style scoped>
.recipe-header {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  margin-bottom: var(--space-05);
  align-items: start;
}

/* Desktop & Tablet: split 6/6 (colonnes 1-6 / 7-12) */
.recipe-info {
  grid-column: 1 / 7;
}

.recipe-header h1 {
  margin: 0 0 var(--space-03) 0;
}

.ingredient-list {
  color: var(--color-text-50);
  margin: 0 0 var(--space-04) 0;
}

.times {
  margin-bottom: var(--space-04);
  color: var(--color-text);
}

.image-container {
  grid-column: 7 / -1;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--radius-02);
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Mobile: empilé */
@media (max-width: 480px) {
  .recipe-info {
    grid-column: 1 / -1;
  }

  .image-container {
    grid-column: 1 / -1;
  }
}
</style>
