<template>
  <div class="recipe-view">
    <div v-if="error" class="error">{{ error }}</div>
    <RecipeDetail
      v-else-if="recipe"
      :recipe="recipe"
      @recipe-updated="handleRecipeUpdated"
      @recipe-deleted="handleRecipeDeleted"
    />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { getRecipe, toggleFavorite } from '../services/db.js'
import { parseInstructionsWithIngredients } from '../composables/useIngredientMatcher.js'
import { useHeaderButtons } from '../composables/useHeaderButtons.js'
import { useScrollPosition } from '../composables/useScrollPosition.js'
import RecipeDetail from '../components/RecipeDetail.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const error = ref('')
const togglingFavorite = ref(false)
const localIsFavorite = ref(null)

const isFavorite = computed(() => {
  return localIsFavorite.value !== null ? localIsFavorite.value : recipe.value?.is_favorite
})

// Vérifie si on a un historique de navigation interne (hors /loading)
const hasInternalHistory = computed(() => {
  const back = window.history.state?.back
  return back && !back.includes('/loading')
})

// Scroll position restoration
const { markForRestore } = useScrollPosition()

// URL de la page précédente (transmise depuis le service worker via la loading page)
const referrerUrl = route.query.referrerUrl

function handleBack() {
  markForRestore()
  if (hasInternalHistory.value) {
    router.back()
  } else {
    router.push('/favorites')
  }
}

function handleBackToSite() {
  window.location.href = referrerUrl
}

async function fetchRecipe() {
  try {
    const id = parseInt(route.params.id, 10)
    const recipeData = await getRecipe(id)

    if (!recipeData) {
      error.value = t('recipe.notFound')
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
    error.value = t('home.errorLoading')
  }
}

async function handleToggleFavorite() {
  togglingFavorite.value = true
  try {
    const updated = await toggleFavorite(recipe.value.id)
    localIsFavorite.value = updated.is_favorite
    recipe.value.is_favorite = updated.is_favorite
  } catch (err) {
    console.error('Erreur toggle favori:', err)
    alert(t('errors.favoriteFailed'))
  } finally {
    togglingFavorite.value = false
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

// Header buttons via composable (rendered by AppHeader)
const { leftButton, rightButton } = useHeaderButtons()

leftButton.value = referrerUrl
  ? { label: t('nav.back'), iconLeft: 'chevron-left', handler: handleBackToSite }
  : { label: hasInternalHistory.value ? t('nav.back') : t('nav.myRecipes'), iconLeft: 'chevron-left', handler: handleBack }

watchEffect(() => {
  if (recipe.value) {
    rightButton.value = {
      label: togglingFavorite.value
        ? '...'
        : isFavorite.value ? t('recipe.removeFavorite') : t('recipe.addFavorite'),
      handler: handleToggleFavorite,
      disabled: togglingFavorite.value,
    }
  }
})

onBeforeRouteLeave(() => {
  leftButton.value = null
  rightButton.value = null
})

onMounted(fetchRecipe)
</script>

<style scoped>
.recipe-view {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
}

.error {
  text-align: center;
  padding: var(--space-06);
  background: var(--color-background-neutral);
  border-radius: var(--radius-02);
}

.error {
  color: var(--color-brand);
}
</style>
