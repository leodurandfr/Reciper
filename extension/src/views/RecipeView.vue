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
import { ref, watchEffect, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { getRecipe, toggleFavorite } from '../services/db.js'
import { parseInstructions } from '../composables/useIngredientMatcher.js'
import { useHeaderButtons } from '../composables/useHeaderButtons.js'
import { useScrollPosition } from '../composables/useScrollPosition.js'
import RecipeDetail from '../components/RecipeDetail.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const error = ref('')
const togglingFavorite = ref(false)

// Vérifie si on a un historique de navigation interne (hors /loading).
// history.state n'est pas réactif : la valeur est lue une fois au setup
const historyBack = window.history.state?.back
const hasInternalHistory = !!historyBack && !historyBack.includes('/loading')

// Scroll position restoration
const { markForRestore } = useScrollPosition()

// URL de la page précédente (transmise depuis le service worker via la loading page).
// Seulement http(s) : une page d'extension ne peut pas naviguer vers chrome://newtab/ par exemple
const referrerUrl = /^https?:\/\//i.test(route.query.referrerUrl || '') ? route.query.referrerUrl : ''

function handleBack() {
  markForRestore()
  if (hasInternalHistory) {
    router.back()
  } else {
    router.push('/favorites')
  }
}

async function handleBackToSite() {
  // Sinon le service worker intercepte de nouveau la navigation et renvoie l'onglet dans Reciper
  if (globalThis.chrome?.runtime?.sendMessage) {
    await chrome.runtime.sendMessage({ type: 'BYPASS_URL', url: referrerUrl }).catch(() => {})
  }
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

    // Ajouter les instructions parsées
    recipeData.parsed_instructions = parseInstructions(recipeData.instructions || [])

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
  updatedRecipe.parsed_instructions = parseInstructions(updatedRecipe.instructions || [])
  recipe.value = updatedRecipe
}

function handleRecipeDeleted() {
  router.push('/favorites')
}

// Header buttons via composable (rendered by AppHeader)
const { leftButton, rightButton } = useHeaderButtons()

// Dans un watchEffect pour que le libellé suive un changement de langue
watchEffect(() => {
  leftButton.value = referrerUrl
    ? { label: t('nav.back'), iconLeft: 'chevron-left', handler: handleBackToSite }
    : { label: hasInternalHistory ? t('nav.back') : t('nav.myRecipes'), iconLeft: 'chevron-left', handler: handleBack }
})

watchEffect(() => {
  if (recipe.value) {
    rightButton.value = {
      label: togglingFavorite.value
        ? '...'
        : recipe.value.is_favorite ? t('recipe.removeFavorite') : t('recipe.addFavorite'),
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
  color: var(--color-brand);
}
</style>
