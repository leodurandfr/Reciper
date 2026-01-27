<template>
  <div class="recipe-list">
    <p v-if="recipes.length === 0" class="empty-state">
      {{ showFavoritesOnly
        ? 'Aucune recette en favoris. Ajoutez des recettes a vos favoris depuis leur page de detail !'
        : 'Aucune recette sauvegardee. Utilisez l\'extension Chrome pour en ajouter !'
      }}
    </p>
    <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
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
  row-gap: var(--space-05);
  margin-top: var(--space-06);
}

/* xl (>1280px): 4 cards par ligne (span 3 sur 12 colonnes) */
.recipe-list :deep(.recipe-card) {
  grid-column: span 3;
  min-width: 0;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: #7f8c8d;
  padding: var(--space-07);
  background: white;
  border-radius: var(--radius-02);
}

/* lg (768-1280px): 3 cards par ligne (span 4 sur 12 colonnes) */
@media (max-width: 1280px) {
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
