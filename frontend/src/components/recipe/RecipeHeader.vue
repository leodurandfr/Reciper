<template>
  <header class="recipe-header">
    <div class="recipe-info">
      <h1 class="heading-01">{{ recipe.title }}</h1>

      <ul v-if="ingredientNames.length" class="ingredient-tags">
        <li v-for="name in ingredientNames" :key="name" class="body-small">{{ name }}</li>
      </ul>

      <div class="times body-small" v-if="recipe.prep_time || recipe.cook_time">
        <span v-if="recipe.prep_time">Preparation {{ recipe.prep_time }}min</span>
        <span v-if="recipe.prep_time && recipe.cook_time"> / </span>
        <span v-if="recipe.cook_time">Cuisson {{ recipe.cook_time }}min</span>
      </div>
    </div>

    <img
      v-if="recipe.image_url"
      :src="recipe.image_url"
      :alt="recipe.title"
      class="recipe-image"
    />
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
  margin: 0 0 var(--space-04) 0;
}

.ingredient-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-02);
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-04) 0;
}

.ingredient-tags li {
  background: #f0f0f0;
  padding: var(--space-01) var(--space-03);
  border-radius: var(--radius-04);
}

.times {
  margin-bottom: var(--space-04);
  color: #666;
}

.recipe-image {
  grid-column: 7 / -1;
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: var(--radius-02);
}

/* Mobile: empilé */
@media (max-width: 480px) {
  .recipe-info {
    grid-column: 1 / -1;
  }

  .recipe-image {
    grid-column: 1 / -1;
  }
}
</style>
