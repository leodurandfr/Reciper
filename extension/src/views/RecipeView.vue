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
      @recipe-deleted="handleRecipeDeleted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRecipe } from '../services/db.js'
import { parseInstructionsWithIngredients } from '../composables/useIngredientMatcher.js'
import RecipeDetail from '../components/RecipeDetail.vue'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const loading = ref(true)
const error = ref('')

async function fetchRecipe() {
  try {
    const id = parseInt(route.params.id, 10)
    const recipeData = await getRecipe(id)

    if (!recipeData) {
      error.value = 'Recette non trouvée'
      return
    }

    // Ajouter les instructions parsées avec les ingrédients associés
    recipeData.parsed_instructions = parseInstructionsWithIngredients(
      recipeData.instructions || [],
      recipeData.ingredients || []
    )

    recipe.value = recipeData
  } catch (err) {
    console.error('Erreur chargement recette:', err)
    error.value = 'Erreur lors du chargement de la recette'
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
  // Recalculer les instructions parsées
  updatedRecipe.parsed_instructions = parseInstructionsWithIngredients(
    updatedRecipe.instructions || [],
    updatedRecipe.ingredients || []
  )
  recipe.value = updatedRecipe
}

function handleRecipeDeleted() {
  router.push('/favorites')
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
  background: var(--color-background-neutral);
  border-radius: var(--radius-02);
}

.error {
  color: var(--color-error);
}
</style>
