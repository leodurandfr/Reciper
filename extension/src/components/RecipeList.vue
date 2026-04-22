<template>
  <div class="recipe-list">
    <div v-if="recipes.length === 0" class="empty-state">
      <img src="@/assets/ingredients/carrot.png" alt="" class="empty-state__image" />
      <p class="heading-03">{{ emptyMessage }}</p>
    </div>
    <RecipeCard v-for="(recipe, index) in recipes" :key="recipe.id" :recipe="recipe" :style="{ '--i': index }" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RecipeCard from './RecipeCard.vue'

const props = defineProps({
  recipes: {
    type: Array,
    required: true,
  },
  showFavoritesOnly: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: '',
  },
})

const { t } = useI18n()

const emptyMessage = computed(() => {
  if (props.searchQuery.trim()) {
    return t('search.noResults')
  }
  return props.showFavoritesOnly
    ? t('home.emptyFavorites')
    : t('home.emptyHistory')
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
  animation: stagger-in 300ms ease-out both;
  animation-delay: 150ms;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-05);
  text-align: center;
  color: var(--color-text);
  padding: var(--space-09) var(--space-07);
  background: var(--color-background-neutral);
  border-radius: var(--radius-07);
}

.empty-state__image {
  width: 96px;
  height: 96px;
  object-fit: contain;
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
