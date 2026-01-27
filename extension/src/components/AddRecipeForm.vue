<template>
  <form @submit.prevent="handleSubmit" class="add-recipe-form col-full">
    <div class="input-group">
      <input
        v-model="url"
        type="url"
        placeholder="Coller l'URL d'une recette..."
        required
        :disabled="loading"
      />
      <button type="submit" class="btn-primary" :disabled="loading || !url">
        {{ loading ? 'Chargement...' : 'Ajouter' }}
      </button>
    </div>
    <p v-if="error" class="error body-small">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { scrapeRecipe } from '../services/api.js'
import { addRecipe, getRecipeByUrl } from '../services/db.js'

const emit = defineEmits(['recipe-added'])

const router = useRouter()
const url = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!url.value) return

  loading.value = true
  error.value = ''

  try {
    // Vérifier si la recette existe déjà
    const existing = await getRecipeByUrl(url.value)
    if (existing) {
      // Rediriger vers la recette existante
      router.push(`/recipe/${existing.id}`)
      url.value = ''
      return
    }

    // Scraper la recette via le backend
    const scrapedRecipe = await scrapeRecipe(url.value)

    // Sauvegarder dans IndexedDB
    const savedRecipe = await addRecipe(scrapedRecipe)

    emit('recipe-added', savedRecipe)
    url.value = ''

    // Rediriger vers la nouvelle recette
    router.push(`/recipe/${savedRecipe.id}`)
  } catch (err) {
    console.error('Erreur ajout recette:', err)
    error.value = err.message || 'Erreur lors de l\'ajout de la recette'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.add-recipe-form {
  margin-bottom: var(--space-06);
}

.input-group {
  display: flex;
  gap: var(--space-04);
}

.input-group input {
  flex: 1;
}

.error {
  color: var(--color-error);
  margin-top: var(--space-02);
}
</style>
