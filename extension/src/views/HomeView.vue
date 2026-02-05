<template>
  <div class="home">
    <AppTabs />
    <div v-if="error" class="error">{{ error }}</div>
    <RecipeList v-else-if="!loading" :recipes="recipes" :show-favorites-only="favoritesOnly" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, toRef } from 'vue'
import { getAllRecipes } from '../services/db.js'
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
    recipes.value = await getAllRecipes({ favoritesOnly: props.favoritesOnly })
  } catch (err) {
    console.error('Erreur chargement recettes:', err)
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
