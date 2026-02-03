<template>
  <header class="recipe-header">
    <div class="recipe-info">
      <h1 class="heading-01">{{ recipe.title }}</h1>

      <div class="times" v-if="recipe.prep_time || recipe.cook_time">
        <Tag v-if="recipe.prep_time" label="Préparation" :value="`${recipe.prep_time}min`" size="body-medium" />
        <Tag v-if="recipe.cook_time" label="Cuisson" :value="`${recipe.cook_time}min`" size="body-medium" />
      </div>
    </div>

    <div v-if="recipe.image_url" class="image-container">
      <img :src="recipe.image_url" :alt="recipe.title" class="recipe-image" />
    </div>
  </header>
</template>

<script setup>
import Tag from '../Tag.vue'

defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.recipe-header {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: stretch;
  padding: var(--space-03);
  background: var(--color-background-neutral);
  border-radius: var(--radius-07);
}

/* Desktop & Tablet: split 6/6 (colonnes 1-6 / 7-12) */
.recipe-info {
  grid-column: 1 / 7;
  display: flex;
  flex-direction: column;
  padding: calc(var(--space-06) - var(--space-03)) 0 calc(var(--space-06) - var(--space-03)) calc(var(--space-06) - var(--space-03));
}

.recipe-header h1 {
  margin: 0 0 var(--space-03) 0;
}

.times {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-01);
  margin-top: auto;
}

.image-container {
  grid-column: 7 / -1;
  aspect-ratio: 6 / 4;
  overflow: hidden;
  border-radius: var(--radius-05);
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
