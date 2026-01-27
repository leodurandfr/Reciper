<template>
  <div class="home">
    <AppTabs />
    <div v-if="loading" class="loading">Chargement des recettes...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <RecipeList v-else :recipes="recipes" :show-favorites-only="favoritesOnly" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, toRef } from 'vue'
import { getRecipes } from '../services/api'
import RecipeList from '../components/RecipeList.vue'
import AppTabs from '../components/AppTabs.vue'

const props = defineProps({
  favoritesOnly: {
    type: Boolean,
    required: true,
  },
})

const recipes = ref([])
const loading = ref(true)
const error = ref('')

async function fetchRecipes() {
  loading.value = true
  error.value = ''
  try {
    recipes.value = await getRecipes(props.favoritesOnly)
  } catch (err) {
    error.value = 'Erreur lors du chargement des recettes'
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

.loading,
.error {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-06);
  background: white;
  border-radius: var(--radius-02);
}

.error {
  color: #e74c3c;
}
</style>
