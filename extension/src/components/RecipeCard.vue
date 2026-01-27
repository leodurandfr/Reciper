<template>
  <router-link :to="`/recipe/${recipe.id}`" class="recipe-card">
    <div class="image-container">
      <img
        v-if="recipe.image_url"
        :src="recipe.image_url"
        :alt="recipe.title"
        @error="handleImageError"
      />
      <div v-else class="placeholder-image">Pas d'image</div>
    </div>
    <div class="content">
      <h3 class="heading-03">{{ recipe.title }}</h3>
      <div class="meta body-small">
        <span v-if="recipe.prep_time" class="time">Préparation {{ recipe.prep_time }}min</span>
        <span v-if="recipe.cook_time" class="time">Cuisson {{ recipe.cook_time }}min</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
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
  display: block;
  background: white;
  border-radius: var(--radius-02);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.image-container {
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #95a5a6;
}

.content {
  padding: var(--space-04);
}

.content h3 {
  margin-bottom: var(--space-02);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  justify-content: space-between;
  color: #7f8c8d;
}

.time {
  color: #3498db;
  font-weight: 500;
}

</style>
