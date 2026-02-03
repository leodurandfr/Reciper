<template>
  <router-link :to="`/recipe/${recipe.id}`" class="recipe-card">
    <div class="image-container">
      <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title" @error="handleImageError" />
      <div v-else class="placeholder-image">Pas d'image</div>
    </div>
    <h3 class="heading-03">{{ recipe.title }}</h3>
    <div class="meta">
      <Tag v-if="recipe.prep_time" label="Préparation" :value="`${recipe.prep_time}min`" />
      <Tag v-if="recipe.cook_time" label="Cuisson" :value="`${recipe.cook_time}min`" />
    </div>
  </router-link>
</template>

<script setup>
import Tag from './Tag.vue'

defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})

function handleImageError(e) {
  e.target.style.display = 'none'
}
</script>

<style scoped>
.recipe-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-05);
  padding: var(--space-05-fixed);
  background: var(--color-background-neutral);
  border-radius: var(--radius-07);
  text-decoration: none;
  color: inherit;
  transition: transform var(--transition-fast);
}

.recipe-card:hover {
  transform: translateY(-4px);
}

.image-container {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--radius-03);
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
}

.recipe-card h3 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-01);
  margin-top: auto;
}
</style>
