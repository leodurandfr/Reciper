<template>
  <Teleport to="#header-left">
    <button class="header-btn" @click="router.back()">← Retour</button>
  </Teleport>
  <div class="recipe-view">
    <div v-if="loading" class="loading">Chargement de la recette...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <RecipeDetail
      v-else
      :recipe="recipe"
      @favorite-toggled="handleFavoriteToggled"
      @recipe-updated="handleRecipeUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRecipe } from '../services/api'
import RecipeDetail from '../components/RecipeDetail.vue'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const loading = ref(true)
const error = ref('')

async function fetchRecipe() {
  try {
    recipe.value = await getRecipe(route.params.id)
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'Recette non trouvée'
    } else {
      error.value = 'Erreur lors du chargement de la recette'
    }
  } finally {
    loading.value = false
  }
}

function handleFavoriteToggled(isFavorite) {
  if (recipe.value) {
    recipe.value.is_favorite = isFavorite
  }
}

function handleRecipeUpdated(updatedRecipe) {
  recipe.value = updatedRecipe
}

onMounted(fetchRecipe)
</script>

<style scoped>
.recipe-view {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
}

.loading,
.error {
  text-align: center;
  padding: var(--space-06);
  background: white;
  border-radius: var(--radius-02);
}

.error {
  color: #e74c3c;
}
</style>
