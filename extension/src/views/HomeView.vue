<template>
  <div class="home">
    <AppTabs />
    <div v-if="error" class="error">{{ error }}</div>
    <RecipeList v-else-if="!loading" :recipes="filteredRecipes" :show-favorites-only="favoritesOnly" :search-query="searchQuery" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, toRef } from 'vue'
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

async function fetchRecipes() {
  loading.value = true
  error.value = ''
  try {
    recipes.value = await getAllRecipes({ favoritesOnly: props.favoritesOnly })
  } catch (err) {
    console.error('Erreur chargement recettes:', err)
    error.value = t('home.errorLoading')
  } finally {
    loading.value = false
  }
}

watch(toRef(props, 'favoritesOnly'), fetchRecipes)

onMounted(fetchRecipes)
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
}

.error {
  color: var(--color-brand);
}
</style>
