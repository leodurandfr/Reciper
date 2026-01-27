<template>
  <form @submit.prevent="handleSubmit" class="add-recipe-form">
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
import { createRecipe } from '../services/api'

const emit = defineEmits(['recipe-added'])

const url = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!url.value) return

  loading.value = true
  error.value = ''

  try {
    const recipe = await createRecipe(url.value)
    emit('recipe-added', recipe)
    url.value = ''
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erreur lors de l\'ajout de la recette'
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
  color: #e74c3c;
  margin-top: var(--space-02);
}
</style>
