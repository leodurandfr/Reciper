<template>
  <div class="recipe-list">
    <p v-if="recipes.length === 0" class="empty-state">
      {{ showFavoritesOnly
        ? $t('home.emptyFavorites')
        : $t('home.emptyHistory')
      }}
    </p>
    <RecipeCard v-for="(recipe, index) in recipes" :key="recipe.id" :recipe="recipe" :style="{ '--i': index }" />
  </div>
</template>

<script setup>
import RecipeCard from './RecipeCard.vue'

defineProps({
  recipes: {
    type: Array,
    required: true,
  },
  showFavoritesOnly: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.recipe-list {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  gap: var(--grid-gutter);
}

/* xl (>1024px): 4 cards par ligne (span 3 sur 12 colonnes) */
.recipe-list :deep(.recipe-card) {
  grid-column: span 3;
  min-width: 0;
  animation: stagger-in 300ms ease-out both;
  animation-delay: calc(150ms + var(--i) * 50ms);
}

@keyframes stagger-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--color-text);
  padding: var(--space-07);
  background: var(--color-background-neutral);
  border-radius: var(--radius-02);
}

/* lg (768-1024px): 3 cards par ligne (span 4 sur 12 colonnes) */
@media (max-width: 1024px) {
  .recipe-list :deep(.recipe-card) {
    grid-column: span 4;
  }
}

/* md (480-768px): 2 cards par ligne (span 6 sur 12 colonnes) */
@media (max-width: 768px) {
  .recipe-list :deep(.recipe-card) {
    grid-column: span 6;
  }
}

/* sm (<480px): 1 card par ligne (span 4 sur 4 colonnes = full width) */
@media (max-width: 480px) {
  .recipe-list :deep(.recipe-card) {
    grid-column: span 4;
  }
}
</style>
