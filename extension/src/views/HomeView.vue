<template>
  <div class="home">
    <AppTabs />
    <div v-if="error" class="error">{{ error }}</div>
    <RecipeList v-else-if="!loading" :recipes="filteredRecipes" :show-favorites-only="favoritesOnly" :search-query="searchQuery" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAllRecipes } from '../services/db.js'
import { useSearch } from '../composables/useSearch.js'
import RecipeList from '../components/RecipeList.vue'
import AppTabs from '../components/AppTabs.vue'

const props = defineProps({
  favoritesOnly: {
    type: Boolean,
    required: true,
  },
})

const { t } = useI18n()
const recipes = ref([])
const loading = ref(true)
const error = ref('')

// Search integration
const { searchQuery } = useSearch()

// Filter recipes based on search query
const filteredRecipes = computed(() => {
  if (!searchQuery.value.trim()) {
    return recipes.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return recipes.value.filter(recipe =>
    recipe.title?.toLowerCase().includes(query)
  )
})

// Numéro de la dernière requête : une réponse plus ancienne arrivée en retard est ignorée
let fetchId = 0

// silent : rechargement en arrière-plan, sans repasser par l'état de chargement
async function fetchRecipes({ silent = false } = {}) {
  const id = ++fetchId
  if (!silent) loading.value = true
  try {
    const result = await getAllRecipes({ favoritesOnly: props.favoritesOnly })
    if (id !== fetchId) return
    recipes.value = result
    error.value = ''
  } catch (err) {
    if (id !== fetchId) return
    console.error('Erreur chargement recettes:', err)
    error.value = t('home.errorLoading')
  } finally {
    if (id === fetchId) loading.value = false
  }
}

watch(toRef(props, 'favoritesOnly'), () => fetchRecipes())

// Recharger la liste quand l'index change (import, suppression depuis les réglages,
// recette récupérée dans un autre onglet, etc.)
function handleStorageChange(changes, areaName) {
  if (areaName === 'local' && changes.recipes_index) {
    fetchRecipes({ silent: true })
  }
}

onMounted(() => {
  fetchRecipes()
  globalThis.chrome?.storage?.onChanged?.addListener(handleStorageChange)
})

onUnmounted(() => {
  globalThis.chrome?.storage?.onChanged?.removeListener(handleStorageChange)
})
</script>

<style scoped>
.home {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
}

.error {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-06);
  background: var(--color-background-neutral);
  border-radius: var(--radius-02);
  color: var(--color-brand);
}
</style>
